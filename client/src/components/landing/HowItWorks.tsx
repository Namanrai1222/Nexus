import { UserPlus, Compass, TrendingUp } from 'lucide-react';

const steps = [
  {
    num: '01',
    icon: UserPlus,
    color: 'bg-purple',
    title: 'Create Your Account',
    description:
      'Sign up free. Our 5-step onboarding learns your interests and personalises your feed immediately.',
  },
  {
    num: '02',
    icon: Compass,
    color: 'bg-cyan',
    title: 'Find Your Communities',
    description:
      'Browse 500+ communities or create your own. Join in seconds. Start posting right away.',
  },
  {
    num: '03',
    icon: TrendingUp,
    color: 'bg-green',
    title: 'Contribute & Grow',
    description:
      'Post questions, share knowledge, vote on content. Build your Impact Score — not just karma.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-nx bg-bg2">
      <div className="container-nx">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-text mb-3">
            Up and running in 60 seconds
          </h2>
        </div>

        <div className="relative grid md:grid-cols-3 gap-8">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-px border-t-2 border-dashed border-border" />

          {steps.map((step) => (
            <div key={step.num} className="relative text-center">
              {/* Big faded number */}
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 font-display font-extrabold text-7xl text-border/30 select-none pointer-events-none">
                {step.num}
              </span>

              <div
                className={`relative z-10 w-14 h-14 rounded-full ${step.color} mx-auto mb-5 flex items-center justify-center`}
              >
                <step.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="font-display font-semibold text-lg text-text mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-subtext leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
