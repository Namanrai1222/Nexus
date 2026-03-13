import { Star } from 'lucide-react';

const testimonials = [
  {
    quote:
      "Finally a forum where I'm not afraid to ask basic questions. The AI coach told me exactly how to improve my post before I submitted.",
    name: 'Alex T.',
    role: 'Software Developer',
    initial: 'A',
    color: 'bg-purple/20 text-purple',
  },
  {
    quote:
      'Our Stack Overflow clone was dying. We moved to Nexus and moderation time dropped 80% because the AI handles the obvious stuff first.',
    name: 'Maria C.',
    role: 'Community Manager',
    initial: 'M',
    color: 'bg-cyan/20 text-cyan',
  },
  {
    quote:
      "I've tried Reddit, Discord, Discourse. Nexus is the first one where I can actually find what I posted 3 months ago.",
    name: 'Jordan L.',
    role: 'Open Source Contributor',
    initial: 'J',
    color: 'bg-green/20 text-green',
  },
  {
    quote:
      "The semantic search is insane. I searched 'why does my callback run twice' and it found the exact answer I needed from a post titled 'useEffect cleanup explained'.",
    name: 'Dev S.',
    role: 'React Engineer',
    initial: 'D',
    color: 'bg-orange/20 text-orange',
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="section-nx">
      <div className="container-nx">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-text mb-3">
            Loved by communities
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="card-nx">
              <span className="text-5xl font-display text-purple/30 leading-none select-none">&ldquo;</span>
              <p className="text-text text-sm italic leading-relaxed mb-5 -mt-4">
                {t.quote}
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center font-display font-bold text-sm`}
                >
                  {t.initial}
                </div>
                <div>
                  <p className="text-sm font-medium text-text">
                    {t.name} — <span className="text-subtext">{t.role}</span>
                  </p>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={12} className="text-yellow fill-yellow" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
