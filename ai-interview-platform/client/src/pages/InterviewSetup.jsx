import React, { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle2, ChevronRight, Briefcase, FileText, Compass, Sparkles, Code, AlertCircle, RefreshCw, BarChart2, BookOpen, GraduationCap } from 'lucide-react';

export default function InterviewSetup({ setGlobalState, setCurrentTab }) {
  const [role, setRole] = useState('Frontend Engineer');
  const [experience, setExperience] = useState('Mid-level (2-5 yrs)');
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeName, setResumeName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  
  // High-fidelity upload & metrics state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState('Initiating cryptographic stream...');
  const [matchData, setMatchData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Parsed Resume Preview metrics
  const [parsedProfile, setParsedProfile] = useState(null);
  const [activePreviewTab, setActivePreviewTab] = useState('skills');

  const roles = [
    { name: 'Frontend Engineer', icon: Code, desc: 'React, Tailwind, System Architecture, UI performance' },
    { name: 'Backend Engineer', icon: Briefcase, desc: 'APIs, Node.js, SQL databases, System scalability' },
    { name: 'Fullstack Engineer', icon: Compass, desc: 'Full development lifecycle, serverless, client integrations' },
    { name: 'AI / ML Engineer', icon: Sparkles, desc: 'LLMs, Prompt Engineering, Vector dbs, neural architecture' },
  ];

  // Retrieve previously parsed resume on mount
  useEffect(() => {
    const fetchExistingResume = async () => {
      const token = localStorage.getItem('camsense_token');
      if (!token) return;

      try {
        const response = await fetch('/api/resume/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const resJson = await response.json();
        if (resJson.success && resJson.data) {
          const profile = resJson.data;
          setResumeUploaded(true);
          setResumeName(profile.fileName || 'profile_resume.pdf');
          setParsedProfile(profile);
          
          // Pre-populate skills match telemetry if JD exists
          calculateMatchingScore(profile.skills, jobDescription);
        }
      } catch (err) {
        console.warn('Could not retrieve active resume data:', err);
      }
    };
    fetchExistingResume();
  }, []);

  // Recalculate match details when Job Description is changed (using debounced backend API checks)
  useEffect(() => {
    if (!jobDescription) {
      setMatchData(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      const token = localStorage.getItem('camsense_token');
      if (!token) return;

      try {
        const response = await fetch('/api/resume/analyze-jd', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ jobDescription })
        });
        const resJson = await response.json();
        
        if (resJson.success && resJson.data) {
          setMatchData(resJson.data);
        }
      } catch (err) {
        console.error('JD analysis backend connection issue:', err);
        // Soft fallback to client metrics calculation
        if (parsedProfile && parsedProfile.skills) {
          calculateMatchingScore(parsedProfile.skills, jobDescription);
        }
      }
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [jobDescription, parsedProfile]);

  // Rotator for progress telemetry details
  useEffect(() => {
    if (!isUploading) return;
    const messages = [
      'Scanning document structure...',
      'De-compressing pdf buffers...',
      'Running regular expression parsers...',
      'Extracting professional taxonomy...',
      'Correlating tech stack tags...'
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoaderMessage(messages[i]);
    }, 1200);
    return () => clearInterval(interval);
  }, [isUploading]);

  const calculateMatchingScore = (skills = [], jdText = '') => {
    if (!jdText) {
      setMatchData(null);
      return;
    }

    const textLower = jdText.toLowerCase();
    
    // Core target overlaps
    const matched = skills.filter(skill => textLower.includes(skill.toLowerCase()));
    
    // Scan JD for target required skills in database that user might be missing
    const databaseSkills = [
      'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Express',
      'Python', 'Django', 'Flask', 'Java', 'SQL', 'PostgreSQL', 'MongoDB', 
      'Git', 'Docker', 'AWS', 'GCP', 'Figma', 'GraphQL', 'TailwindCSS'
    ];
    
    const jdSkills = databaseSkills.filter(skill => textLower.includes(skill.toLowerCase()));
    const missing = jdSkills.filter(skill => !skills.some(s => s.toLowerCase() === skill.toLowerCase()));
    
    // Base score calculation
    let matchPct = 0;
    if (jdSkills.length > 0) {
      matchPct = Math.round((matched.length / jdSkills.length) * 100);
    } else {
      matchPct = matched.length > 0 ? 80 : 40;
    }
    matchPct = Math.min(Math.max(matchPct, 15), 100);

    let rec = '';
    if (matchPct >= 80) {
      rec = 'Outstanding stack match. You are an exceptional fit for the stated requirements.';
    } else if (matchPct >= 50) {
      rec = 'Solid overlap compatibility. Adding a few targeted skills will completely optimize match taxonomy.';
    } else {
      rec = 'Significant technological stack discrepancies found. Review targets and expand toolsets.';
    }

    setMatchData({
      matchPercentage: matchPct,
      matchingSkills: matched,
      missingSkills: missing,
      recommendation: rec
    });
  };

  // Drag and Drop files handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processUpload(e.target.files[0]);
    }
  };

  const processUpload = async (file) => {
    setIsUploading(true);
    setUploadProgress(15);
    setErrorMessage('');
    setMatchData(null);

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('camsense_token');
    
    try {
      // Simulate highly smooth graphical upload progression
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 12;
        });
      }, 300);

      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const resJson = await response.json();

      if (resJson.success && resJson.data) {
        setTimeout(() => {
          const profile = resJson.data;
          setResumeUploaded(true);
          setResumeName(file.name);
          setParsedProfile(profile);
          
          calculateMatchingScore(profile.skills, jobDescription);
          setIsUploading(false);
        }, 800);
      } else {
        setIsUploading(false);
        setErrorMessage(resJson.message || 'Error processing uploaded file');
      }
    } catch (error) {
      console.error('Upload parser error:', error);
      setIsUploading(false);
      setErrorMessage('Network timeout. Ensure backend port 5000 is active.');
    }
  };

  const handleStartInterview = () => {
    setGlobalState(prev => ({
      ...prev,
      role,
      experience,
      resumeUploaded,
      resumeName,
      jobDescription: jobDescription || 'Standard modern fullstack developer profile',
      difficulty,
      matchPercentage: matchData ? matchData.matchPercentage : 0
    }));
    setCurrentTab('session');
  };

  const getGlowColor = (pct) => {
    if (pct >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
    if (pct >= 50) return 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20';
    return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
  };

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-10">
      
      {/* Header Banner */}
      <div className="space-y-2 relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight flex items-center space-x-2">
          <span>Configure Your Evaluation Environment</span>
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Upload your PDF or DOCX Resume. Our AI extractor parses your tech stack, education, and career experience dynamically to calibrate target interview rounds.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Left Hand: Configuration Parameters */}
        <div className="md:col-span-6 space-y-6">
          
          {/* Target Role selection */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 font-outfit flex items-center space-x-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>1. Target Role Category</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {roles.map((item) => {
                const Icon = item.icon;
                const isSelected = role === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => setRole(item.name)}
                    className={`p-4 rounded-xl text-left border transition-all duration-300 relative overflow-hidden group ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-950/50'
                        : 'bg-slate-900/40 border-indigo-950/40 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'} transition-colors`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-[13px] font-bold text-slate-200 tracking-wide font-outfit">
                        {item.name}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">
                      {item.desc}
                    </p>
                    {isSelected && (
                      <div className="absolute right-2 top-2 w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Job description section */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 font-outfit flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>2. Target Requirements Description</span>
              </h2>
              <span className="text-[10px] text-indigo-400 font-bold uppercase bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-900/30">Skill Matcher Active</span>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste targeted job description posting parameters here to calculate technical skills matches and adjust evaluation focus..."
              rows={6}
              className="w-full bg-[#0a0d16]/60 border border-indigo-950/60 focus:border-indigo-500/50 rounded-xl p-4 text-xs font-sans text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
            />
          </div>

          {/* Calibration Options */}
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 font-outfit block">
                3. Difficulty Calibrator
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 text-[11px] font-bold font-outfit rounded-lg border transition-all ${
                      difficulty === diff
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow shadow-indigo-950'
                        : 'bg-slate-900/30 border-slate-900/60 text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 font-outfit block">
                4. Professional Seniority Calibrator
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-[#0a0d16]/60 border border-indigo-950/60 focus:border-indigo-500/50 rounded-lg py-2.5 px-3 text-xs font-sans text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/10 transition-all"
              >
                <option>Junior-level (0-2 yrs)</option>
                <option>Mid-level (2-5 yrs)</option>
                <option>Senior-level (5-8 yrs)</option>
                <option>Principal/Lead (8+ yrs)</option>
              </select>
            </div>
          </div>

        </div>

        {/* Right Hand: Upload & Interactive Parsed Previews */}
        <div className="md:col-span-6 space-y-6">
          
          {/* Drag & Drop Upload Container */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 font-outfit flex items-center space-x-2">
              <UploadCloud className="w-4 h-4 text-indigo-400" />
              <span>Upload Credentials</span>
            </h2>

            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-950/15 scale-[1.01]' 
                  : 'border-indigo-950/60 hover:border-indigo-800/40 bg-slate-950/30'
              }`}
            >
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                disabled={isUploading}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />

              {isUploading ? (
                <div className="space-y-4 py-4">
                  {/* Circular & Horizontal Progress */}
                  <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto"></div>
                  <div className="space-y-1 max-w-[240px] mx-auto">
                    <p className="text-[11px] text-slate-300 font-bold uppercase tracking-wide animate-pulse">
                      {loaderMessage}
                    </p>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-1.5 transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">{uploadProgress}% complete</span>
                  </div>
                </div>
              ) : resumeUploaded ? (
                <div className="space-y-3 py-2">
                  <div className="w-12 h-12 bg-emerald-950/50 border border-emerald-500/25 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-slate-200 truncate max-w-[250px] mx-auto">
                      {resumeName}
                    </p>
                    <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mt-1">
                      Credentials Loaded & Persisted
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 py-2">
                  <UploadCloud className="w-12 h-12 text-indigo-500 mx-auto animate-float" />
                  <div>
                    <p className="text-[12.5px] font-bold text-slate-300">Drag & Drop Resume, or click to upload</p>
                    <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold tracking-widest">
                      Supports PDF or DOCX up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="flex items-center space-x-2.5 p-3.5 bg-rose-950/20 border border-rose-500/25 rounded-xl text-rose-300 text-[11px]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Interactive Parsed Data Preview (Renders when resumeUploaded is true) */}
          {resumeUploaded && parsedProfile && (
            <div className="glass-panel p-6 rounded-2xl space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b border-indigo-950/40 pb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 font-outfit">
                  Extracted Profile Preview
                </h3>
                <span className="text-[9px] text-cyan-400 font-bold font-mono">NLP Parser V1.2</span>
              </div>

              {/* Profile Preview Tab Bar */}
              <div className="flex space-x-1 border-b border-indigo-950/20 pb-1">
                {[
                  { id: 'skills', label: 'Tech Stack', icon: Code },
                  { id: 'education', label: 'Education', icon: GraduationCap },
                  { id: 'experience', label: 'Experience', icon: Briefcase },
                  { id: 'projects', label: 'Projects', icon: FileText }
                ].map(tab => {
                  const TabIcon = tab.icon;
                  const isActive = activePreviewTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActivePreviewTab(tab.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[10.5px] font-bold tracking-wide font-outfit transition-all duration-300 ${
                        isActive 
                          ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/40' 
                          : 'text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      <TabIcon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Tab Body Container */}
              <div className="min-h-[140px] max-h-[220px] overflow-y-auto pr-1">
                {activePreviewTab === 'skills' && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-medium font-sans">Extracted Skill Taxonomy Tags:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {parsedProfile.skills && parsedProfile.skills.length > 0 ? (
                        parsedProfile.skills.map(skill => (
                          <span key={skill} className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-950/40 border border-indigo-900/30 text-indigo-300">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-600 italic">No skills extracted. Update resume file.</span>
                      )}
                    </div>
                  </div>
                )}

                {activePreviewTab === 'education' && (
                  <div className="space-y-3">
                    {parsedProfile.education && parsedProfile.education.length > 0 ? (
                      parsedProfile.education.map((edu, idx) => (
                        <div key={idx} className="flex items-start space-x-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0 animate-pulse"></div>
                          <p className="text-[11px] font-sans text-slate-300 leading-relaxed">{edu}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-600 italic">No explicit education markers identified.</p>
                    )}
                  </div>
                )}

                {activePreviewTab === 'experience' && (
                  <div className="space-y-3">
                    {parsedProfile.experience && parsedProfile.experience.length > 0 ? (
                      parsedProfile.experience.map((exp, idx) => (
                        <div key={idx} className="flex items-start space-x-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></div>
                          <p className="text-[11px] font-sans text-slate-300 leading-relaxed">{exp}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-600 italic">No structured experience sections parsed.</p>
                    )}
                  </div>
                )}

                {activePreviewTab === 'projects' && (
                  <div className="space-y-3">
                    {parsedProfile.projects && parsedProfile.projects.length > 0 ? (
                      parsedProfile.projects.map((proj, idx) => (
                        <div key={idx} className="flex items-start space-x-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></div>
                          <p className="text-[11px] font-sans text-slate-300 leading-relaxed">{proj}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-600 italic">No personal projects elements extracted.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dynamic Job Matching Alignment Card */}
          {matchData && (
            <div className="glass-panel p-6 rounded-2xl space-y-5 animate-fade-in relative overflow-hidden">
              {/* Glowing decorative gradient behind card */}
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex justify-between items-center border-b border-indigo-950/40 pb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 font-outfit">
                  JD Requirements Analytics
                </h3>
                <span className="text-[10px] text-indigo-400 font-bold bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-900/30">
                  {matchData.jdSkills ? matchData.jdSkills.length : 0} Target Skills Extracted
                </span>
              </div>

              {/* Compatibility score section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center font-outfit tracking-wide shrink-0 ${getGlowColor(matchData.matchPercentage)} w-20 h-20 shadow-md`}>
                  <span className="text-2xl font-black">{matchData.matchPercentage}%</span>
                  <span className="text-[8px] font-bold uppercase mt-0.5 text-slate-400">Match score</span>
                </div>
                
                <div className="space-y-3 flex-1 w-full">
                  <p className="text-[11.5px] leading-normal text-slate-300 font-sans">
                    {matchData.recommendation}
                  </p>
                  
                  {/* Dynamic Progress Bar */}
                  <div className="space-y-1 w-full">
                    <div className="flex justify-between text-[9px] font-bold text-slate-500">
                      <span>COMPATIBILITY INDEX</span>
                      <span>{matchData.matchPercentage}% MATCH</span>
                    </div>
                    <div className="w-full bg-[#070a13] rounded-full h-2 overflow-hidden border border-indigo-950/40">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${matchData.matchPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Overlays Section */}
              <div className="space-y-3.5 pt-3 border-t border-indigo-950/40">
                
                {/* Matching Skills */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                      <span>Matching Stack Matrix:</span>
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">{matchData.matchingSkills ? matchData.matchingSkills.length : 0} matching</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 bg-emerald-950/5 p-2 rounded-xl border border-emerald-950/20">
                    {matchData.matchingSkills && matchData.matchingSkills.length > 0 ? (
                      matchData.matchingSkills.map(skill => (
                        <span key={skill} className="px-2 py-0.5 text-[9.5px] font-bold rounded-md bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 shadow shadow-emerald-950">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-600 italic px-1">No technology matches identified. Update requirements.</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                      <span>Missing Target Technologies:</span>
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">{matchData.missingSkills ? matchData.missingSkills.length : 0} missing</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 bg-amber-950/5 p-2 rounded-xl border border-amber-950/20">
                    {matchData.missingSkills && matchData.missingSkills.length > 0 ? (
                      matchData.missingSkills.map(skill => (
                        <span key={skill} className="px-2 py-0.5 text-[9.5px] font-bold rounded-md bg-amber-950/40 border border-amber-500/20 text-amber-400 shadow shadow-amber-950">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-emerald-400 italic px-1">100% overlays matched! Your resume supports all targets.</span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Start CTA Button */}
          <button
            onClick={handleStartInterview}
            className="w-full group py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/35 transition-all duration-300 flex items-center justify-center space-x-2 relative overflow-hidden"
          >
            <span className="font-outfit text-xs tracking-widest uppercase">Engage System Loop</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>

        </div>

      </div>
    </div>
  );
}