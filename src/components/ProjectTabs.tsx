const PROJECT_TABS = [
  {
    key: 'readq',
    label: '독서토론',
    href: 'https://readq.netlify.app/',
    bg: '#E8A87C',
    fg: '#1b1b1b',
  },
  {
    key: 'world',
    label: '세계여행VR',
    href: 'https://worldtravelvr.netlify.app/',
    bg: '#A8C8E8',
    fg: '#0f1b2b',
  },
  {
    key: 'env',
    label: '환경과학VR',
    href: 'https://environmentalvr.netlify.app/',
    bg: '#90D4A0',
    fg: '#0f2616',
  },
  {
    key: 'learn',
    label: '학교적응',
    href: 'https://learningb.netlify.app/',
    bg: '#F2C35B',
    fg: '#2a1d00',
  },
] as const;

export default function ProjectTabs() {
  const current = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <nav
      style={{
        display: 'flex',
        width: '100%',
        gap: 0,
        flexWrap: 'nowrap',
        alignItems: 'stretch',
        borderRadius: 0,
        overflowX: 'auto',
        background: '#fff',
      }}
      aria-label="프로젝트 이동"
    >
      {PROJECT_TABS.map((t) => {
        const isActive = current.startsWith(t.href);
        return (
          <a
            key={t.key}
            href={t.href}
            target="_blank"
            rel="noreferrer"
            style={{
              flex: '1 0 auto',
              textAlign: 'center',
              padding: '14px 16px',
              borderRight: '1px solid rgba(0,0,0,0.08)',
              borderBottom: isActive ? '4px solid rgba(0,0,0,0.75)' : '4px solid transparent',
              background: t.bg,
              textDecoration: 'none',
              color: t.fg,
              fontSize: 15,
              lineHeight: 1,
              userSelect: 'none',
              fontWeight: isActive ? 800 : 700,
              letterSpacing: '-0.2px',
              opacity: isActive ? 1 : 0.92,
            }}
          >
            {t.label}
          </a>
        );
      })}
    </nav>
  );
}

