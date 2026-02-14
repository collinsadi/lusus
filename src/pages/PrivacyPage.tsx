import { Link } from 'react-router-dom';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10 last:mb-0">
      <h2 className="text-lg font-semibold text-text-primary mb-3">{title}</h2>
      <div className="text-text-secondary text-sm leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

// function BulletList({ items }: { items: (string | React.ReactNode)[] }) {
//   return (
//     <ul className="space-y-2 ml-1">
//       {items.map((item, i) => (
//         <li key={i} className="flex items-start gap-3">
//           <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-accent mt-2" />
//           <span>{item}</span>
//         </li>
//       ))}
//     </ul>
//   );
// }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-3 block">
            Legal
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
            Privacy Policy
          </h1>
          <p className="text-text-muted text-sm">
            Last updated: February 13, 2026
          </p>
        </div>

        {/* Content */}
        <div className="glass-card p-8 sm:p-10 animate-fade-in-up delay-200">
          <Section title="Introduction">
            <p>
              Welcome to Lusus. We respect your privacy and are committed to transparency 
              about how our game works. This policy explains our approach to your data 
              when you use Lusus.
            </p>
          </Section>

          <Section title="No Data Collection">
            <p>
              Lusus does not collect, store, or transmit any personal data. We do not track 
              your game scores, streaks, or statistics. We do not require accounts, and we 
              do not collect usernames, email addresses, device information, or usage data 
              of any kind.
            </p>
            <p>
              All game data — including your scores, streaks, and progress — stays entirely 
              on your device and is never sent to any server.
            </p>
          </Section>

          <Section title="Multiplayer">
            <p>
              When you use the multiplayer feature, Lusus establishes a temporary WebSocket 
              connection to facilitate real-time gameplay between players. This connection is 
              used solely for live game synchronization (e.g. room codes, ready states, and 
              in-game actions). No personal data is collected or stored through this connection, 
              and no information persists after the session ends.
            </p>
          </Section>

          <Section title="Third-Party Services">
            <p>
              Lusus does not integrate any third-party analytics, advertising, or tracking 
              services. We do not share any information with third parties because we do not 
              collect any information in the first place.
            </p>
          </Section>

          <Section title="Children's Privacy">
            <p>
              Lusus is suitable for all ages. Since we do not collect any personal information, 
              there are no special concerns regarding children's data.
            </p>
          </Section>

          <Section title="Open Source">
            <p>
              Lusus is fully open source. You can inspect the entire codebase to verify our 
              privacy practices at{' '}
              <a
                href="https://github.com/collinsadi/lusus"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-light transition-colors"
              >
                github.com/collinsadi/lusus
              </a>.
            </p>
          </Section>

          <Section title="Changes to This Policy">
            <p>
              We may update this policy from time to time. Changes will be posted on this page 
              with an updated revision date. We encourage you to review this page periodically.
            </p>
          </Section>

          <Section title="Contact Us">
            <p>
              If you have any questions about this privacy policy, 
              reach out to us at{' '}
              <a
                href="mailto:play@collinsadi.xyz"
                className="text-accent hover:text-accent-light transition-colors"
              >
                play@collinsadi.xyz
              </a>
              {' '}or visit our{' '}
              <Link
                to="/contact"
                className="text-accent hover:text-accent-light transition-colors"
              >
                contact page
              </Link>.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
