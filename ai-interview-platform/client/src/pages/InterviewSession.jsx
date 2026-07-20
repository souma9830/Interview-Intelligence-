import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Mic, MicOff, Send, RefreshCw, Volume2, Sparkles, ChevronRight, Video, Camera, Play, AlertTriangle } from 'lucide-react';
import VideoRecorder from '../components/Telemetry/VideoRecorder';
import { getAuthHeader } from '../utils/authHeaders';
import { useProctor } from '../hooks/useProctor';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export default function InterviewSession({ globalState, setGlobalState, setCurrentTab }) {
  const selectedRole = globalState.role || 'Frontend Engineer';
  const interviewId = globalState.interviewId || 'demo_session_active';
  const isOnline = useOnlineStatus();

  // Redirect if no resume uploaded
  useEffect(() => {
    const verifyAccess = async () => {
      if (!globalState.resumeUploaded) {
        const token = localStorage.getItem('camsense_token');
        if (token) {
          try {
            const res = await fetch('/api/resume/status', { headers: { Authorization: `Bearer ${token}` } });
            const json = await res.json();
            if (!json.success || !json.data?.hasResume) {
              setCurrentTab('setup');
              return;
            }
          } catch {
            setCurrentTab('setup');
            return;
          }
        } else {
          setCurrentTab('setup');
          return;
        }
      }
    };
    verifyAccess();
  }, [globalState.resumeUploaded, setCurrentTab]);

  // Initialize telemetry logs
  useEffect(() => {
    setGlobalState(prev => ({
      ...prev,
      telemetryLogs: [{ time: new Date().toLocaleTimeString(), event: 'Proctored session initialized' }]
    }));
  }, [setGlobalState]);


  const [questions, setQuestions] = useState(() => {
    if (globalState.questions && globalState.questions.length > 0) {
      return globalState.questions.filter(q => q.category !== 'coding');
    }
    const fallbackPool = [
      { questionText: 'Explain the major architectural constraints of this track.', category: 'technical' },
      { questionText: 'How do you profile, identify, and eliminate performance bottlenecks?', category: 'technical' },
      { questionText: 'How do you resolve design conflicts inside highly concurrent codebases?', category: 'technical' },
      { questionText: 'Walk me through how you would debug a memory leak in a production application.', category: 'technical' },
      { questionText: 'How do you decide between building a feature in-house versus using a third-party library?', category: 'technical' },
      { questionText: 'Describe your approach to handling backward compatibility when releasing breaking changes.', category: 'technical' },
      { questionText: 'How do you ensure data consistency in a system with multiple data stores?', category: 'technical' },
      { questionText: 'Explain how you would design a robust error handling strategy for a distributed system.', category: 'technical' },
      { questionText: 'What is your approach to capacity planning and load testing before a major product launch?', category: 'technical' },
      { questionText: 'How do you handle schema evolution in a database-backed application over time?', category: 'technical' },
    ];
    const shuffled = [...fallbackPool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [systemAlert, setSystemAlert] = useState('System ready. Press Play to begin.');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCheatWarningVisible, setIsCheatWarningVisible] = useState(false);

  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraInitialized, setCameraInitialized] = useState(false);
  const recognitionRef = useRef(null);

  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  // Keep a stable ref to the submit handler so the interval callback never
  // captures a stale closure when the timer fires at 0.
  const handleAnswerSubmitRef = useRef(null);

  useEffect(() => {
    if (!timerActive) return;

    // A single interval that ticks every second. Using a functional state update
    // (prev => ...) avoids capturing stale timeLeft in the closure, and the ref
    // ensures we always call the latest version of handleAnswerSubmit.
    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          setSystemAlert('Time is up. Saving your answer...');
          // Defer the submit call so it runs after the state update cycle completes.
          setTimeout(() => handleAnswerSubmitRef.current?.(true), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
    // Only re-run when timerActive flips — not on every timeLeft tick.
  }, [timerActive]);

  const startCamera = async () => {
    if (cameraInitialized) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setCameraInitialized(true);
    } catch (err) {
      console.warn('[Camera] Init failed:', err.message);
      setCameraActive(false);
      setCameraInitialized(true);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (hasStarted && !cameraInitialized) {
      startCamera();
    }
  }, [hasStarted, cameraInitialized]);

  const handleViolation = useCallback(() => {
    setIsCheatWarningVisible(true);
    if (window.speechSynthesis) window.speechSynthesis.pause();
    if (recognitionRef.current) recognitionRef.current.stop();
    if (window.simInterval) clearInterval(window.simInterval);
    setIsRecording(false);
    setTimerActive(false);
    const timestamp = new Date().toLocaleTimeString();
    setGlobalState(prev => ({
      ...prev,
      violationCount: (prev.violationCount || 0) + 1,
      telemetryLogs: [...(prev.telemetryLogs || []), { time: timestamp, event: 'Fullscreen exited / tab switched (Violation)' }],
    }));
    // setGlobalState is stable (from useState), so it is safe to list here.
  }, [setGlobalState]);

  // useProctor expects positional args: (active: boolean, onViolation: fn)
  // Passing an object literal was silently treating the object as a truthy
  // value for 'active', and onViolation was never registered.
  useProctor(hasStarted, handleViolation);

  const handleBeginSession = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.warn("Fullscreen request failed", err);
    }
    const timestamp = new Date().toLocaleTimeString();
    setGlobalState(prev => ({
      ...prev,
      telemetryLogs: [...(prev.telemetryLogs || []), { time: timestamp, event: 'Proctored session started' }]
    }));
    setHasStarted(true);
  };

  const speakQuestion = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = questions[currentIdx]?.questionText || '';
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name.toLowerCase().includes('google')) || voices[0];
    if (voice) utterance.voice = voice;
    utterance.rate = 1.0;
    utterance.pitch = 0.95;
    utterance.onstart = () => { setIsAiSpeaking(true); setSystemAlert('AI is speaking…'); };
    utterance.onend = () => {
      setIsAiSpeaking(false);
      setSystemAlert('Your turn. Speak your answer.');
      startVoiceRecording();
      setTimeLeft(60);
      setTimerActive(true);
    };
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!hasStarted) return;
    const t = setTimeout(() => speakQuestion(), 1200);
    return () => clearTimeout(t);
  }, [currentIdx, hasStarted]);

  const startVoiceRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { simulateFallback(); return; }
    if (recognitionRef.current) recognitionRef.current.stop();
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onstart = () => { setIsRecording(true); setSystemAlert('Listening…'); };
    let debounceTimer;
    rec.onresult = e => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
      }
      if (final) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          setUserTranscript(prev => prev + final);
        }, 250);
      }
    };
    rec.onerror = e => { if (e.error === 'not-allowed') simulateFallback(); };
    rec.onend = () => setIsRecording(false);
    recognitionRef.current = rec;
    rec.start();
  };

  const simulateFallback = () => {
    setIsRecording(true);
    setUserTranscript('');
    setSystemAlert('Simulating transcript input…');
    const sample = [
      'I approach platform performance by introducing memory caps and Redis cache layers. Splitting rendering structures across frames keeps the browser painting thread active.',
      'Optimizing cumulative layout shifts depends on rigid layouts and lazy loading for below-the-fold elements.',
      'To resolve database lock contention, I use row-level locking, optimistic sync strategies, and batch transaction partitioning.',
    ];
    const words = sample[currentIdx % sample.length].split(' ');
    let idx = 0;
    const iv = setInterval(() => {
      if (idx < words.length) { setUserTranscript(p => p + (p ? ' ' : '') + words[idx]); idx++; }
      else { clearInterval(iv); setIsRecording(false); setSystemAlert('Done. Click Submit when ready.'); }
    }, 260);
    window.simInterval = iv;
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    if (window.simInterval) clearInterval(window.simInterval);
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) { stopVoiceRecording(); setSystemAlert('Recording paused.'); }
    else { setUserTranscript(''); startVoiceRecording(); }
  };

  const handleRequestFollowUp = async () => {
    if (!userTranscript) { setSystemAlert('Record an answer first.'); return; }
    stopVoiceRecording(); setTimerActive(false);
    setSystemAlert('Generating follow-up question…');
    try {
      const res = await fetch('/api/interview/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          interviewId: interviewId === 'demo_session_active' ? undefined : interviewId,
          questionIndex: currentIdx,
          candidateAnswer: userTranscript,
          originalQuestionText: questions[currentIdx]?.questionText,
          category: questions[currentIdx]?.category,
          role: selectedRole,
          experience: globalState.experience,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const updated = [...questions];
        updated.splice(currentIdx + 1, 0, { questionText: json.data.followUpQuestion, category: questions[currentIdx].category });
        setQuestions(updated);
        setUserTranscript('');
        setCurrentIdx(p => p + 1);
        setSystemAlert('Follow-up loaded.');
      }
    } catch {
      const fallbacks = [
        '[Follow-up] How would you measure memory constraints under scale?',
        '[Follow-up] How would you configure error boundaries to capture edge-case crashes?',
      ];
      const updated = [...questions];
      updated.splice(currentIdx + 1, 0, { questionText: fallbacks[currentIdx % fallbacks.length], category: questions[currentIdx].category });
      setQuestions(updated);
      setUserTranscript('');
      setCurrentIdx(p => p + 1);
      setSystemAlert('Follow-up loaded (offline mode).');
    }
  };

  const handleAnswerSubmit = async (isTimeoutOrEvent) => {
    const isTimeout = isTimeoutOrEvent === true;
    const text = userTranscript?.trim() || '';
    if (!text && !isTimeout) { setSystemAlert('Please provide an answer first.'); return; }
    
    stopVoiceRecording(); setTimerActive(false); setIsEvaluating(true);
    setSystemAlert(text ? 'Evaluating your response…' : 'Time limit reached. 0 points awarded.');
    
    let answerScore = 0;
    try {
      if (text) {
        const token = localStorage.getItem('camsense_token') || 'demo_token_active';
        const res = await fetch('/api/interview/evaluate-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ interviewId: interviewId === 'demo_session_active' ? undefined : interviewId, questionIndex: currentIdx, candidateAnswer: text, question: questions[currentIdx]?.questionText, category: questions[currentIdx]?.category, role: selectedRole }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          const parsed = Number(json.data.score);
          answerScore = Number.isFinite(parsed) ? parsed : 0;
          setSystemAlert(`Score: ${answerScore}/10 — ${json.data.feedback}`);
          await new Promise(r => setTimeout(r, 4000));
        }
      } else {
        await new Promise(r => setTimeout(r, 2000)); // Short delay to show the 0 points alert
      }
    } catch { /* continue */ }

    setIsEvaluating(false);
    const answers = [...(globalState.userAnswers || [])];
    answers[currentIdx] = text || 'No answer provided (timeout)';

    const scores = [...(globalState.questionScores || [])];
    scores[currentIdx] = text ? Math.round(answerScore * 10) : 0; 

    setGlobalState(p => ({ ...p, userAnswers: answers, questionScores: scores }));

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setUserTranscript('');
      setTimeLeft(60);
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
      setCameraActive(false);
      setCurrentTab('coding');
    }
  };

  // Sync the ref so the timer interval callback always has access to the
  // most recent version of handleAnswerSubmit without needing it in deps.
  handleAnswerSubmitRef.current = handleAnswerSubmit;


  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#e8e8e8', position: 'relative' }}>

      {/* Start Overlay */}
      <Modal
        open={!hasStarted}
        title="Ready for your interview?"
        description="Your webcam and microphone are ready. The AI interviewer will ask you questions based on your profile. Answer each one to proceed."
        icon={<Play size={28} color="#fff" />}
        width="520px"
        footer={
          <button
            onClick={handleBeginSession}
            style={{ padding: '12px 32px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            Begin Session <ChevronRight size={16} />
          </button>
        }
      />

      {!isOnline && (
        <div style={{ background: '#ef4444', color: '#fff', padding: '10px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }} role="alert">
          <AlertTriangle size={16} />
          <span>You are currently offline. Proctor telemetry violations will be saved locally and synchronized once your connection is restored.</span>
        </div>
      )}

      {/* Session Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: '#111', border: '1px solid #222', borderRadius: '10px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#aaa', letterSpacing: '0.02em' }}>
            LIVE — <span style={{ color: '#e8e8e8' }}>{selectedRole} Track</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: '#aaa' }}>{currentIdx + 1} / {questions.length}</span>
          <div style={{ width: '120px', height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#fff', borderRadius: '2px', transition: 'width 0.4s ease' }} />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: '20px' }}>

        {/* LEFT — AI Avatar + Webcam */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* AI Avatar */}
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI Interviewer</span>
              <span style={{ fontSize: '11px', fontWeight: '500', color: isAiSpeaking ? '#e8e8e8' : '#888', background: isAiSpeaking ? '#1e1e1e' : 'transparent', padding: '3px 8px', borderRadius: '4px', border: '1px solid #2a2a2a' }}>
                {isAiSpeaking ? '● Speaking' : '○ Idle'}
              </span>
            </div>

            <div style={{ position: 'relative' }}>
              {isAiSpeaking && (
                <div style={{ position: 'absolute', inset: '-12px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s infinite' }} />
              )}
              <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: '#161616', border: `2px solid ${isAiSpeaking ? '#fff' : '#2a2a2a'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.3s' }}>
                <Bot size={40} color={isAiSpeaking ? '#fff' : '#888'} />
              </div>
            </div>

            {/* Sound bars */}
            <div style={{ height: '24px', display: 'flex', alignItems: 'flex-end', gap: '3px', justifyContent: 'center' }}>
              {isAiSpeaking ? (
                [16, 24, 10, 20, 14].map((h, i) => (
                  <span key={i} style={{ width: '4px', height: `${h}px`, background: '#e8e8e8', borderRadius: '2px', animation: `bounce 0.8s ${i * 0.15}s infinite alternate` }} />
                ))
              ) : (
                <span style={{ fontSize: '12px', color: '#888' }}>Channel stable</span>
              )}
            </div>
          </div>

          {/* Webcam / Telemetry Recorder */}
          <VideoRecorder
            isSessionActive={hasStarted}
            onRecordingComplete={(videoUrl) => {
              setGlobalState(prev => ({
                ...prev,
                recordedVideoUrl: videoUrl,
                telemetryLogs: [...(prev.telemetryLogs || []), { time: new Date().toLocaleTimeString(), event: 'Proctored recording compiled successfully' }]
              }));
            }}
          />
        </div>

        {/* RIGHT — Question + Transcript */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Question Card */}
          <div style={{ background: '#111', border: '1px solid #222', borderLeft: '3px solid #fff', borderRadius: '12px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#ccc', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '3px 8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {questions[currentIdx]?.category || 'technical'}
                </span>
                <button onClick={speakQuestion} aria-label="Read question aloud" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Read aloud">
                  <Volume2 size={13} color="#ccc" />
                </button>
              </div>
              <p style={{ fontSize: '17px', fontWeight: '500', color: '#e8e8e8', lineHeight: '1.6', margin: 0 }}>
                {questions[currentIdx]?.questionText}
              </p>
            </div>

            {/* Timer */}
            <div style={{ flexShrink: 0, position: 'relative', width: '68px', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} role="timer" aria-label={`${timeLeft} seconds remaining for this question`}>
              <svg style={{ position: 'absolute', width: '68px', height: '68px', transform: 'rotate(-90deg)' }} aria-hidden="true">
                <circle cx="34" cy="34" r="30" stroke="#222" strokeWidth="3" fill="none" />
                <circle cx="34" cy="34" r="30" stroke={timeLeft <= 5 ? '#ef4444' : timeLeft <= 15 ? '#f59e0b' : '#fff'} strokeWidth="3" fill="none"
                  strokeDasharray="188.5" strokeDashoffset={188.5 - (188.5 * timeLeft) / 60}
                  style={{ 
                    transition: 'stroke-dashoffset 1s linear, stroke 0.3s',
                    animation: timeLeft <= 15 ? 'pulse 1s infinite alternate' : 'none'
                  }} />
              </svg>
              <div style={{ textAlign: 'center', zIndex: 1 }}>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: timeLeft <= 5 ? '#ef4444' : timeLeft <= 15 ? '#f59e0b' : '#e8e8e8', 
                  lineHeight: 1,
                  animation: timeLeft <= 15 ? 'pulse 1s infinite alternate' : 'none'
                }}>{timeLeft}s</div>
                <div style={{ fontSize: '9px', color: '#aaa', letterSpacing: '0.05em', marginTop: '2px' }}>TIME</div>
              </div>
            </div>
          </div>

          {/* Transcript */}
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid #1e1e1e' }}>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#ccc' }}>Your Response</span>
              {isRecording && (
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#e8e8e8', display: 'flex', alignItems: 'center', gap: '5px', animation: 'pulse 1.5s infinite' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', display: 'inline-block' }} /> REC
                </span>
              )}
            </div>

            <div style={{ minHeight: '140px', background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '16px', fontSize: '15px', lineHeight: '1.65', color: '#d0d0d0' }}>
              {userTranscript || <span style={{ color: '#888', fontStyle: 'italic' }}>No response yet. Activate your mic to begin speaking…</span>}
            </div>

            {/* Status */}
            <div style={{ fontSize: '12px', color: '#aaa', textAlign: 'center', padding: '8px', background: '#0d0d0d', borderRadius: '6px', letterSpacing: '0.02em' }}>
              {systemAlert}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', paddingTop: '8px', borderTop: '1px solid #1e1e1e', flexWrap: 'wrap' }}>
              <button
                onClick={toggleRecording}
                disabled={isAiSpeaking || isEvaluating}
                style={{
                  padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: isAiSpeaking || isEvaluating ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '7px', border: 'none',
                  background: isAiSpeaking || isEvaluating ? '#1a1a1a' : isRecording ? '#2a2a2a' : '#fff',
                  color: isAiSpeaking || isEvaluating ? '#444' : isRecording ? '#e8e8e8' : '#000',
                  outline: isRecording ? '1px solid #555' : 'none', transition: 'all 0.2s',
                }}
              >
                {isRecording ? <><MicOff size={15} /> Stop Recording</> : <><Mic size={15} /> Start Recording</>}
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleRequestFollowUp}
                  disabled={!userTranscript || isAiSpeaking || isEvaluating}
                  style={{
                    padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: !userTranscript || isAiSpeaking || isEvaluating ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent',
                    border: '1px solid #2a2a2a', color: !userTranscript || isAiSpeaking || isEvaluating ? '#3a3a3a' : '#888', transition: 'all 0.2s',
                  }}
                >
                  <Sparkles size={14} /> Follow-up
                </button>

                <button
                  onClick={handleAnswerSubmit}
                  disabled={isAiSpeaking || isEvaluating}
                  style={{
                    padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: isAiSpeaking || isEvaluating ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #333',
                    background: isAiSpeaking || isEvaluating ? '#1a1a1a' : '#fff',
                    color: isAiSpeaking || isEvaluating ? '#444' : '#000', transition: 'all 0.2s',
                  }}
                >
                  {isEvaluating ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Evaluating…</> : <>{currentIdx < questions.length - 1 ? 'Save & Next' : 'Go to Coding'} <ChevronRight size={14} /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes bounce { from{transform:scaleY(0.4)} to{transform:scaleY(1)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      {/* Cheat Warning Overlay */}
      <Modal
        open={isCheatWarningVisible}
        title="Suspicious Activity Detected"
        description="You have exited fullscreen mode or switched tabs. This activity has been recorded and will negatively impact your final evaluation score. Please remain focused on the session."
        variant="danger"
        icon={<AlertTriangle size={28} color="#ff4444" />}
        iconBg="#270e0f"
        iconBorder="#ff4444"
        footer={
          <button
            onClick={async () => {
              try { await document.documentElement.requestFullscreen(); } catch (err) {}
              setIsCheatWarningVisible(false);
              if (window.speechSynthesis) window.speechSynthesis.resume();
              setTimerActive(true);
            }}
            style={{ padding: '12px 32px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            Resume Session <ChevronRight size={16} />
          </button>
        }
      />
    </div>
  );
}
