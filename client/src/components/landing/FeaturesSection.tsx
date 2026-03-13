import { Search, Bot, MessageSquare, Shield, Drama, BookOpen } from 'lucide-react';

const features = [
  {
    icon: Search,
    color: 'text-cyan',
    bg: 'bg-cyan/10',
    title: 'Semantic Search',
    description: 'Find anything, even without the exact words. Our AI understands what you mean.',
  },
  {
    icon: Bot,
    color: 'text-purple',
    bg: 'bg-purple/10',
    title: 'AI Post Coach',
    description: "Get private feedback before you post. No more getting downvoted for a fixable mistake.",
  },
  {
    icon: MessageSquare,
    color: 'text-green',
    bg: 'bg-green/10',
    title: 'Live Threads',
    description: "Comments appear instantly. See who's reading right now. No refresh needed.",
  },
  {
    icon: Shield,
    color: 'text-orange',
    bg: 'bg-orange/10',
    title: 'Smart Moderation',
    description: "AI pre-screens toxic content. Moderators get full context. Bad actors don't win.",
  },
  {
    icon: Drama,
    color: 'text-pink',
    bg: 'bg-pink/10',
    title: 'Private Personas',
    description: 'Be yourself in some communities. Stay anonymous in others. Fully separate, always safe.',
  },
  {
    icon: BookOpen,
    color: 'text-yellow',
    bg: 'bg-yellow/10',
    title: 'Knowledge Vault',
    description: 'Nothing disappears. AI summarizes threads. Old answers stay findable forever.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="section-nx">
      <div className="container-nx">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-text mb-3">
            Every problem. Solved.
          </h2>
          <p className="text-subtext text-lg max-w-2xl mx-auto">
            We studied what breaks communities and built direct solutions.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="card-nx group hover:-translate-y-1 hover:shadow-lg hover:shadow-purple/5 transition-all duration-300"
            >
              <div className={`w-11 h-11 rounded-lg ${f.bg} flex items-center justify-center mb-4`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="font-display font-semibold text-lg text-text mb-2">{f.title}</h3>
              <p className="text-sm text-subtext leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
