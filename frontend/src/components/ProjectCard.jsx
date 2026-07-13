import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Star, Heart, ShoppingCart, Award } from 'lucide-react';

const ProjectCard = ({ project }) => {
  const { user, toggleWishlist, isInWishlist } = useAuth();
  const { cartItems, addToCart } = useCart();
  const navigate = useNavigate();

  const isWishlisted = isInWishlist(project._id);
  const inCart = cartItems.some((item) => item._id === project._id);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    await toggleWishlist(project._id);
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCart) {
      navigate('/cart');
    } else {
      addToCart(project);
    }
  };

  const categoryLabels = {
    'source-code': 'Development',
    'templates': 'Design Template',
    'pdfs': 'E-Book Guide',
    'graphics': 'Creative Asset',
    'datasets': 'Data Science',
    'others': 'Asset',
  };

  const thumbnail = project.previewUrls?.[0] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
  const averageRating = project.ratings?.average || 4.8;
  const ratingCount = project.ratings?.count || 12;
  const isBestseller = project.price === 299 || project.downloadCount > 4;

  return (
    <Link to={`/projects/${project._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="glass-card" style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        background: 'var(--bg-secondary)'
      }}>
        {/* Bestseller Badge */}
        {isBestseller && (
          <span style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: '#eab308',
            color: '#1e1b4b',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            boxShadow: '0 2px 6px rgba(234, 179, 8, 0.4)',
            zIndex: 4
          }}>
            Bestseller
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(17, 24, 39, 0.7)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 5,
            color: isWishlisted ? '#f43f5e' : 'white',
            transition: 'all 0.2s ease'
          }}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={16} fill={isWishlisted ? '#f43f5e' : 'none'} />
        </button>

        {/* Project Thumbnail Image */}
        <div style={{
          margin: '-24px -24px 16px -24px',
          height: '150px',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: 'var(--bg-tertiary)'
        }}>
          <img
            src={thumbnail}
            alt={project.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
          <span style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(15, 23, 42, 0.8)',
            color: '#f8fafc',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {categoryLabels[project.category] || 'Project'}
          </span>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          
          {/* Title */}
          <h3 style={{
            fontSize: '16px',
            fontWeight: 700,
            marginBottom: '6px',
            color: 'var(--text-primary)',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '42px'
          }}>
            {project.title}
          </h3>

          {/* Author/Instructor */}
          <span style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginBottom: '6px',
            display: 'block'
          }}>
            By Apex Digital Academy
          </span>

          {/* Ratings (Udemy Style) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '12px',
            fontSize: '13px'
          }}>
            <strong style={{ color: '#fbbf24', fontWeight: 'bold' }}>
              {averageRating.toFixed(1)}
            </strong>
            <div style={{ display: 'flex', color: '#fbbf24' }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill={i < Math.round(averageRating) ? '#fbbf24' : 'none'}
                  stroke="#fbbf24"
                />
              ))}
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
              ({ratingCount})
            </span>

            {project.downloadCount > 0 && (
              <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontWeight: 700, fontSize: '11px' }}>
                {project.downloadCount * 18 + 43} students
              </span>
            )}
          </div>

          {/* Tech Stack Skills Gained */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            marginBottom: '16px'
          }}>
            {project.techStack?.slice(0, 3).map((tech, i) => (
              <span key={i} style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)'
              }}>
                {tech}
              </span>
            ))}
          </div>

          {/* Bottom Row: Price & Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border)',
            paddingTop: '14px',
            marginTop: 'auto'
          }}>
            <div>
              {/* Slashed Pricing Discount */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <strong style={{ fontSize: '17px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                  INR {project.price}
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  INR {project.price * 4 + 97}
                </span>
              </div>
            </div>

            <button
              onClick={handleCartClick}
              className={`btn ${inCart ? 'btn-secondary' : 'btn-primary'}`}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ShoppingCart size={12} />
              {inCart ? 'In Cart' : 'Buy Now'}
            </button>
          </div>

        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
