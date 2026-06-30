import React, { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle2, ChevronRight, Briefcase, Sparkles, Code, Compass, AlertCircle, GraduationCap, FileText } from 'lucide-react';
import { useSetupDraft } from '../hooks/useSetupDraft';
import { useMediaDevices } from '../hooks/useMediaDevices';

const S = {
  card: { background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' },
  sectionTitle: { fontSize: '13px', fontWeight: '600', color: '#ccc', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' },
  btnRole: (active) => ({ padding: '16px', borderRadius: '10px', textAlign: 'left', border: `1px solid ${active ? '#fff' : '#222'}`, background: active ? '#1a1a1a' : '#0d0d0d', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', flexDirection: 'column', gap: '6px' }),
  inpTextarea: { width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '14px', fontSize: '13px', color: '#e0e0e0', outline: 'none', resize: 'none', lineHeight: '1.6', fontFamily: 'Inter, sans-serif' },
  inpSelect: { width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#e0e0e0', outline: 'none', fontFamily: 'Inter, sans-serif' },
  tabBtn: (active) => ({ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: `1px solid ${active ? '#333' : 'transparent'}`, background: active ? '#1a1a1a' : 'transparent', color: active ? '#fff' : '#aaa', fontSize: '12px', fontWeight: active ? '500' : '400', cursor: 'pointer', transition: 'all 0.15s' }),
};

export default function InterviewSetup({ setGlobalState, setCurrentTab }) {
  const initialDraft = {
    role: 'Frontend Engineer',
    experience: 'Mid-level (2-5 yrs)',
    resumeUploaded: false,
    resumeName: '',
    jobDescription: '',
    difficulty: 'Medium',
    parsedProfile: null,
    matchData: null,
  };
  const { draft, setDraft, restored, clearDraft } = useSetupDraft(initialDraft);
  const { role, experience, resumeUploaded, resumeName, jobDescription, difficulty, parsedProfile, matchData } = draft;

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState('Initiating cryptographic stream...');
  const [errorMessage, setErrorMessage] = useState('');

  const [activePreviewTab, setActivePreviewTab] = useState('skills');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const updateDraft = (patch) => setDraft(prev => ({ ...prev, ...patch }));

  const roles = [
    { name: 'Frontend Engineer', icon: Code, desc: 'React, System Architecture, UI performance' },
    { name: 'Backend Engineer', icon: Briefcase, desc: 'APIs, Node.js, databases, scaling' },
    { name: 'Fullstack Engineer', icon: Compass, desc: 'Development lifecycle, APIs, clients' },
    { name: 'AI / ML Engineer', icon: Sparkles, desc: 'LLMs, vector databases, architectures' },
  ];

  useEffect(() => {
    const fetchExistingResume = async () => {
      const token = localStorage.getItem('camsense_token');
      if (!token) return;
      try {
        const response = await fetch('/api/resume/me', { headers: { Authorization: `Bearer ${token}` } });
        const resJson = await response.json();
        if (resJson.success && resJson.data) {
          const profile = resJson.data;
          updateDraft({ resumeUploaded: true, resumeName: profile.fileName || 'profile_resume.pdf', parsedProfile: profile });
          calculateMatchingScore(profile.skills, jobDescription);
        }
      } catch (err) {
        console.warn('Could not retrieve active resume data:', err);
      }
    };
    fetchExistingResume();
  }, []);

  const triggerJDAnalysis = async () => {
    if (!jobDescription) { setErrorMessage('Please paste a job description first.'); return; }
    if (!resumeUploaded) { setErrorMessage('Please upload your resume above before running job description analysis.'); return; }
    setIsAnalyzing(true);
    setErrorMessage('');
    updateDraft({ matchData: null });
    try {
      const token = localStorage.getItem('camsense_token');
      if (!token) { setErrorMessage('Session expired. Sign in again.'); setIsAnalyzing(false); return; }
      const response = await fetch('/api/resume/analyze-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          jobDescription,
          resumeContent: parsedProfile?.extractedText || parsedProfile?.skills?.join(', ') || ''
        }),
      });
      const resJson = await response.json();
      if (resJson.success && resJson.data) { updateDraft({ matchData: resJson.data }); }
      else { setErrorMessage(resJson.message || 'Failed to analyze requirements.'); }
    } catch {
      setErrorMessage('Failed to connect to the analysis engine.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!isUploading) return;
    const messages = ['Scanning document structure...', 'Extracting technical taxonomy...', 'Correlating stack tags...'];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoaderMessage(messages[i]);
    }, 1200);
    return () => clearInterval(interval);
  }, [isUploading]);

  const calculateMatchingScore = (skills = [], jdText = '') => {
    if (!jdText) { updateDraft({ matchData: null }); return; }
    const textLower = jdText.toLowerCase();
    const matched = skills.filter(s => textLower.includes(s.toLowerCase()));
    const dbSkills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'PostgreSQL', 'Git', 'Docker', 'AWS'];
    const jdSkills = dbSkills.filter(s => textLower.includes(s.toLowerCase()));
    const missing = jdSkills.filter(s => !skills.some(u => u.toLowerCase() === s.toLowerCase()));
    let pct = jdSkills.length > 0 ? Math.round((matched.length / jdSkills.length) * 100) : (matched.length > 0 ? 80 : 40);
    pct = Math.min(Math.max(pct, 15), 100);
    let rec = pct >= 80 ? 'Excellent match. Outstanding fits found.' : pct >= 50 ? 'Good overlap. Calibrating focused topics.' : 'Discrepancies identified. Review your profile.';
    updateDraft({ matchData: { matchPercentage: pct, matchingSkills: matched, missingSkills: missing, recommendation: rec } });
  };

  const processUpload = async (file) => {
    setIsUploading(true);
    setUploadProgress(20);
    setErrorMessage('');
    updateDraft({ matchData: null });
    const formData = new FormData();
    formData.append('resume', file);
    const token = localStorage.getItem('camsense_token');
    try {
      const interval = setInterval(() => {
        setUploadProgress(p => p >= 90 ? 90 : p + 15);
      }, 250);
      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      clearInterval(interval);
      setUploadProgress(100);
      const json = await res.json();
      if (json.success && json.data) {
        setTimeout(() => {
          updateDraft({ resumeUploaded: true, resumeName: file.name, parsedProfile: json.data });
          calculateMatchingScore(json.data.skills, jobDescription);
          setIsUploading(false);
        }, 600);
      } else {
        setIsUploading(false);
        setErrorMessage(json.message || 'Error processing uploaded file');
      }
    } catch {
      setIsUploading(false);
      setErrorMessage('Network timeout. Server status is offline.');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processUpload(e.target.files[0]);
    }
  };

  const handleStartInterview = () => {
    if (!resumeUploaded || !parsedProfile) {
      setErrorMessage('Upload and parse your resume before launching the interview session.');
      return;
    }

    setGlobalState(prev => ({
      ...prev,
      role,
      experience,
      resumeUploaded,
      resumeName,
      jobDescription: jobDescription || 'Standard Developer profile',
      difficulty,
      resumeSkills: parsedProfile.skills || [],
      resumeEducation: parsedProfile.education || [],
      resumeProjects: parsedProfile.projects || [],
      resumeExperience: parsedProfile.experience || [],
      resumeSummary: parsedProfile.summary || '',
      resumeText: parsedProfile.extractedText || '',
      matchPercentage: matchData ? matchData.matchPercentage : 0,
    }));
    setCurrentTab('session');
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Page Title */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', letterSpacing: '-0.02em', margin: '0 0 6px' }}>Configure assessment</h1>
        <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
          Upload your credentials or resume profile. Camsense extracts your technical capabilities and structures the dynamic assessment questions.
        </p>
        {restored && (
          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 12px' }}>
            <span style={{ fontSize: '12px', color: '#aaa' }}>Restored your last setup draft on this device.</span>
            <button onClick={clearDraft} style={{ background: 'transparent', border: '1px solid #333', borderRadius: '6px', color: '#ccc', padding: '6px 10px', fontSize: '11px', cursor: 'pointer' }}>
              Clear draft
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left Side options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Target Role selection */}
          <div style={S.card}>
            <div style={S.sectionTitle}>
              <Compass size={14} /> 1. Select Track Role
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {roles.map(r => (
                <button key={r.name} onClick={() => updateDraft({ role: r.name })} style={S.btnRole(role === r.name)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ color: role === r.name ? '#fff' : '#aaa' }}>
                      <r.icon size={15} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{r.name}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#aaa', lineHeight: '1.4' }}>{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Job description section */}
          <div style={S.card}>
            <div style={S.sectionTitle}>
              <Briefcase size={14} /> 2. Job Description Requirements
            </div>
            <textarea
              value={jobDescription}
              onChange={e => updateDraft({ jobDescription: e.target.value })}
              placeholder="Paste the target JD parameters to calculate skills matches and customize the AI feedback loops..."
              rows={5}
              style={S.inpTextarea}
            />
            <button
              onClick={triggerJDAnalysis}
              disabled={isAnalyzing || !jobDescription}
              style={{
                width: '100%', padding: '10px', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', cursor: isAnalyzing || !jobDescription ? 'not-allowed' : 'pointer',
                background: isAnalyzing || !jobDescription ? '#1a1a1a' : '#fff',
                color: isAnalyzing || !jobDescription ? '#555' : '#000',
                transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {isAnalyzing ? 'Extracting Stack alignment…' : 'Analyze requirement overlap'}
            </button>
          </div>

          {/* Calibrator settings */}
          <div style={S.card}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#ccc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Difficulty</label>
                <div style={{ display: 'flex', background: '#0d0d0d', border: '1px solid #222', borderRadius: '6px', padding: '2px' }}>
                  {['Easy', 'Medium', 'Hard'].map(d => (
                    <button key={d} onClick={() => updateDraft({ difficulty: d })} style={{ flex: 1, padding: '6px', fontSize: '11px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: difficulty === d ? '#1e1e1e' : 'transparent', color: difficulty === d ? '#fff' : '#aaa', transition: 'all 0.15s' }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#ccc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Experience seniority</label>
                <select value={experience} onChange={e => updateDraft({ experience: e.target.value })} style={S.inpSelect}>
                  <option>Junior-level (0-2 yrs)</option>
                  <option>Mid-level (2-5 yrs)</option>
                  <option>Senior-level (5-8 yrs)</option>
                  <option>Principal/Lead (8+ yrs)</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side previews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Drag & Drop Upload Container */}
          <div style={S.card}>
            <div style={S.sectionTitle}>
              <UploadCloud size={14} /> 3. Load Professional Profile
            </div>

            <div
              onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
              onDragOver={e => e.preventDefault()}
              onDragLeave={() => setDragActive(false)}
              onDrop={e => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files?.[0]) processUpload(e.dataTransfer.files[0]); }}
              style={{
                position: 'relative', border: '1.5px dashed #222', borderRadius: '10px', padding: '32px 16px', textAlign: 'center', transition: 'all 0.2s', cursor: 'pointer',
                background: dragActive ? '#151515' : '#0d0d0d', borderColor: dragActive ? '#fff' : '#222',
              }}
            >
              <input type="file" accept=".pdf,.docx" onChange={handleFileChange} disabled={isUploading} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
              
              {isUploading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '20px', height: '20px', border: '2px solid #555', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <span style={{ fontSize: '11px', color: '#ccc' }}>{loaderMessage} ({uploadProgress}%)</span>
                </div>
              ) : resumeUploaded ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={24} color="#4ade80" />
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>{resumeName}</span>
                  <span style={{ fontSize: '11px', color: '#aaa', marginBottom: '6px' }}>Profile parsed successfully</span>
                  <div style={{ padding: '6px 12px', background: '#222', border: '1px solid #333', borderRadius: '4px', fontSize: '11px', fontWeight: '600', color: '#ddd', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <UploadCloud size={12} /> Replace PDF
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <UploadCloud size={24} color="#888" />
                  <span style={{ fontSize: '12px', color: '#ccc' }}>Drag and drop resume here, or browse</span>
                  <span style={{ fontSize: '10px', color: '#888' }}>PDF or DOCX format limits</span>
                </div>
              )}
            </div>

            {errorMessage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#270e0f', border: '1px solid #f87171', borderRadius: '8px', color: '#f87171', fontSize: '11px' }}>
                <AlertCircle size={14} /> {errorMessage}
              </div>
            )}
          </div>

          {/* Interactive Profile preview */}
          {resumeUploaded && parsedProfile && (
            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e1e1e', paddingBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#ccc' }}>AI extraction preview</span>
                <span style={{ fontSize: '10px', color: '#888' }}>Gemini-enabled</span>
              </div>

              {/* Preview tabs */}
              <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid #1e1e1e', paddingBottom: '6px' }}>
                {[
                  { id: 'skills', label: 'Stack', icon: Code },
                  { id: 'summary', label: 'Summary', icon: Sparkles },
                  { id: 'education', label: 'Education', icon: GraduationCap },
                  { id: 'projects', label: 'Projects', icon: FileText }
                ].map(t => (
                  <button key={t.id} onClick={() => setActivePreviewTab(t.id)} style={S.tabBtn(activePreviewTab === t.id)}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div style={{ maxHeight: '120px', overflowY: 'auto', fontSize: '12px', color: '#ddd', lineHeight: '1.6' }}>
                {activePreviewTab === 'skills' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {parsedProfile.skills?.map(s => (
                      <span key={s} style={{ padding: '3px 8px', background: '#1a1a1a', border: '1px solid #222', borderRadius: '4px', fontSize: '11px', color: '#ccc' }}>
                        {s}
                      </span>
                    )) || <span style={{ fontStyle: 'italic', color: '#888' }}>No skills identified</span>}
                  </div>
                )}
                {activePreviewTab === 'summary' && (
                  <p style={{ margin: 0 }}>{parsedProfile.summary || 'No career summary parsed.'}</p>
                )}
                {activePreviewTab === 'education' && (
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {parsedProfile.education?.map((e, idx) => <li key={idx}>{e}</li>) || <li>No education data</li>}
                  </ul>
                )}
                {activePreviewTab === 'projects' && (
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {parsedProfile.projects?.map((p, idx) => <li key={idx}>{p}</li>) || <li>No personal projects parsed</li>}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Alignment matrix */}
          {matchData && (
            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e1e1e', paddingBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#ccc' }}>Job Description Overlap</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>{matchData.matchPercentage}% Compatibility</span>
              </div>
              <div style={{ fontSize: '12px', color: '#ddd', lineHeight: '1.5' }}>
                {matchData.recommendation}
              </div>
              <div style={{ width: '100%', height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${matchData.matchPercentage}%`, background: '#fff', borderRadius: '2px', transition: 'width 0.6s' }} />
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleStartInterview}
            disabled={!resumeUploaded || isUploading}
            style={{
              width: '100%', padding: '12px 24px', background: !resumeUploaded || isUploading ? '#1a1a1a' : '#fff', color: !resumeUploaded || isUploading ? '#555' : '#000', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: !resumeUploaded || isUploading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.15s',
            }}
          >
            Launch Interview Session <ChevronRight size={15} />
          </button>

        </div>

      </div>
    </div>
  );
}
