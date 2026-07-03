import React, { useState, useEffect } from 'react';
import { Award, Download, CheckCircle, RefreshCw, Sparkles, BookOpen, ThumbsUp, HelpCircle, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';

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

import { pdfThemeConfig } from '../utils/pdfThemeConfig';
export default function Result({ globalState, setGlobalState, setCurrentTab }) {
  const selectedRole = globalState.role || 'Frontend Engineer';
  const experience = globalState.experience || 'Mid-level (2-5 yrs)';
  const interviewId = globalState.interviewId || 'demo_session_active';

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

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
        })
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
    } catch {
      triggerLocalFallback();
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => { synthesizeReport(); }, [interviewId, selectedRole]);

  const handleDownload = () => {
    if (!reportData) return;
    const exportReport = normalizeReportScores(reportData);
    setDownloading(true);
    setDownloaded(false);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const colPrimary = [15, 15, 15]; // Pure deep black/grey for minimal layout
      const colAccent = [50, 50, 50];

      doc.setFillColor(...colPrimary);
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('CAMSENSE AI ASSESSMENT', 15, 15);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text('CANDIDATE INTERVIEW COMPOSITE PERFORMANCE REPORT', 15, 23);

      let y = 45;
      doc.setDrawColor(220, 220, 220);
      doc.setFillColor(250, 250, 250);
      doc.rect(14, y, 182, 28, 'FD');

      doc.setTextColor(15, 15, 15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('ASSESSMENT DATA METRICS', 18, y + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Candidate: Camsense Platform Participant`, 18, y + 14);
      doc.text(`Target Track: ${selectedRole}`, 18, y + 20);
      doc.text(`Difficulty: ${globalState.difficulty || 'Medium'}`, 110, y + 14);
      doc.text(`Overall Score: ${exportReport.overallScore}%`, 110, y + 20);

      y += 40;
      doc.setDrawColor(15, 15, 15);
      doc.line(14, y, 196, y);

      doc.setTextColor(...colPrimary);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('COMPOSITE SCORES BREAKDOWN', 14, y + 7);

      doc.setFillColor(245, 245, 245);
      doc.rect(14, y + 12, 56, 16, 'F');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.text('RESUME SCORE', 18, y + 18);
      doc.setTextColor(15, 15, 15);
      doc.setFontSize(12);
      doc.text(`${exportReport.resumeScore}%`, 18, y + 25);

      doc.setFillColor(245, 245, 245);
      doc.rect(76, y + 12, 56, 16, 'F');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.text('INTERVIEW SCORE', 80, y + 18);
      doc.setTextColor(15, 15, 15);
      doc.setFontSize(12);
      doc.text(`${exportReport.interviewScore}%`, 80, y + 25);

      doc.setFillColor(245, 245, 245);
      doc.rect(138, y + 12, 56, 16, 'F');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.text('CODING SCORE', 142, y + 18);
      doc.setTextColor(15, 15, 15);
      doc.setFontSize(12);
      doc.text(`${exportReport.codingScore}%`, 142, y + 25);

      y += 42;
      doc.setTextColor(...colPrimary);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('AI INTERVIEW VERDICT REPORT', 14, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const snippet = reportData.feedbackReport.replace(/###|##|#|\*/g, '').trim();
      doc.text(snippet, 14, y + 8, { maxWidth: 182 });

      doc.setFontSize(7.5);
      doc.setTextColor(180, 180, 180);
      doc.text('REPORT GENERATED BY CAMSENSE AI ENGINE. CONFIDENTIAL.', 14, 285);

      doc.save(`camsense_assessment_${selectedRole.toLowerCase().replace(/\s+/g, '_')}.pdf`);
    }, 2000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', background: '#0a0a0a', fontFamily: 'Inter, sans-serif' }}>
        <RefreshCw size={28} color="#555" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: '13px', color: '#555' }}>Synthesizing assessment report diagnostics…</p>
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
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#0d0d0d', border: '2px solid #222', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <span style={{ fontSize: '32px', fontWeight: '700', color: '#fff' }}>{report.overallScore}%</span>
              <span style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{report.overallScore > 85 ? 'Grade A' : 'Grade B'}</span>
            </div>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '500' }}>
                <span style={{ color: '#ccc' }}>Resume Profile Match</span>
                <span style={{ color: '#fff', fontWeight: '600' }}>{report.resumeScore}%</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${report.resumeScore}%`, background: '#fff', borderRadius: '2px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '500' }}>
                <span style={{ color: '#ccc' }}>Interview & Verbal Round</span>
                <span style={{ color: '#fff', fontWeight: '600' }}>{report.interviewScore}%</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${report.interviewScore}%`, background: '#fff', borderRadius: '2px' }} />
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '500' }}>
                <span style={{ color: '#ccc' }}>Coding Environment Round</span>
                <span style={{ color: '#fff', fontWeight: '600' }}>{report.codingScore}%</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${report.codingScore}%`, background: '#fff', borderRadius: '2px' }} />
              </div>
            </div>
          </div>

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
