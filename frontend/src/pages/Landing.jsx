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
} from 'lucide-react';

const Landing = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('cloud');
  const navigate = useNavigate();

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
  }, []);

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
            {projects.filter(p => p.category === 'source-code').slice(0, 4).map((proj) => (
              <ProjectCard key={proj._id} project={proj} />
            ))}
          </div>
        )}
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
