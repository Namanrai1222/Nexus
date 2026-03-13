import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, MessageSquare, CheckCircle } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center hero-mesh dot-grid overflow-hidden pt-16">
      {/* Gradient blobs */}
      <div className="absolute top-1/4 left-[10%] w-[500px] h-[500px] rounded-full bg-purple/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-[10%] w-[400px] h-[400px] rounded-full bg-cyan/10 blur-[100px] pointer-events-none" />

      <div className="container-nx relative z-10 grid lg:grid-cols-[1.4fr_1fr] gap-12 items-center py-16">
        {/* Left column */}
        <div className="animate-fadeInUp">
          <span className="badge-nx mb-6 inline-flex">🚀 The Forum. Reimagined.</span>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mb-6">
            Where Communities
            <br />
            Actually <span className="gradient-text">Connect</span>
          </h1>

          <p className="text-subtext text-lg max-w-xl mb-8 leading-relaxed">
            The only discussion platform that solves search, onboarding, moderation,
            and real-time — all at once. Join 50,000+ members.
          </p>

          <div className="flex flex-wrap gap-4 mb-6">
            <Link to="/register" className="btn-primary text-base px-8 py-3">
              Start for Free &rarr;
            </Link>
            <Link to="/feed" className="btn-ghost text-base px-8 py-3">
              Explore Communities
            </Link>
          </div>

          <p className="text-subtext text-sm flex flex-wrap gap-4">
            <span>✓ No credit card</span>
            <span>✓ Free forever</span>
            <span>✓ GDPR compliant</span>
          </p>
        </div>

        {/* Right column — mockup cards */}
        <div className="relative hidden lg:block h-[420px]">
          {/* Main post card */}
          <div className="card-nx absolute top-8 left-0 right-0 w-[340px] mx-auto animate-float z-10 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-purple/20 flex items-center justify-center text-purple text-sm font-bold">A</div>
              <div>
                <p className="text-sm font-medium text-text">alex_dev</p>
                <p className="text-xs text-subtext">r/reactjs · 2h ago</p>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-text mb-2">How to manage state in large React apps?</h3>
            <p className="text-xs text-subtext mb-3">I've been using Redux but wondering if Zustand or Jotai would be better for...</p>
            <div className="flex items-center gap-4 text-xs text-subtext">
              <div className="flex items-center gap-1">
                <ArrowUp size={14} className="text-purple" />
                <span className="text-text font-medium">142</span>
                <ArrowDown size={14} />
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare size={14} />
                <span>38 comments</span>
              </div>
              <span className="tag-nx text-[10px]">state-management</span>
            </div>
          </div>

          {/* Live indicator card */}
          <div className="glass-card absolute top-2 right-4 px-3 py-2 animate-float z-20" style={{ animationDelay: '0.5s' }}>
            <p className="text-xs font-medium text-text flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              Live: 3 reading
            </p>
          </div>

          {/* AI score card */}
          <div className="glass-card absolute bottom-8 right-8 px-4 py-3 animate-float z-20" style={{ animationDelay: '1s' }}>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green" />
              <div>
                <p className="text-xs font-medium text-text">AI Quality Score</p>
                <p className="text-lg font-display font-bold text-green">94/100</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
