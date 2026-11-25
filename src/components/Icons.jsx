const base = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, viewBox: '0 0 24 24' };

export const Back = ({ className }) => <svg className={className} width="22" height="22" strokeWidth="2.6" {...base}><path d="M15 18l-6-6 6-6" /></svg>;
export const Check = ({ className }) => <svg className={className} width="18" height="18" strokeWidth="3.2" {...base}><path d="M5 12l5 5 9-10" /></svg>;
export const Search = ({ className }) => <svg className={className} width="22" height="22" {...base} stroke="#4A6580" strokeWidth="2.5"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>;
export const Send = ({ className }) => <svg className={className} width="22" height="22" strokeWidth="2.4" {...base}><path d="M4 12l16-8-6 16-2-6z" /></svg>;
export const X = ({ className }) => <svg className={className} width="20" height="20" strokeWidth="2.6" {...base}><path d="M6 6l12 12M18 6L6 18" /></svg>;
export const Print = ({ className }) => <svg className={className} width="22" height="22" strokeWidth="2.2" {...base}><path d="M6 9V3h12v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M7 14h10v7H7z" /></svg>;
export const Pin = ({ className }) => <svg className={className} width="20" height="20" strokeWidth="2.3" {...base}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>;
export const Cam = ({ className }) => <svg className={className} width="30" height="30" strokeWidth="2" {...base}><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>;
export const Menu = ({ className }) => <svg className={className} width="24" height="24" strokeWidth="2.6" {...base}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
export const Warn = ({ className }) => <svg className={className} width="20" height="20" strokeWidth="2.5" {...base}><path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18h.01" /></svg>;

export const Waves = () => (
  <svg className="waves" aria-hidden="true" viewBox="0 0 1440 160" preserveAspectRatio="none">
    <path d="M0 70 C 240 20 420 120 720 70 C 1000 25 1200 110 1440 60 L1440 160 L0 160 Z" fill="#9FD4F1" />
    <path d="M0 105 C 260 70 480 150 760 105 C 1040 65 1220 140 1440 100 L1440 160 L0 160 Z" fill="#4AB0E4" />
    <path d="M0 135 C 300 110 520 165 820 135 C 1080 112 1260 160 1440 135 L1440 160 L0 160 Z" fill="#1769AA" />
  </svg>
);
