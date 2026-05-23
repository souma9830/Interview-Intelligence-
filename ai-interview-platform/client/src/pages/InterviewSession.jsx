import React, { useState, useEffect, useRef } from 'react';
import { Bot, Mic, MicOff, Send, RefreshCw, Volume2, Sparkles, ChevronRight, Video, Camera, Compass, Play, AlertTriangle } from 'lucide-react';

export default function InterviewSession({ globalState, setGlobalState, setCurrentTab }) {
  const selectedRole = globalState.role || 'Frontend Engineer';
  const interviewId = globalState.interviewId || 'demo_session_active';
  
  // Extract questions list from state or fallback to tracks
  const [questions, setQuestions] = useState(
    globalState.questions && globalState.questions.length > 0
      ? globalState.questions.filter(q => q.category !== 'coding')
      : [
          { questionText: "Explain major architectural constraints of this track.", category: 'technical' },
          { questionText: "How do you profile, identify, and eliminate performance bottlenecks?", category: 'technical' },
          { questionText: "How do you resolve design conflicts inside highly concurrent codebases?", category: 'technical' }
        ]
  );

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [systemAlert, setSystemAlert] = useState('System armed. Please play the question.');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Webcam states
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // Speech Recognition ref
  const recognitionRef = useRef(null);

  // Timer parameters (60 seconds per question)
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  // Countdown timer hook
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setSystemAlert('Timer expired! Saving transcript auto...');
          handleAnswerSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timerActive, timeLeft]);

  // Activate HTML5 camera stream
  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.warn('Webcam permission denied or unavailable:', err);
      setCameraError('Camera offline - stream simulation active');
    }
  };

  // Auto start camera on load
  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Text-To-Speech: Read question aloud
  const speakQuestion = () => {
    if (!window.speechSynthesis) {
      setSystemAlert('Speech synthesis unsupported on this browser.');
      return;
    }
    
    // Cancel any ongoing speaking
    window.speechSynthesis.cancel();
    
    const activeQuestionText = questions[currentIdx]?.questionText || 'Active Interview Question';
    const utterance = new SpeechSynthesisUtterance(activeQuestionText);
    
    // Choose premium robot/assistant voice
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('natural')) || voices[0];
    if (premiumVoice) utterance.voice = premiumVoice;
    
    utterance.rate = 1.0;
    utterance.pitch = 0.95;

    utterance.onstart = () => {
      setIsAiSpeaking(true);
      setSystemAlert('AI speaking. Please listen carefully...');
    };

    utterance.onend = () => {
      setIsAiSpeaking(false);
      setSystemAlert('AI finished speaking. Voice channels active. Speak now.');
      // Auto start recording & timer once speaking stops
      startVoiceRecording();
      setTimeLeft(60);
      setTimerActive(true);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Play question audio automatically on index shift
  useEffect(() => {
    if (!hasStarted) return;
    // Small delay to let speech engines load voices
    const timer = setTimeout(() => {
      speakQuestion();
    }, 1200);
    return () => clearTimeout(timer);
  }, [currentIdx, hasStarted]);

  // Speech-To-Text Recognition configuration
  const startVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Simulate transcription fallback typing
      simulateTranscriptionFallback();
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsRecording(true);
      setSystemAlert('Voice capturing engaged. Standard transcript channels logging...');
    };

    rec.onresult = (e) => {
      let finalStr = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          finalStr += e.results[i][0].transcript + ' ';
        }
      }
      if (finalStr) {
        setUserTranscript(prev => prev + finalStr);
      }
    };

    rec.onerror = (e) => {
      console.warn('Speech capture error:', e.error);
      if (e.error === 'not-allowed') {
        simulateTranscriptionFallback();
      }
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  // Transcription Sim Fallback if mic permission denied
  const simulateTranscriptionFallback = () => {
    setIsRecording(true);
    setUserTranscript('');
    setSystemAlert('Simulated text-transcription input triggered...');

    const responses = [
      "I approach core platform performance and microservice architectures by introducing strict memory caps and redis cache buffers. Splitting rendering structures over multiple frames allows the browser to keep painting threads active and optimize frame-rates.",
      "Optimizing cumulative layout shifts depends on configuring rigid layouts. We use size specifications on dynamic widget slots, prioritize critical CSS resources, and leverage lazy loaders for deep-scroll elements.",
      "To resolve high read-write database lock bottlenecks, I introduce row-level locking parameters, optimistic sync strategies, and transaction batch partitions to maintain optimal space-time queries."
    ];

    const targetAnswer = responses[currentIdx % responses.length];
    const words = targetAnswer.split(' ');
    let idx = 0;

    const interval = setInterval(() => {
      if (idx < words.length) {
        setUserTranscript(prev => prev + (prev ? ' ' : '') + words[idx]);
        idx++;
      } else {
        clearInterval(interval);
        setIsRecording(false);
        setSystemAlert('Simulation final. Click submit response.');
      }
    }, 280);

    window.simInterval = interval;
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (window.simInterval) {
      clearInterval(window.simInterval);
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
      setSystemAlert('Recording paused.');
    } else {
      setUserTranscript('');
      startVoiceRecording();
    }
  };

  // Generate dynamic follow-up from Ollama backend API
  const handleRequestFollowUp = async () => {
    if (!userTranscript) {
      setSystemAlert('Please record an answer transcript before requesting follow-up.');
      return;
    }

    stopVoiceRecording();
    setTimerActive(false);
    setSystemAlert('Correlating response text to generate follow-up question...');

    try {
      const response = await fetch('/api/interview/follow-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo_token_active'
        },
        body: JSON.stringify({
          interviewId: interviewId === 'demo_session_active' ? undefined : interviewId,
          questionIndex: currentIdx,
          candidateAnswer: userTranscript
        })
      });

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        // Splice follow-up into active questions set
        const updatedQuestions = [...questions];
        const followUpNode = {
          questionText: resJson.data.followUpQuestion,
          category: questions[currentIdx].category
        };
        updatedQuestions.splice(currentIdx + 1, 0, followUpNode);
        setQuestions(updatedQuestions);

        // Advance to follow-up immediately
        setUserTranscript('');
        setCurrentIdx(prev => prev + 1);
        setSystemAlert('AI Follow-up question loaded!');
      } else {
        setSystemAlert('Failed to generate follow-up. Moving forward.');
      }
    } catch (err) {
      // Simulate follow-up generation offline
      const followUpBackups = [
        `[Follow-Up] That is an interesting approach to managing latency. Could you explain how you would measure memory constraints under scale?`,
        `[Follow-Up] Given your experience with this tech stack, how would you configure error boundaries to capture edge-case crashes?`
      ];
      const backupNode = {
        questionText: followUpBackups[currentIdx % followUpBackups.length],
        category: questions[currentIdx].category
      };
      
      const updatedQuestions = [...questions];
      updatedQuestions.splice(currentIdx + 1, 0, backupNode);
      setQuestions(updatedQuestions);
      setUserTranscript('');
      setCurrentIdx(prev => prev + 1);
      setSystemAlert('AI Offline Follow-up question loaded!');
    }
  };

  const handleAnswerSubmit = async () => {
    if (!userTranscript || userTranscript.trim().length === 0) {
      setSystemAlert('⚠️ Please provide an answer before proceeding.');
      return;
    }

    stopVoiceRecording();
    setTimerActive(false);
    setIsEvaluating(true);
    setSystemAlert('Gemini AI is verifying your response...');

    try {
      const token = localStorage.getItem('camsense_token') || 'demo_token_active';
      const response = await fetch('/api/interview/evaluate-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          interviewId: interviewId === 'demo_session_active' ? undefined : interviewId,
          questionIndex: currentIdx,
          candidateAnswer: userTranscript,
          question: questions[currentIdx]?.questionText,
          category: questions[currentIdx]?.category,
          role: selectedRole
        })
      });

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setSystemAlert(`Gemini Verdict: ${resJson.data.verdict} (${resJson.data.score}/10). ${resJson.data.feedback}`);
        // Allow user to read the verification for 4 seconds
        await new Promise(resolve => setTimeout(resolve, 4000));
      }
    } catch (err) {
      console.warn('Evaluation failed:', err);
    }

    setIsEvaluating(false);

    // Save answer to global context
    const currentAnswers = [...(globalState.userAnswers || [])];
    currentAnswers[currentIdx] = userTranscript;
    
    setGlobalState(prev => ({
      ...prev,
      userAnswers: currentAnswers,
    }));

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setUserTranscript('');
      setTimeLeft(60);
    } else {
      // Finished all speaking categories, guide to Coding IDE
      setCurrentTab('coding');
    }
  };

  // circular clock percentage math
  const strokeDashoffset = 282.6 - (282.6 * timeLeft) / 60;

  return (
    <div className="max-w-6xl mx-auto py-4 space-y-6 relative">
      
      {!hasStarted && (
        <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-slate-950/80 rounded-2xl border border-indigo-500/20">
          <div className="bg-slate-900 border border-indigo-500/30 p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-6 max-w-2xl shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-indigo-900/40 border border-indigo-500/50 flex items-center justify-center text-indigo-400 mb-2 shadow-[0_0_40px_rgba(99,102,241,0.3)]">
              <Play className="w-10 h-10 ml-2" />
            </div>
            <h2 className="text-3xl font-outfit font-bold text-white">Ready for your Mock Interview?</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your webcam and microphone have been initialized in the background. The Synthetic Recruiter will ask you personalized questions based on your resume. You must answer each question to proceed.
            </p>
            <button
              onClick={() => setHasStarted(true)}
              className="mt-4 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold font-outfit uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] flex items-center space-x-3"
            >
              <span>Begin Session</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      {/* Session Progress Header */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-indigo-950/40">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping"></div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-outfit">
            Assessment Session Active: <span className="text-indigo-400 font-mono">{selectedRole} Track</span>
          </span>
        </div>
        
        {/* Progress Tracker */}
        <div className="flex items-center space-x-4">
          <span className="text-[11px] font-bold text-slate-400 font-mono">
            {currentIdx + 1} / {questions.length} Questions
          </span>
          <div className="w-32 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-indigo-950/50">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Split Grid Dashboard */}
      <div className="grid md:grid-cols-12 gap-6">
        
        {/* Left Side: Avatar & Camera Telemetry Panel */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Futuristic AI Synthetic Avatar sphere */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden min-h-[260px] border-indigo-950/40">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="w-full flex justify-between items-center pb-3 border-b border-indigo-950/20 absolute top-4 px-6">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest font-outfit">
                Synthetic Recruiter
              </span>
              <div className="flex items-center space-x-1.5 px-2 py-0.5 bg-indigo-950/30 border border-indigo-900/30 rounded-full">
                <span className={`w-1.5 h-1.5 rounded-full ${isAiSpeaking ? 'bg-cyan-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                <span className="text-[9px] font-bold text-slate-400 font-mono">
                  {isAiSpeaking ? 'SPEAKING' : 'IDLE'}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center space-y-4">
              <div className="relative">
                <div className={`absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 via-cyan-500/20 to-purple-500/20 rounded-full blur-xl transition-all duration-1000 ${isAiSpeaking ? 'scale-110 opacity-100 animate-pulse' : 'scale-95 opacity-60'}`}></div>
                
                <div className={`w-28 h-28 rounded-full bg-slate-950 border-2 ${isAiSpeaking ? 'border-cyan-400 shadow-lg shadow-cyan-500/20' : 'border-indigo-900/60'} flex items-center justify-center relative z-10 transition-all duration-500 overflow-hidden`}>
                  <div className={`w-22 h-22 rounded-full bg-slate-900/40 border border-slate-800/40 flex items-center justify-center relative ${isAiSpeaking ? 'animate-pulse' : ''}`}>
                    <Bot className={`w-10 h-10 ${isAiSpeaking ? 'text-cyan-400 scale-105' : 'text-slate-500'} transition-all duration-300`} />
                    <div className={`absolute border border-dashed border-indigo-500/20 w-20 h-20 rounded-full animate-[spin_10s_linear_infinite] ${isAiSpeaking ? 'opacity-100' : 'opacity-25'}`}></div>
                  </div>
                </div>
              </div>

              {/* Speech sound wave indicators */}
              <div className="h-6 flex items-center justify-center">
                {isAiSpeaking ? (
                  <div className="flex items-end space-x-1 h-5">
                    <span className="w-1 h-3 bg-cyan-400 rounded animate-[bounce_0.8s_infinite]"></span>
                    <span className="w-1 h-5 bg-cyan-400 rounded animate-[bounce_0.8s_0.2s_infinite]"></span>
                    <span className="w-1 h-2 bg-cyan-400 rounded animate-[bounce_0.8s_0.4s_infinite]"></span>
                    <span className="w-1 h-4 bg-cyan-400 rounded animate-[bounce_0.8s_0.1s_infinite]"></span>
                    <span className="w-1 h-1 bg-cyan-400 rounded"></span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Agent audio channel stable</span>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Webcam Monitor Panel */}
          <div className="glass-panel p-6 rounded-2xl border-indigo-950/40 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-indigo-950/20">
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-outfit">
                  Webcam Monitoring Stream
                </h3>
              </div>
              <span className="text-[9px] text-emerald-400 font-mono font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1"></span>
                LIVE
              </span>
            </div>

            <div className="relative aspect-video rounded-xl bg-slate-950 overflow-hidden border border-indigo-950/50 flex items-center justify-center">
              {/* Calibration tracking layout */}
              <div className="absolute inset-0 border border-indigo-500/10 pointer-events-none z-20">
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-indigo-500/40"></div>
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-indigo-500/40"></div>
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-indigo-500/40"></div>
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-indigo-500/40"></div>
              </div>

              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover z-10 ${cameraActive ? 'brightness-105' : 'hidden'}`} 
              />
              
              {!cameraActive && (
                <div className="text-center p-4 space-y-3 z-10 absolute inset-0 flex flex-col items-center justify-center bg-slate-950">
                  <div className="w-10 h-10 rounded-full bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                    <Camera className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold text-slate-300 font-outfit uppercase tracking-wider">Calibration Stream Active</p>
                    <p className="text-[9px] text-slate-500">Processing focus tracking index matrices...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[9px] font-bold font-mono text-slate-500 tracking-wide">
              <span>TELEMETRY: LOCKED</span>
              <span className="text-indigo-400">FOCUS CALIBRATION: ACTIVE</span>
            </div>
          </div>

        </div>

        {/* Right Side: Active Question, Voice Inputs & Countdown Timer */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Question Display Card & Timer */}
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-indigo-500 flex justify-between items-start space-x-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-indigo-950/50 border border-indigo-800/40 rounded-md text-[10px] font-bold text-indigo-300 uppercase tracking-widest font-mono">
                  {questions[currentIdx]?.category || 'Speaking'} Category
                </span>
                <button 
                  onClick={speakQuestion}
                  className="p-1 rounded bg-slate-900 border border-indigo-950 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Read question out loud"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <h2 className="text-base font-bold font-outfit text-white leading-relaxed">
                {questions[currentIdx]?.questionText || 'Active speaking block'}
              </h2>
            </div>

            {/* Circular Countdown Timer */}
            <div className="relative shrink-0 w-16 h-16 flex items-center justify-center font-outfit">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="rgba(99, 102, 241, 0.08)" strokeWidth="4" fill="transparent" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="28" 
                  stroke={timeLeft <= 10 ? '#ef4444' : '#6366f1'} 
                  strokeWidth="4" 
                  fill="transparent" 
                  strokeDasharray="175.9"
                  strokeDashoffset={175.9 - (175.9 * timeLeft) / 60}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="flex flex-col items-center justify-center">
                <span className={`text-base font-black font-mono ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>{timeLeft}s</span>
                <span className="text-[7px] text-slate-500 font-bold uppercase">Time</span>
              </div>
            </div>
          </div>

          {/* Transcript Console Area */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-indigo-950/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-outfit">
                Transcript Logging Console
              </h3>
              {isRecording && (
                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest font-mono flex items-center space-x-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping mr-1"></span>
                  <span>Voice Active</span>
                </span>
              )}
            </div>

            <div className="w-full min-h-[140px] bg-slate-950/40 border border-indigo-950/40 rounded-xl p-4 text-xs leading-relaxed text-slate-300 font-sans focus-within:border-indigo-500/40 transition-colors">
              {userTranscript ? (
                userTranscript
              ) : (
                <p className="text-slate-600 italic">
                  No vocal signals detected. Activate your mic below to respond. Or let the synthesizer load simulated transcripts...
                </p>
              )}
            </div>

            {/* Alert bar */}
            <div className="text-[10px] text-slate-500 font-medium font-mono text-center">
              STATUS: <span className="text-indigo-400 uppercase">{systemAlert}</span>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                onClick={toggleRecording}
                disabled={isAiSpeaking || isEvaluating}
                className={`px-5 py-3 rounded-xl font-bold font-outfit text-xs tracking-wider uppercase transition-all duration-300 flex items-center space-x-2 ${
                  (isAiSpeaking || isEvaluating)
                    ? 'bg-slate-900 border border-indigo-950/40 text-slate-600 cursor-not-allowed'
                    : isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/10'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>Mute Microphone</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 animate-pulse" />
                    <span>Activate Voice Channel</span>
                  </>
                )}
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRequestFollowUp}
                  disabled={!userTranscript || isAiSpeaking || isEvaluating}
                  className={`px-4 py-3 rounded-xl border text-xs font-bold font-outfit uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
                    !userTranscript || isAiSpeaking || isEvaluating
                      ? 'border-indigo-950/20 text-slate-700 cursor-not-allowed'
                      : 'border-cyan-500/20 text-cyan-400 hover:bg-cyan-950/20 shadow shadow-cyan-950/20'
                  }`}
                  title="Generate a dynamic follow-up question via local Ollama based on your transcript"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                  <span>Request AI Follow-up</span>
                </button>

                <button
                  onClick={handleAnswerSubmit}
                  disabled={isAiSpeaking || isEvaluating}
                  className={`px-6 py-3 rounded-xl font-bold font-outfit text-xs tracking-wider uppercase transition-all flex items-center space-x-1.5 ${
                    (isAiSpeaking || isEvaluating)
                      ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-indigo-950/40'
                      : 'bg-white hover:bg-slate-100 text-slate-950 shadow-md shadow-white/5'
                  }`}
                >
                  {isEvaluating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {currentIdx < questions.length - 1 ? 'Save & Proceed' : 'Go to Coding IDE'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}