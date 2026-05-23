import React from 'react';
import { Bot, ChevronRight, Code2, Sparkles, Target, Zap } from 'lucide-react';

export default function Landing({ setCurrentTab }) {
  return (
    <div style={{ width: '100vw', minHeight: '100vh', background: '#0a0a0a', color: '#e8e8e8', display: 'flex', flexDirection: 'column', margin: 0, padding: 0 }}>
      {/* Navbar Minimal */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 48px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} color="#000" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#fff', letterSpacing: '0.05em' }}>Camsense AI</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={() => setCurrentTab('login')}
            style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#ccc', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ccc'; }}
          >
            Log in
          </button>
          <button 
            onClick={() => setCurrentTab('signup')}
            style={{ padding: '10px 20px', background: '#fff', border: '1px solid #fff', borderRadius: '8px', color: '#000', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = '#e0e0e0'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#fff'; }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        
        {/* Subtle background glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(10,10,10,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ padding: '8px 16px', background: '#111', border: '1px solid #222', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          <Sparkles size={14} color="#aaa" />
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#ccc', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Next-Generation Technical Interviews</span>
        </div>

        <h1 style={{ fontSize: '64px', fontWeight: '800', color: '#fff', lineHeight: '1.1', maxWidth: '800px', margin: '0 0 24px', letterSpacing: '-0.02em' }}>
          Assess Engineering Talent with <span style={{ color: '#aaa' }}>Superhuman Precision</span>
        </h1>
        
        <p style={{ fontSize: '18px', color: '#888', lineHeight: '1.6', maxWidth: '600px', margin: '0 0 48px' }}>
          Camsense AI delivers high-fidelity mock interviews, dynamic coding sandboxes, and deep resume-based evaluation, removing bias and saving hundreds of engineering hours.
        </p>

        <div style={{ display: 'flex', gap: '16px', zIndex: 10 }}>
          <button 
            onClick={() => setCurrentTab('signup')}
            style={{ padding: '16px 36px', background: '#fff', border: 'none', borderRadius: '10px', color: '#000', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s' }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Start Interviewing <ChevronRight size={18} />
          </button>
        </div>

        {/* Features Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: '1000px', margin: '80px auto 0', textAlign: 'left', zIndex: 10 }}>
          {[
            { icon: <Target size={24} color="#fff" />, title: 'Resume-Driven Context', desc: 'AI dynamically calibrates questions based on the exact requirements of your loaded JD and candidate profile.' },
            { icon: <Code2 size={24} color="#fff" />, title: 'Real-time Code Sandbox', desc: 'Secure, fullscreen IDE execution with embedded anti-cheat telemetry and syntax analysis.' },
            { icon: <Zap size={24} color="#fff" />, title: 'Instant Synthesis', desc: 'Comprehensive grading matrix, feedback reports, and aptitude breakdowns generated in seconds.' }
          ].map((f, i) => (
            <div key={i} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '32px' }}>
              <div style={{ width: '48px', height: '48px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#fff', margin: '0 0 12px' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: '#888', lineHeight: '1.6', margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
