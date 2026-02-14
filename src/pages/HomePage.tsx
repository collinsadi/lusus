import { useState, useEffect, useRef, useCallback } from 'react';
import { STORE_LINKS, ANDROID_APK_PATH } from '../config';

/* ───── Decorative shape SVGs (matching the game's aesthetic) ───── */
function ShapeGrid() {
  const shapes = [
    { color: '#f472b6', d: 'M12 2L22 20H2L12 2Z' },          // triangle
    { color: '#22d3ee', d: 'M4 4H20V20H4V4Z' },               // square
    { color: '#fbbf24', d: 'M12 2L15 9H22L16.5 13.5L18.5 21L12 17L5.5 21L7.5 13.5L2 9H9L12 2Z' }, // star
    { color: '#34d399', d: 'M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z' }, // circle
    { color: '#a78bfa', d: 'M12 2L22 20H2L12 2Z' },           // triangle
    { color: '#fb923c', d: 'M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z' }, // circle
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {shapes.map((shape, i) => (
        <svg
          key={i}
          className="absolute opacity-[0.04] animate-float"
          style={{
            width: 40 + (i * 12),
            height: 40 + (i * 12),
            top: `${15 + (i * 14)}%`,
            left: i % 2 === 0 ? `${5 + (i * 3)}%` : undefined,
            right: i % 2 !== 0 ? `${5 + (i * 3)}%` : undefined,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${5 + i}s`,
          }}
          viewBox="0 0 24 24"
          fill={shape.color}
        >
          <path d={shape.d} />
        </svg>
      ))}
    </div>
  );
}

/* ───── Screenshot Carousel ───── */
function PhoneCarousel() {
  const screenshots = ['/ios_1.png', '/ios_2.png', '/ios_3.png', '/ios_4.png', '/ios_5.png'];
  const [active, setActive] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoplay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % screenshots.length);
    }, 4000);
  };

  useEffect(() => {
    startAutoplay();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const goTo = (idx: number) => {
    setActive(idx);
    startAutoplay();
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Glow backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full bg-accent/15 blur-[100px]" />

      {/* Phone frame */}
      <div className="relative w-[260px] sm:w-[280px]">
        <div className="relative rounded-[40px] overflow-hidden border-[3px] border-border-light bg-bg-card shadow-2xl shadow-accent/10">
          <div className="relative aspect-[390/844] overflow-hidden">
            {screenshots.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Lusus gameplay screenshot ${i + 1}`}
                className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ${
                  i === active
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-105'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="flex gap-2 mt-8">
        {screenshots.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === active
                ? 'w-7 h-2 bg-accent'
                : 'w-2 h-2 bg-border-light hover:bg-text-muted'
            }`}
            aria-label={`View screenshot ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ───── Feature card ───── */
function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}) {
  return (
    <div className={`glass-card p-6 transition-all duration-300 hover:border-accent/30 group animate-fade-in-up ${delay}`}>
      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}

/* ───── Step component ───── */
function Step({
  number,
  title,
  description,
  color,
}: {
  number: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="flex gap-5">
      <div
        className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
        style={{ background: `${color}20`, color }}
      >
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/* ───── Interactive Mini-Game Demo ───── */
const SHAPES = [
  { name: 'triangle', color: '#a78bfa', d: 'M12 2L22 20H2Z' },
  { name: 'circle', color: '#f472b6', d: 'M12 21C16.97 21 21 16.97 21 12S16.97 3 12 3S3 7.03 3 12S7.03 21 12 21Z' },
  { name: 'star', color: '#fbbf24', d: 'M12 2L15 9H22L16.5 13.5L18.5 21L12 17L5.5 21L7.5 13.5L2 9H9Z' },
  { name: 'square', color: '#22d3ee', d: 'M4 4H20V20H4Z' },
  { name: 'hexagon', color: '#34d399', d: 'M9 2L15 2L20 7L20 13L15 18L9 18L4 13L4 7Z' },
  { name: 'heart', color: '#fb923c', d: 'M12 4.528a6 6 0 00-8.243 8.715L12 21.328l8.243-8.085A6 6 0 0012 4.528z' },
  { name: 'diamond', color: '#f472b6', d: 'M12 2L22 12L12 22L2 12Z' },
  { name: 'pentagon', color: '#a78bfa', d: 'M12 2L21.5 9.5L18 20H6L2.5 9.5Z' },
];

type Phase = 'idle' | 'memorize' | 'choose' | 'correct' | 'wrong';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MiniGame() {
  const GRID_SIZE = 9; // 3x3 grid
  const MEMORIZE_MS = 2500;

  const [phase, setPhase] = useState<Phase>('idle');
  const [memorizeShapes, setMemorizeShapes] = useState<typeof SHAPES>([]);
  const [chooseShapes, setChooseShapes] = useState<typeof SHAPES>([]);
  const [oddIndex, setOddIndex] = useState(-1);
  const [tappedIndex, setTappedIndex] = useState(-1);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const startRound = useCallback(() => {
    clearTimer();
    setTappedIndex(-1);

    // Pick GRID_SIZE random shapes (with repetition allowed from the pool)
    const pool = shuffle(SHAPES);
    const picked: typeof SHAPES = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      picked.push(pool[i % pool.length]);
    }
    setMemorizeShapes(shuffle(picked));

    // Build the challenge set: replace one shape with one that wasn't in the memorize set
    const usedNames = new Set(picked.map((s) => s.name));
    const unusedShapes = SHAPES.filter((s) => !usedNames.has(s.name));

    let oddShape: (typeof SHAPES)[number];
    if (unusedShapes.length > 0) {
      oddShape = unusedShapes[Math.floor(Math.random() * unusedShapes.length)];
    } else {
      // All shapes used — pick a random one and change its color to make it different
      const base = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const otherColors = SHAPES.filter((s) => s.color !== base.color);
      const altColor = otherColors[Math.floor(Math.random() * otherColors.length)].color;
      oddShape = { ...base, name: '__odd__', color: altColor };
    }

    const replaceIdx = Math.floor(Math.random() * GRID_SIZE);
    const challenge = shuffle(picked).map((s, i) => (i === replaceIdx ? oddShape : s));
    const shuffled = shuffle(challenge.map((s, i) => ({ ...s, _origIdx: i })));
    const newOddIdx = shuffled.findIndex((s) => s._origIdx === replaceIdx);

    setChooseShapes(shuffled.map(({ _origIdx, ...rest }) => rest) as typeof SHAPES);
    setOddIndex(newOddIdx);

    // Start memorize phase
    setPhase('memorize');
    setTimeLeft(MEMORIZE_MS / 1000);

    const started = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - started;
      const remaining = Math.max(0, Math.ceil((MEMORIZE_MS - elapsed) / 1000));
      setTimeLeft(remaining);
      if (elapsed >= MEMORIZE_MS) {
        clearTimer();
        setPhase('choose');
      }
    }, 100);
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const handleTap = (index: number) => {
    if (phase !== 'choose' || tappedIndex !== -1) return;
    setTappedIndex(index);

    if (index === oddIndex) {
      setPhase('correct');
      setStreak((s) => s + 1);
      setTimeout(() => startRound(), 1200);
    } else {
      setPhase('wrong');
      setStreak(0);
      setTimeout(() => setPhase('idle'), 1800);
    }
  };

  const currentShapes = phase === 'memorize' ? memorizeShapes : chooseShapes;
  const showGrid = phase !== 'idle';

  return (
    <div className="glass-card p-5 sm:p-6 w-full max-w-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          {showGrid && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-muted">Streak</span>
              <span className="font-bold text-text-primary">{streak}</span>
            </div>
          )}
          {phase === 'memorize' && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-muted">Memorize</span>
              <span className="font-bold text-yellow">{timeLeft}s</span>
            </div>
          )}
          {phase === 'choose' && (
            <span className="text-sm text-accent font-medium">Tap the odd one!</span>
          )}
          {phase === 'correct' && (
            <span className="text-sm text-green font-medium">Correct!</span>
          )}
          {phase === 'wrong' && (
            <span className="text-sm text-pink font-medium">Wrong — streak reset</span>
          )}
        </div>
        {phase === 'idle' && (
          <span className="text-xs text-text-muted">Try it yourself</span>
        )}
      </div>

      {/* Grid / Start state */}
      {phase === 'idle' ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="grid grid-cols-3 gap-2 mb-6 opacity-30">
            {SHAPES.slice(0, 9).map((s, i) => (
              <div key={i} className="w-12 h-12 rounded-lg bg-bg-card-hover flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill={s.color}>
                  <path d={s.d} />
                </svg>
              </div>
            ))}
          </div>
          <button
            onClick={startRound}
            className="px-6 py-2.5 bg-accent hover:bg-accent-light text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent/25"
          >
            Play Demo
          </button>
          {streak > 0 && (
            <p className="mt-3 text-xs text-text-muted">Best streak this session: {streak}</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {currentShapes.map((shape, i) => {
            let cellClass = 'bg-bg-card-hover';
            if (phase === 'choose' && tappedIndex === -1) {
              cellClass = 'bg-bg-card-hover hover:bg-border-light cursor-pointer hover:scale-105 active:scale-95';
            }
            if (tappedIndex !== -1 && i === oddIndex) {
              cellClass = phase === 'correct' ? 'bg-green/20 ring-2 ring-green' : 'bg-green/20 ring-2 ring-green';
            }
            if (tappedIndex !== -1 && i === tappedIndex && i !== oddIndex) {
              cellClass = 'bg-pink/20 ring-2 ring-pink';
            }

            return (
              <button
                key={`${phase}-${i}`}
                onClick={() => handleTap(i)}
                disabled={phase !== 'choose' || tappedIndex !== -1}
                className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-200 ${cellClass}`}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill={shape.color}
                  className={`transition-all duration-300 ${
                    phase === 'memorize' ? 'opacity-90' : 'opacity-85'
                  }`}
                >
                  <path d={shape.d} />
                </svg>
              </button>
            );
          })}
        </div>
      )}

      {/* Memorize phase progress bar */}
      {phase === 'memorize' && (
        <div className="mt-4 h-1 bg-bg-card-hover rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${(timeLeft / (MEMORIZE_MS / 1000)) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

/* ───── Download buttons (only rendered when a link exists) ───── */
const isTestFlight = (url: string) =>
  url.includes('testflight.apple.com');

function DownloadButtons() {
  const hasIos = !!STORE_LINKS.ios;
  const hasPlayStore = !!STORE_LINKS.android;
  const hasAndroidApk = !!ANDROID_APK_PATH;
  const hasAndroid = hasPlayStore || hasAndroidApk;

  if (!hasIos && !hasAndroid) return null;

  const androidHref = hasPlayStore ? STORE_LINKS.android : ANDROID_APK_PATH;
  const androidLabel = hasPlayStore ? 'Google Play' : 'Download APK';

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
      {hasIos && (
        <a
          href={STORE_LINKS.ios}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center justify-center gap-2.5 px-5 py-2.5 sm:px-7 sm:py-3.5 bg-accent hover:bg-accent-light text-white text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent/25"
        >
          {isTestFlight(STORE_LINKS.ios) ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2a8 8 0 110 16 8 8 0 010-16zm-1.5 3.5v5.586l-2.293-2.293-1.414 1.414L12 17.414l5.207-5.207-1.414-1.414L13.5 13.086V7.5h-3z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 21.99C7.79 22.03 6.8 20.68 5.96 19.47C4.25 16.99 2.97 12.5 4.7 9.48C5.55 7.98 7.13 7.01 8.82 6.99C10.1 6.97 11.32 7.85 12.11 7.85C12.89 7.85 14.37 6.78 15.92 6.95C16.57 6.98 18.39 7.21 19.56 8.91C19.47 8.97 17.39 10.16 17.41 12.67C17.44 15.66 20.06 16.62 20.09 16.63C20.07 16.69 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
            </svg>
          )}
          {isTestFlight(STORE_LINKS.ios) ? 'Get on TestFlight' : 'App Store'}
          <svg className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </a>
      )}
      {hasAndroid && (
        <a
          href={androidHref}
          {...(hasPlayStore ? { target: '_blank', rel: 'noopener noreferrer' } : { download: 'lusus.apk' })}
          className="group inline-flex items-center justify-center gap-2.5 px-5 py-2.5 sm:px-7 sm:py-3.5 bg-bg-card hover:bg-bg-card-hover border border-border hover:border-border-light text-text-primary text-sm sm:text-base font-semibold rounded-xl transition-all duration-200"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.396 12l2.302-3.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
          </svg>
          {androidLabel}
          {hasPlayStore && (
            <svg className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          )}
        </a>
      )}
    </div>
  );
}

/* ═══════════════════════════ HOME PAGE ═══════════════════════════ */
export default function HomePage() {
  return (
    <div>
      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <ShapeGrid />

        {/* Radial gradient backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/8 rounded-full blur-[160px]" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Copy */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-8 animate-fade-in-up">
                <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                <span className="text-xs font-medium text-accent-light">Reverse Memory Game</span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight animate-fade-in-up delay-100 text-text-primary">
                Find the shape
                <br />
                that{' '}
                <span className="text-accent underline decoration-accent/40 underline-offset-4 sm:underline-offset-8 decoration-[3px]">wasn't</span>
                {' '}there
              </h1>

              <p className="mt-6 text-lg text-text-secondary max-w-lg mx-auto lg:mx-0 leading-relaxed animate-fade-in-up delay-200">
                Memorize the shapes, spot the odd one out before time runs out, and build 
                your streak. One mistake resets everything — stay sharp.
              </p>

              <div className="mt-10 animate-fade-in-up delay-300">
                <DownloadButtons />
              </div>
            </div>

            {/* Phone */}
            <div className="flex justify-center animate-fade-in-up delay-400">
              <PhoneCarousel />
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-primary to-transparent" />
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-3 block">Gameplay</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              Simple rules. Addictive challenge.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Steps */}
            <div className="space-y-8">
              <Step
                number="1"
                title="Memorize the shapes"
                description="Watch closely as a set of colorful shapes appear on screen. You have a few seconds to commit them to memory."
                color="#7c5cfc"
              />
              <Step
                number="2"
                title="Find the odd one out"
                description="A new set appears — but one shape wasn't there before. Spot it and tap it before time runs out."
                color="#22d3ee"
              />
              <Step
                number="3"
                title="Build your streak"
                description="Every correct answer grows your streak. One wrong tap and it resets to zero. How far can you go?"
                color="#34d399"
              />
            </div>

            {/* Interactive mini-game demo */}
            <div className="flex justify-center">
              <MiniGame />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-24 px-6 bg-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-3 block">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              More than a memory game
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              delay="delay-100"
              icon={
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              title="Beat the Clock"
              description="Every round is a race against time. The pressure builds as your streak grows, testing your speed and precision."
            />
            <FeatureCard
              delay="delay-200"
              icon={
                <svg className="w-6 h-6 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              title="Real-time Multiplayer"
              description="Create a room, share the code, and compete head-to-head with friends. See who holds their streak the longest."
            />
            <FeatureCard
              delay="delay-300"
              icon={
                <svg className="w-6 h-6 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              title="Track Your Progress"
              description="Watch your stats climb — streaks, solve counts, and accuracy. Every session makes you sharper."
            />
            <FeatureCard
              delay="delay-400"
              icon={
                <svg className="w-6 h-6 text-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              title="Learn in Seconds"
              description="An interactive tutorial walks you through the rules step by step. Jump in with confidence from round one."
            />
            <FeatureCard
              delay="delay-500"
              icon={
                <svg className="w-6 h-6 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              title="Custom Game Settings"
              description="Adjust target streaks and time limits to match your skill level. Play your way."
            />
            <FeatureCard
              delay="delay-600"
              icon={
                <svg className="w-6 h-6 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              }
              title="Play Anywhere"
              description="Available on iOS and Android. Pick up your phone and start training your brain in seconds."
            />
          </div>
        </div>
      </section>

      {/* ─── Open Source ─── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-3 block">Open Source</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              Built in the open
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              Lusus is fully open source. Explore the code, report issues, suggest features, or contribute directly.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {[
              {
                branch: 'main',
                title: 'App',
                tech: 'React Native · Expo',
                desc: 'The core mobile application — gameplay, UI, and multiplayer client.',
              },
              {
                branch: 'server',
                title: 'Server',
                tech: 'Node.js · Express · Socket.io',
                desc: 'The WebSocket server powering real-time multiplayer matchmaking.',
              },
              {
                branch: 'website',
                title: 'Website',
                tech: 'React · Vite · Tailwind',
                desc: 'This landing page you\'re looking at right now.',
              },
            ].map((item) => (
              <a
                key={item.branch}
                href={`https://github.com/collinsadi/lusus/tree/${item.branch}`}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-6 group transition-all duration-300 hover:border-accent/30 block"
              >
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M11.03.47a.75.75 0 010 1.06L4.56 8l6.47 6.47a.75.75 0 11-1.06 1.06L2.44 8l7.53-7.53a.75.75 0 011.06 0z" />
                  </svg>
                  <code className="text-xs font-mono text-text-muted group-hover:text-accent transition-colors">{item.branch}</code>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">{item.title}</h3>
                <p className="text-xs text-accent/70 font-medium mb-2">{item.tech}</p>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </a>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://github.com/collinsadi/lusus"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2.5 px-5 py-2.5 sm:px-7 sm:py-3.5 bg-accent hover:bg-accent-light text-white text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent/25"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              View on GitHub
              <svg className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </a>
            <a
              href="https://github.com/collinsadi/lusus"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2.5 px-5 py-2.5 sm:px-7 sm:py-3.5 bg-bg-card hover:bg-bg-card-hover border border-border hover:border-border-light text-text-primary text-sm sm:text-base font-semibold rounded-xl transition-all duration-200"
            >
              <svg className="w-5 h-5 text-yellow" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              Star on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-accent/10 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Ready to test your memory?
          </h2>
          <p className="text-text-secondary mb-10 text-lg">
            Download Lusus and start building your streak today.
          </p>
          <div className="flex justify-center">
            <DownloadButtons />
          </div>
        </div>
      </section>
    </div>
  );
}
