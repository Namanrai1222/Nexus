import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple/10 via-bg to-cyan/10 pointer-events-none" />

      <div className="container-nx relative z-10 text-center">
        <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-text mb-4">
          Ready to build something better?
        </h2>
        <p className="text-subtext text-lg max-w-xl mx-auto mb-8">
          Join 50,000 members who chose a smarter way to discuss, discover, and grow.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <Link to="/register" className="btn-green text-base px-8 py-3">
            Create Free Account &rarr;
          </Link>
          <Link to="/feed" className="btn-ghost text-base px-8 py-3">
            See it in action
          </Link>
        </div>

        <p className="text-sm text-subtext">
          No credit card. No limits on free tier. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
