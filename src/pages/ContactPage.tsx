export default function ContactPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-3 block">
            Contact
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
            Get in touch
          </h1>
          <p className="text-text-secondary text-lg max-w-md mx-auto">
            Have feedback, a question, or just want to say hi? We'd love to hear from you.
          </p>
        </div>

        {/* Email card */}
        <div className="glass-card p-8 sm:p-10 text-center animate-fade-in-up delay-200">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Email us</h2>
          <a
            href="mailto:play@collinsadi.xyz"
            className="text-lg text-accent hover:text-accent-light transition-colors"
          >
            play@collinsadi.xyz
          </a>
          <p className="mt-4 text-sm text-text-muted">
            We typically reply within 24 – 48 hours.
          </p>
        </div>

        {/* Topics */}
        <div className="mt-6 grid sm:grid-cols-2 gap-4 animate-fade-in-up delay-300">
          {[
            {
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636a9 9 0 11-12.728 0M12 9v4m0 4h.01" />
                </svg>
              ),
              title: 'Bug reports',
              desc: 'Found something broken? Let us know and we\'ll fix it.',
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              ),
              title: 'Feature requests',
              desc: 'Have an idea that would make Lusus better? We\'re all ears.',
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              ),
              title: 'General feedback',
              desc: 'Tell us what you think — good, bad, or in between.',
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
              title: 'Business inquiries',
              desc: 'Interested in partnerships or press? Reach out.',
            },
          ].map((item, i) => (
            <div key={i} className="glass-card p-5 flex gap-4 items-start">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                {item.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">{item.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
