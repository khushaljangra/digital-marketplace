import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { request } from '../utils/api';
import ProjectCard from '../components/ProjectCard';
import Loader from '../components/Loader';
import {
  Search,
  ArrowRight,
  Code,
  Cloud,
  Database,
  Layers,
  FileText,
  CheckCircle2,
  Users,
  Star,
  BookOpen,
  Bug,
  Terminal,
  AlertCircle,
} from 'lucide-react';

const BUG_PUZZLES = [
  {
    id: 1,
    title: "The Reference Trap",
    code: `const original = { user: 'Admin' };
const copy = original;
copy.user = 'Developer';

console.log(original.user); // Output?`,
    options: ["'Admin'", "'Developer'", "undefined", "ReferenceError"],
    correct: 1,
    explanation: "Objects are copied by reference in JavaScript. Modifying 'copy.user' directly changes the underlying object, altering 'original.user' too."
  },
  {
    id: 2,
    title: "Closure & Scopes",
    code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}`,
    options: ["0, 1, 2", "3, 3, 3", "undefined, undefined, undefined", "TypeError"],
    correct: 1,
    explanation: "Because 'var' is function-scoped (not block-scoped) and gets hoisted, the setTimeout callback executes after the loop has finished, printing '3' three times."
  },
  {
    id: 3,
    title: "Array Equivalence",
    code: `const a = [1, 2];
const b = [1, 2];

console.log(a == b || a === b); // Output?`,
    options: ["true", "false", "TypeError", "undefined"],
    correct: 1,
    explanation: "In JavaScript, arrays are objects. Comparing two distinct array objects always returns false, even if they have the exact same elements, because they reference different memory slots."
  }
];

const Landing = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('cloud');
  const navigate = useNavigate();

  // "Spot the Bug" Mini-Game States
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [gameFeedback, setGameFeedback] = useState(null); // 'success' | 'fail' | null
  const [rewardCoupon, setRewardCoupon] = useState('');
  const [gamePlayed, setGamePlayed] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await request('/projects?sort=popular');
        if (data.success) {
          setProjects(data.projects);
        }
      } catch (error) {
        console.error('Error fetching popular projects:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();

    // Init Daily Bug Challenge
    const day = new Date().getDay();
    const puzzleIndex = day % BUG_PUZZLES.length;
    setSelectedPuzzle(BUG_PUZZLES[puzzleIndex]);

    // Check if played today
    const lastPlayed = localStorage.getItem('bug_played_date');
    if (lastPlayed === new Date().toDateString()) {
      setGamePlayed(true);
      const savedCoupon = localStorage.getItem('bug_reward_coupon');
      if (savedCoupon) setRewardCoupon(savedCoupon);
    }
  }, []);

  const handleOptionSelect = (index) => {
    if (gamePlayed || gameFeedback) return;
    setSelectedOption(index);
  };

  const handleVerifyAnswer = async () => {
    if (selectedOption === null || gameFeedback) return;

    if (selectedOption === selectedPuzzle.correct) {
      setGameFeedback('success');
      try {
        const data = await request('/coupons/generate-bug-reward', 'POST');
        if (data.success) {
          setRewardCoupon(data.code);
          localStorage.setItem('bug_played_date', new Date().toDateString());
          localStorage.setItem('bug_reward_coupon', data.code);
        }
      } catch (err) {
        console.error('Error generating bug reward coupon:', err.message);
      }
    } else {
      setGameFeedback('fail');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchText.trim())}`);
    } else {
      navigate('/projects');
    }
  };

  const getFilteredProjects = () => {
    if (activeTab === 'cloud') {
      return projects.filter(p => p.techStack?.some(t => ['AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Cloud'].includes(t))).slice(0, 4);
    } else if (activeTab === 'fullstack') {
      return projects.filter(p => p.category === 'source-code').slice(0, 4);
    } else {
      return projects.filter(p => p.price === 299).slice(0, 4);
    }
  };

  const categories = [
    { icon: <Code size={20} />, label: 'Web Development', value: 'source-code', count: '4 Projects' },
    { icon: <Cloud size={20} />, label: 'DevOps & Cloud', value: 'cloud', count: '4 Projects' },
    { icon: <Database size={20} />, label: 'Data Science & ML', value: 'datasets', count: '1 Project' },
    { icon: <Layers size={20} />, label: 'UI/UX Templates', value: 'templates', count: '1 Project' },
    { icon: <FileText size={20} />, label: 'PDF Handbooks', value: 'pdfs', count: '1 Project' },
  ];

  return (
    <div style={{ paddingBottom: '100px' }} className="animate-fade-in">
      
      {/* Hero Header (Udemy/Coursera Style) */}
      <section style={{
        position: 'relative',
        padding: '90px 0 70px 0',
        background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, rgba(11, 15, 25, 0) 100%)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="container" style={{
          textAlign: 'center',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          
          <span className="badge badge-primary" style={{ marginBottom: '16px', padding: '6px 12px', fontSize: '12px' }}>
            Over 12,500+ developers enrolled
          </span>
          <h1 style={{
            fontSize: '48px',
            lineHeight: 1.15,
            fontWeight: 800,
            marginBottom: '20px',
            color: 'var(--text-primary)',
            letterSpacing: '-1px'
          }}>
            Learn from <br />
            <span style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Real Production-Ready Source Code</span>
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '16px',
            lineHeight: 1.6,
            marginBottom: '32px'
          }}>
            Skip simple Hello World tutorials. Study, modify, and build with production-grade templates, starter scripts, PDFs, and complete SaaS source code. Build faster, learn deeper.
          </p>

          {/* Central Search Bar (Udemy Style) */}
          <form onSubmit={handleSearchSubmit} className="hero-search-form" style={{
            display: 'flex',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '6px',
            maxWidth: '520px',
            margin: '0 auto 24px auto',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ position: 'relative', flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <Search size={18} style={{ color: 'var(--text-muted)', marginLeft: '12px', position: 'absolute' }} />
              <input
                type="text"
                placeholder="What do you want to build today? (e.g. AWS, React)..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  padding: '10px 10px 10px 40px',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '14px', borderRadius: '6px' }}>
              Search
            </button>
          </form>

          {/* Trust Bulletpoints */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: 'var(--text-secondary)', fontSize: '13px', justifyContent: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Full Source Code
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Lifetime Access
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Clean Architectures
            </span>
          </div>

        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="container" style={{ padding: '60px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Popular Projects
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              Study, download, and build with production-ready cloud and full-stack templates.
            </p>
          </div>
          <Link to="/projects" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '14px', borderRadius: '6px' }}>
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : projects.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No projects found.</p>
          </div>
        ) : (
          <div className="grid-cols-4" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '24px'
          }}>
            {projects.slice(0, 4).map((proj) => (
              <ProjectCard key={proj._id} project={proj} />
            ))}
          </div>
        )}
      </section>

      <div style={{ margin: '40px 0' }} />

      {/* Spot the Bug Mini-Game Section */}
      <section className="container" style={{ marginBottom: '40px' }}>
        <div className="glass-card" style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          padding: '40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
          alignItems: 'flex-start'
        }}>
          {/* Left panel: Info & Code */}
          <div>
            <span className="badge badge-accent" style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Bug size={12} /> Daily Code Challenge
            </span>
            <h2 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '12px' }}>
              Spot The Bug 🐛
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              Solve today's coding puzzle to prove your developer skills and earn a **10% discount coupon** valid for 24 hours!
            </p>

            {selectedPuzzle && (
              <div style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: '13px',
                color: '#e2e8f0',
                whiteSpace: 'pre-wrap',
                overflowX: 'auto',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '11px', borderBottom: '1px solid #1e293b', paddingBottom: '8px', marginBottom: '12px' }}>
                  <Terminal size={14} /> {selectedPuzzle.title}.js
                </div>
                {selectedPuzzle.code}
              </div>
            )}
          </div>

          {/* Right panel: Options & Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', justifyContent: 'center' }}>
            {gamePlayed ? (
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '30px',
                borderRadius: '16px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-lg)'
              }}>
                <CheckCircle2 size={48} style={{ color: 'var(--success)', marginBottom: '14px' }} />
                <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '10px' }}>Bug Solved Successfully!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
                  You have already completed today's challenge. Come back tomorrow for a new puzzle!
                </p>
                {rewardCoupon && (
                  <div style={{
                    background: 'var(--bg-primary)',
                    border: '1.5px dashed var(--success)',
                    padding: '12px 18px',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: 800,
                    color: 'var(--primary)',
                    display: 'inline-block',
                    letterSpacing: '1px'
                  }}>
                    {rewardCoupon}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedPuzzle?.options.map((opt, idx) => (
                    <button
                      key={idx}
                      disabled={gameFeedback !== null}
                      onClick={() => handleOptionSelect(idx)}
                      style={{
                        textAlign: 'left',
                        padding: '14px 18px',
                        borderRadius: '8px',
                        border: selectedOption === idx 
                          ? '1px solid var(--primary)' 
                          : '1px solid var(--border)',
                        background: selectedOption === idx 
                          ? 'rgba(99, 102, 241, 0.1)' 
                          : 'var(--bg-primary)',
                        color: selectedOption === idx 
                          ? 'var(--primary)' 
                          : 'var(--text-primary)',
                        fontSize: '13px',
                        cursor: gameFeedback ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        fontWeight: selectedOption === idx ? 600 : 400
                      }}
                    >
                      {idx + 1}. {opt}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button
                    disabled={selectedOption === null || gameFeedback !== null}
                    onClick={handleVerifyAnswer}
                    className="btn btn-primary"
                    style={{ flexGrow: 1, padding: '14px' }}
                  >
                    Verify Solution
                  </button>
                  {gameFeedback && (
                    <button
                      onClick={() => {
                        setSelectedOption(null);
                        setGameFeedback(null);
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '14px' }}
                    >
                      Reset
                    </button>
                  )}
                </div>

                {gameFeedback === 'success' && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid var(--success)',
                    padding: '16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5'
                  }}>
                    <strong style={{ color: 'var(--success)', display: 'block', marginBottom: '4px' }}>✓ CORRECT ANSWER!</strong>
                    {selectedPuzzle.explanation}
                  </div>
                )}

                {gameFeedback === 'fail' && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--error)',
                    padding: '16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5'
                  }}>
                    <strong style={{ color: 'var(--error)', display: 'block', marginBottom: '4px' }}>❌ INCORRECT OPTION!</strong>
                    That answer is wrong. Check the code logic, variables scope, or types comparison and try again!
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <div style={{ margin: '40px 0' }} />

      {/* Contact Support Section */}
      <section className="container" style={{ marginBottom: '60px' }}>
        <div className="glass-card" style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          padding: '48px',
          borderRadius: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '30px'
        }}>
          <div style={{ maxWidth: '600px' }}>
            <span className="badge badge-primary" style={{ marginBottom: '16px' }}>24/7 Support Desk</span>
            <h2 style={{ fontSize: '30px', color: 'var(--text-primary)', marginBottom: '12px' }}>
              Have Questions or Need Support?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6 }}>
              Have queries about source code setups, custom development bids, or payment verifications? Get in touch with our tech team. We respond within 1-2 hours.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href="mailto:tempphone300@gmail.com" className="btn btn-secondary" style={{ padding: '14px 24px' }}>
              ✉️ Email Support
            </a>
            <Link to="/support" className="btn btn-primary" style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💬 Open Live Chat <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
