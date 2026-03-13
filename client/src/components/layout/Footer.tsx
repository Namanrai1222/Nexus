import { Link } from 'react-router-dom';
import { Github, Twitter, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg2 mt-auto">
      <div className="container-nx py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm">N</span>
              </div>
              <span className="font-display font-bold text-lg text-text">Nexus</span>
            </div>
            <p className="text-sm text-subtext mb-4">Where communities connect.</p>
            <div className="flex items-center gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-subtext hover:text-text transition-colors">
                <Github size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-subtext hover:text-text transition-colors">
                <Twitter size={18} />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-subtext hover:text-text transition-colors">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-display font-semibold text-text mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm text-subtext">
              <li><a href="#features" className="hover:text-text transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-text transition-colors">How it Works</a></li>
              <li><a href="#communities" className="hover:text-text transition-colors">Communities</a></li>
              <li><a href="#" className="hover:text-text transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-text transition-colors">Changelog</a></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-sm font-display font-semibold text-text mb-4">Community</h4>
            <ul className="space-y-2.5 text-sm text-subtext">
              <li><Link to="/feed" className="hover:text-text transition-colors">Explore Feed</Link></li>
              <li><Link to="/submit" className="hover:text-text transition-colors">Create Post</Link></li>
              <li><Link to="/feed?sort=top" className="hover:text-text transition-colors">Top Communities</Link></li>
              <li><Link to="/submit" className="hover:text-text transition-colors">Start a Community</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-display font-semibold text-text mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm text-subtext">
              <li><a href="#" className="hover:text-text transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-text transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-text transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-text transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-subtext">
          <span>&copy; {new Date().getFullYear()} Nexus. All rights reserved.</span>
          <span>Built with &hearts; and TypeScript</span>
        </div>
      </div>
    </footer>
  );
}
