'use client';

import { ArrowRight, Bookmark, CheckCircle, Package } from 'lucide-react';

const FEATURES = [
  'Unlimited projects & collaborators',
  'Advanced analytics & reporting',
  'Priority support & SLA guarantee',
] as const;

export default function ComponentHero() {
  return (
    <div className="component-hero" aria-hidden>
      <div className="hero-card">
        <div className="hero-card-top">
          <div className="hero-card-image">
            <Package aria-hidden size={28} color="var(--color-text-tertiary)" strokeWidth={2} />
          </div>
          <div className="hero-card-info">
            <div className="hero-card-name">Annual Pro Plan</div>
            <div className="hero-card-subtitle">
              <span className="hero-card-subtitle-text">Billed yearly</span>
              <span className="hero-card-badge">Save 40%</span>
            </div>
            <div className="hero-card-price" style={{ marginTop: '2px' }}>
              <span className="hero-card-price-main">$12</span>
              <span className="hero-card-price-sub">.99/mo</span>
            </div>
          </div>
        </div>
        <div className="hero-card-divider" />
        <div className="hero-card-bottom">
          <div className="hero-card-features">
            {FEATURES.map((text) => (
              <div key={text} className="hero-card-feature">
                <CheckCircle
                  aria-hidden
                  size={13}
                  strokeWidth={2}
                  style={{ color: '#0A8853', flexShrink: 0 }}
                />
                {text}
              </div>
            ))}
          </div>
          <button type="button" className="hero-card-cta">
            Start free trial
            <ArrowRight aria-hidden size={16} strokeWidth={2} />
          </button>
        </div>
        <div className="hero-card-divider" />
        <div className="hero-card-footer-section">
          <div className="hero-card-footer">
            <span className="hero-card-footer-text">No credit card required</span>
            <div className="hero-card-actions">
              <button type="button" className="hero-pill-secondary">
                Compare plans
              </button>
              <button type="button" className="hero-btn-icon" aria-label="Bookmark">
                <Bookmark
                  aria-hidden
                  size={14}
                  strokeWidth={2}
                  style={{ color: 'var(--color-text-secondary)' }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
