export function CroatiaFlag({ className = '' }) {
  const squares = []
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const red = (row + col) % 2 === 0
      squares.push(
        <rect
          key={`${row}-${col}`}
          x={18 + col * 4.8}
          y={14 + row * 4.4}
          width="4.8"
          height="4.4"
          fill={red ? '#C8102E' : '#FFFFFF'}
        />,
      )
    }
  }

  return (
    <svg
      className={className}
      viewBox="0 0 60 40"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bandeira da Croácia"
    >
      <rect width="60" height="40" rx="3" fill="#FFFFFF" />
      <rect width="60" height="13.33" fill="#C8102E" />
      <rect y="26.67" width="60" height="13.33" fill="#0C1C8C" />
      <rect x="17" y="12.5" width="26" height="15" rx="1.5" fill="#FFFFFF" stroke="#C8102E" strokeWidth="0.6" />
      {squares}
    </svg>
  )
}

export function IconBrand({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 9h10l-.85 10.1A1.7 1.7 0 0 1 14.47 21H9.53a1.7 1.7 0 0 1-1.68-1.9L7 9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 9V7.25A2.5 2.5 0 0 1 12 4.75 2.5 2.5 0 0 1 14.5 7.25V9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconCart({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13l-1.6-8M7 13l-2.3 4.2A1 1 0 0 0 5.6 19H19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20.5" r="1.3" fill="currentColor" />
      <circle cx="17" cy="20.5" r="1.3" fill="currentColor" />
    </svg>
  )
}

export function IconBag({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 9h11l-.8 10.2a1.5 1.5 0 0 1-1.5 1.3H8.8a1.5 1.5 0 0 1-1.5-1.3L6.5 9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 9V7.2A3 3 0 0 1 12 4.2 3 3 0 0 1 15 7.2V9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconFood({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 10h16v2a8 8 0 0 1-16 0v-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M8 10V5M12 10V4M16 10V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 21h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconList({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6h12M9 12h12M9 18h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="4.5" cy="6" r="1.5" fill="currentColor" />
      <circle cx="4.5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="4.5" cy="18" r="1.5" fill="currentColor" />
    </svg>
  )
}

export function IconUser({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 19.5c1.8-3.2 4.1-4.5 7-4.5s5.2 1.3 7 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconSpark({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}
