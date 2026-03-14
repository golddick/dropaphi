// Shared CSS string injected by every page via <style>{GLOBAL_CSS}</style>
export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@300;400;500;600&family=DM+Mono:wght@300;400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --red:      #DC143C;
    --red-dark: #c01236;
    --black:    #0A0A0A;
    --off:      #FAFAFA;
    --border:   #EBEBEB;
  }

  body { background: white; }

  .brand-font { font-family: 'Bricolage Grotesque', sans-serif; }
  .body-font  { font-family: 'Plus Jakarta Sans', sans-serif; }
  .mono-font  { font-family: 'DM Mono', monospace; }

  /* ── Layout ── */
  .page-wrap  { overflow-x: hidden; }
  .container  { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
  .section-white { background: white; }
  .section-off   { background: #FAFAFA; }
  .section-dark  { background: #0A0A0A; color: white; }

  /* ── Nav ── */
  .site-nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(255,255,255,0.92); backdrop-filter: blur(20px);
    border-bottom: 1px solid #F0F0F0;
  }
  .nav-inner {
    max-width: 1200px; margin: 0 auto; padding: 0 24px;
    height: 64px; display: flex; align-items: center; justify-content: space-between;
  }
  .nav-logo {
    display: flex; align-items: center; gap: 10px; text-decoration: none;
  }
  .nav-logo-icon {
    width: 32px; height: 32px; background: #DC143C; border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 1rem; color: white;
  }
  .nav-logo-text {
    font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 1.1rem; color: #0A0A0A;
  }
  .nav-links { display: flex; gap: 32px; }
  .nav-link {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.87rem; color: #555;
    text-decoration: none; transition: color 0.2s;
  }
  .nav-link:hover { color: #0A0A0A; }
  .nav-actions { display: flex; align-items: center; gap: 12px; }

  /* ── Buttons ── */
  .btn-red {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 22px; border-radius: 8px; border: none;
    background: #DC143C; color: white; cursor: pointer;
    font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 0.88rem;
    text-decoration: none; transition: all 0.22s;
    box-shadow: 0 4px 16px rgba(220,20,60,0.22);
  }
  .btn-red:hover { background: #c01236; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(220,20,60,0.32); }

  .btn-outline {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 20px; border-radius: 8px;
    background: transparent; border: 1.5px solid #E0E0E0; color: #333; cursor: pointer;
    font-family: 'Bricolage Grotesque', sans-serif; font-weight: 600; font-size: 0.88rem;
    text-decoration: none; transition: all 0.22s;
  }
  .btn-outline:hover { border-color: #DC143C; color: #DC143C; }

  .btn-white {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 28px; border-radius: 8px; border: none;
    background: white; color: #0A0A0A; cursor: pointer;
    font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 0.92rem;
    text-decoration: none; transition: all 0.22s;
  }
  .btn-white:hover { background: #F5F5F5; }

  /* ── Chips ── */
  .chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 14px; border-radius: 999px;
    font-family: 'DM Mono', monospace; font-size: 0.7rem;
    letter-spacing: 0.06em; text-transform: uppercase;
  }
  .chip-red  { background: rgba(220,20,60,0.08); border: 1px solid rgba(220,20,60,0.2); color: #DC143C; }
  .chip-dark { background: rgba(10,10,10,0.05);  border: 1px solid rgba(10,10,10,0.1);  color: #555; }
  .chip-dark-inv { background: rgba(220,20,60,0.12); border: 1px solid rgba(220,20,60,0.25); color: #ff6b6b; }

  /* ── Cards ── */
  .card {
    background: white; border: 1px solid #EBEBEB; border-radius: 14px; transition: all 0.26s;
  }
  .card:hover { border-color: rgba(220,20,60,0.3); box-shadow: 0 12px 40px rgba(0,0,0,0.07); transform: translateY(-4px); }

  .card-dark {
    background: #141414; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; transition: all 0.26s;
  }
  .card-dark:hover { border-color: rgba(220,20,60,0.4); box-shadow: 0 16px 48px rgba(0,0,0,0.4); transform: translateY(-4px); }

  /* ── Grid pattern ── */
  .grid-pattern {
    background-image:
      linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  /* ── Ticker ── */
  .ticker-wrap  { overflow: hidden; }
  .ticker-inner { display: flex; animation: tick 28s linear infinite; width: max-content; }
  @keyframes tick { to { transform: translateX(-50%); } }

  /* ── Footer ── */
  .site-footer { background: white; border-top: 1px solid #EBEBEB; padding: 64px 24px 40px; }
  .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); gap: 40px; margin-bottom: 48px; }
  .footer-bottom {
    border-top: 1px solid #F0F0F0; padding-top: 28px;
    display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
  }

  /* ── Prose (legal pages) ── */
  .prose h2 { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 1.4rem; color: #0A0A0A; margin-bottom: 16px; letter-spacing: -0.02em; }
  .prose p  { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.95rem; color: #555; line-height: 1.85; margin-bottom: 16px; }
  .prose ul { padding-left: 20px; margin-bottom: 16px; }
  .prose li { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.93rem; color: #555; line-height: 1.85; margin-bottom: 6px; }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .nav-links { display: none; }
    .two-col   { grid-template-columns: 1fr !important; }
    .hide-sm   { display: none !important; }
  }

  /* ── Pulse dot ── */
  @keyframes pulse-dot {
    0%,100% { transform: scale(1); opacity: 1; }
    50%      { transform: scale(1.5); opacity: 0.5; }
  }
  .pulse { animation: pulse-dot 2s ease-in-out infinite; }
`;
