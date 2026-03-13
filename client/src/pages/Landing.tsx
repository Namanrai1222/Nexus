import LandingNav from '../components/layout/LandingNav';
import HeroSection from '../components/landing/HeroSection';
import StatsBar from '../components/landing/StatsBar';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorks from '../components/landing/HowItWorks';
import LiveFeedPreview from '../components/landing/LiveFeedPreview';
import CommunityShowcase from '../components/landing/CommunityShowcase';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/layout/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg">
      <LandingNav />
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <HowItWorks />
      <LiveFeedPreview />
      <CommunityShowcase />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
