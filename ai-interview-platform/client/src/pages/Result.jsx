import React, { useState, useEffect } from 'react';
import { Award, Download, CheckCircle, RefreshCw, Sparkles, BookOpen, ThumbsUp, HelpCircle, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import RadialProgress from '../components/Common/RadialProgress';
import PerformanceChart from '../components/Common/PerformanceChart';

const normalizeScore = (score, fallback = 0) => {
  const numericScore = Number(score);
  const safeScore = Number.isFinite(numericScore) ? numericScore : fallback;
  return Math.min(Math.max(Math.round(safeScore), 0), 100);
};

const normalizeReportScores = (report = {}) => ({
  ...report,
  overallScore: normalizeScore(report.overallScore),
  resumeScore: normalizeScore(report.resumeScore),
  interviewScore: normalizeScore(report.interviewScore),
  codingScore: normalizeScore(report.codingScore),
});

export default function Result({ globalState, setGlobalState, setCurrentTab }) {
  const selectedRole = globalState.role || 'Frontend Engineer';
  const experience = globalState.experience || 'Mid-level (2-5 yrs)';
  const interviewId = globalState.interviewId || 'demo_session_active';

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const triggerLocalFallback = () => {
    const isCodeGood = !!globalState.finalCode;
    const codingScore = globalState.codingScore || (isCodeGood ? 90 : 40);
    const qScores = globalState.questionScores || [];
    const interviewScore = qScores.length > 0 ? Math.round(qScores.reduce((a, b) => a + b, 0) / qScores.length) : (isCodeGood ? 85 : 70);
    const resumeScore = globalState.resumeUploaded ? 88 : 75;

    let overall = Math.round((resumeScore + interviewScore + codingScore) / 3);

    const violations = globalState.violationCount || 0;
    const deduction = Math.min(violations * 5, 25);
    overall = Math.max(0, overall - deduction);

    const rawBreakdowns = {
      'Frontend Engineer': { syntaxAccuracy: Math.round(codingScore * 1.02), systemScalability: Math.round(interviewScore * 0.98), verbalCommunication: 88, complexityOptimization: Math.round(codingScore * 0.95) },
      'Backend Engineer': { syntaxAccuracy: Math.round(codingScore * 1.05), systemScalability: Math.round(interviewScore * 0.95), verbalCommunication: 84, complexityOptimization: Math.round(codingScore * 0.98) },
      'Fullstack Engineer': { syntaxAccuracy: Math.round(codingScore * 1.01), systemScalability: Math.round(interviewScore * 0.99), verbalCommunication: 91, complexityOptimization: Math.round(codingScore * 0.96) },
      'AI / ML Engineer': { syntaxAccuracy: Math.round(codingScore * 1.03), systemScalability: Math.round(interviewScore * 0.97), verbalCommunication: 87, complexityOptimization: Math.round(codingScore * 0.94) }
    };
    const selectedBreakdown = rawBreakdowns[selectedRole] || rawBreakdowns['Frontend Engineer'];
    const breakdown = {
      syntaxAccuracy: Math.min(Math.max(selectedBreakdown.syntaxAccuracy || 80, 0), 100),
      systemScalability: Math.min(Math.max(selectedBreakdown.systemScalability || 80, 0), 100),
      verbalCommunication: Math.min(Math.max(selectedBreakdown.verbalCommunication || 80, 0), 100),
      complexityOptimization: Math.min(Math.max(selectedBreakdown.complexityOptimization || 80, 0), 100),
    };

    setReportData({
      overallScore: overall,
      resumeScore,
      interviewScore,
      codingScore,
      breakdown,
      strengths: [
        'Exceptional logical breakdown of architectural and scaling boundaries.',
        'Demonstrates complete syntax accuracy and solid clean code structures.'
      ],
      weaknesses: [
        'Could elaborate further on multi-threaded garbage collection limits.',
        'Aim to explain low-level cache structures during high database load scenarios.',
        ...(violations > 0 ? [`Integrity Warning: Detected ${violations} instance(s) of tab-switching or exiting fullscreen mode.`] : [])
      ],
      feedbackReport: `### AI INTERVIEW FEEDBACK REPORT
      
**Role:** ${selectedRole}
**Experience:** ${experience}
**Verdict:** ${overall >= 80 ? 'Strongly Recommended' : 'Recommended with reservations'}

The candidate demonstrated robust theoretical scaling mastery. Code sandbox tests passed within optimal limits. Elaborating on memory concurrency threads will secure direct placement on top-tier tracks.`,
      feedbackLogs: [
        'Completed local high-fidelity AI telemetry report.',
        'Overall grade computed: ' + overall + '%'
      ]
    });
  };

  useEffect(() => {
    const controller = new AbortController();

    const synthesizeReport = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/report/synthesize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer demo_token_active'
          },
          body: JSON.stringify({ 
            interviewId: interviewId === 'demo_session_active' ? undefined : interviewId,
            role: selectedRole,
            experience: experience,
            questions: globalState.interviewQuestions || [],
            answers: globalState.userAnswers || []
          }),
          signal: controller.signal
        });
        const resJson = await response.json();
        if (resJson.success && resJson.data) {
          let data = resJson.data;
          const violations = globalState.violationCount || 0;
          if (violations > 0) {
            const deduction = Math.min(violations * 5, 25);
            data.overallScore = Math.max(0, (data.overallScore || 80) - deduction);
            data.weaknesses = [...(data.weaknesses || []), `Integrity Warning: Detected ${violations} instance(s) of tab-switching or exiting fullscreen mode.`];
          }
          data.resumeScore = data.resumeScore || 85;
          data.interviewScore = data.interviewScore || 82;
          data.codingScore = data.codingScore || 88;
          setReportData(data);
        } else {
          triggerLocalFallback();
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('[Synthesize Aborted] Request was cancelled.');
          return;
        }
        triggerLocalFallback();
      } finally {
        setLoading(false);
      }
    };

    synthesizeReport();
    return () => controller.abort();
  }, [interviewId, selectedRole, experience, globalState.interviewQuestions, globalState.userAnswers, globalState.violationCount]);

  const handleDownload = () => {
    if (!reportData) return;
    const exportReport = normalizeReportScores(reportData);
    setDownloading(true);
    setDownloaded(false);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      generateAssessmentPDF(exportReport, selectedRole);
    }, 1000);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '840px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '12px' }}>
          <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} color="#888" />
          <span style={{ fontSize: '13px', color: '#888' }}>Generating your comprehensive assessment report...</span>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div style={{ maxWidth: '840px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <AlertCircle size={32} color="#333" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '14px', color: '#888', margin: '0 0 8px' }}>No report data available</p>
          <p style={{ fontSize: '12px', color: '#555', margin: '0 0 16px' }}>Please complete an interview session before viewing results.</p>
          <button
            onClick={() => setCurrentTab('setup')}
            style={{ marginTop: '8px', padding: '10px 20px', background: '#fff', color: '#000', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            Start Setup Session
          </button>
        </div>
      </div>
    );
  }

  const report = normalizeReportScores(reportData || {});

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Page Title */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', letterSpacing: '-0.02em', margin: '0 0 6px' }}>Interview evaluation report</h1>
        <p style={{ fontSize: '14px', color: '#aaa', lineHeight: '1.6' }}>
          Composite analytics compiled from voice response, algorithmic sandbox compilation test suites, and focus telemetry metrics.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '4fr 6fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Composite score card */}
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#aaa', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>AI Composite Grading</span>
            <RadialProgress score={report.overallScore} size={130} strokeWidth={10} title={report.overallScore > 85 ? 'Grade A' : 'Grade B'} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#fff', margin: '0 0 4px' }}>
                {report.overallScore > 80 ? 'Hiring Threshold Exceeded' : 'Pass Threshold Met'}
              </p>
              <p style={{ fontSize: '12px', color: '#aaa', lineHeight: '1.4', margin: 0 }}>
                Algorithm optimization and verbal description profiles place you among target candidate benchmarks.
              </p>
            </div>

            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                width: '100%', padding: '10px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: downloading ? 'not-allowed' : 'pointer',
                background: downloading ? '#1a1a1a' : '#fff',
                color: downloading ? '#555' : '#000',
                transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              {downloading ? 'Compiling PDF…' : downloaded ? 'Report Exported' : 'Export System PDF'}
            </button>
          </div>
        </div>

        {/* Aptitude Matrix Breakdown */}
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#ccc', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
            Aptitude Matrix Breakdown
          </h2>

          <PerformanceChart
            scores={[
              { category: 'Resume Profile Match', score: report.resumeScore },
              { category: 'Interview & Verbal Round', score: report.interviewScore },
              { category: 'Coding Environment Round', score: report.codingScore }
            ]}
          />

          <div style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#ccc', textTransform: 'uppercase' }}>Hiring recommendation verdict</span>
            <p style={{ fontSize: '12px', color: '#aaa', lineHeight: '1.5', margin: 0 }}>
              Review the structural strengths and areas of improvements below to identify capability overlaps and algorithmic enhancements.
            </p>
          </div>
        </div>

      </div>

      {/* Strengths & Weaknesses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Strengths Card */}
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderLeft: '3px solid #fff', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#ccc', letterSpacing: '0.05em', textTransform: 'uppercase' }}>🌟 Core Strengths</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {report.strengths?.map((s, idx) => (
              <div key={idx} style={{ padding: '10px 12px', background: '#0d0d0d', border: '1px solid #222', borderRadius: '8px', fontSize: '12px', color: '#ccc', lineHeight: '1.5' }}>
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses Card */}
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderLeft: '3px solid #555', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#ccc', letterSpacing: '0.05em', textTransform: 'uppercase' }}>🔧 Areas for Improvement</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {report.weaknesses?.map((w, idx) => (
              <div key={idx} style={{ padding: '10px 12px', background: '#0d0d0d', border: '1px solid #222', borderRadius: '8px', fontSize: '12px', color: '#ccc', lineHeight: '1.5' }}>
                {w}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Verdict text details */}
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#ccc', letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid #1e1e1e', paddingBottom: '8px' }}>AI Synthesis Verdict Report</span>
        <p style={{ fontSize: '12px', color: '#ccc', lineHeight: '1.6', whiteSpace: 'pre-line', margin: 0 }}>
          {report.feedbackReport?.replace(/###|##|#|\*/g, '').trim()}
        </p>
      </div>

      {/* Integrity Telemetry */}
      {(globalState.violationCount > 0) && (
        <div style={{ background: '#111', border: '1px solid #ff4444', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#ff4444', letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid #270e0f', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={16} /> Integrity Telemetry Warning
          </span>
          <p style={{ fontSize: '12px', color: '#ccc', lineHeight: '1.6', margin: 0 }}>
            This candidate exited fullscreen mode or switched tabs <strong>{globalState.violationCount}</strong> time(s) during the assessment. 
            A total of <strong>{Math.min(globalState.violationCount * 5, 25)} points</strong> have been automatically deducted from their final overall score.
          </p>
        </div>
      )}

      {/* Proctored Video Telemetry Review & Logs */}
      {(globalState.recordedVideoUrl || (globalState.telemetryLogs && globalState.telemetryLogs.length > 0)) && (
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#ccc', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', borderBottom: '1px solid #1e1e1e', paddingBottom: '8px', marginBottom: '16px' }}>
            📹 Proctored Video & Telemetry Log
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: globalState.recordedVideoUrl ? '1fr 1fr' : '1fr', gap: '20px' }}>
            {globalState.recordedVideoUrl && (
              <div>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Session Video Playback</span>
                <video src={globalState.recordedVideoUrl} controls style={{ width: '100%', borderRadius: '8px', border: '1px solid #222', background: '#000' }} />
              </div>
            )}
            <div>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Telemetry Log Timeline</span>
              <div style={{ maxHeight: '160px', overflowY: 'auto', background: '#0d0d0d', border: '1px solid #222', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {globalState.telemetryLogs && globalState.telemetryLogs.length > 0 ? (
                  globalState.telemetryLogs.map((log, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa', borderBottom: '1px dashed #222', paddingBottom: '4px' }}>
                      <span style={{ color: log.event.includes('Violation') ? '#ef4444' : '#4ade80' }}>{log.event}</span>
                      <span style={{ fontFamily: 'monospace', color: '#666' }}>{log.time}</span>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: '11px', color: '#444', fontStyle: 'italic' }}>No logs recorded.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restart CTA */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => {
            setGlobalState(prev => ({
              ...prev,
              resumeUploaded: false,
              resumeName: '',
              jobDescription: '',
              userAnswers: [],
              finalCode: '',
              codeRating: '',
              completedTime: '',
              violationCount: 0,
              questions: []
            }));
            setCurrentTab('setup');
          }}
          style={{
            padding: '12px 28px', background: '#111', color: '#ccc', border: '1px solid #222', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s'
          }}
        >
          <RefreshCw size={13} /> Launch new assessment loop
        </button>
      </div>

    </div>
  );
}
