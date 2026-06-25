import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <a className="brand" href="/" aria-label="Giffy home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path
                d="M4 7a3 3 0 0 1 3-3h8l5 5v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7Z"
                stroke="url(#g)"
                strokeWidth="1.6"
              />
              <path
                d="M9 13.5h2v.7c0 .8-.5 1.3-1.4 1.3-1.1 0-1.8-.8-1.8-2.1 0-1.4.7-2.2 1.8-2.2.7 0 1.2.3 1.4.9M13 11.3v4.1M15.5 11.3v4.1m0-2.1H17"
                stroke="url(#g)"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="24" y2="24">
                  <stop offset="0" stopColor="#a78bfa" />
                  <stop offset="0.5" stopColor="#f472b6" />
                  <stop offset="1" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span className="brand-text">
            Giffy
            <span className="brand-sub">video → gif</span>
          </span>
        </a>

        <div className="header-actions">
          <span className="badge">
            <span className="badge-dot" />
            client-side
          </span>
        </div>
      </div>
    </header>
  )
}

export default Header
