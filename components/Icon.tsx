import type { SVGProps } from 'react';

/**
 * Icon registry. Section content stores an icon *key* (e.g. "shield"), so the
 * admin panel can offer a picker without ever handling raw SVG markup.
 */

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const PATHS: Record<string, React.ReactNode> = {
  molecule: (
    <g {...stroke}>
      <circle cx="12" cy="5" r="2" />
      <circle cx="5" cy="16" r="2" />
      <circle cx="19" cy="16" r="2" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <line x1="12" y1="7" x2="12" y2="10.6" />
      <line x1="10.8" y1="13" x2="6.6" y2="15" />
      <line x1="13.2" y1="13" x2="17.4" y2="15" />
    </g>
  ),
  capsule: (
    <g transform="rotate(45 12 12)">
      <rect x="4" y="9" width="16" height="6" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <line x1="12" y1="9" x2="12" y2="15" stroke="currentColor" strokeWidth="1.8" />
    </g>
  ),
  shield: (
    <g {...stroke}>
      <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z" />
      <polyline points="8.5 12 11 14.5 15.5 9.5" />
    </g>
  ),
  flask: (
    <g {...stroke}>
      <path d="M9 2h6" />
      <path d="M10 2v6.2L4.5 17a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 8.2V2" />
      <path d="M7.5 14h9" />
    </g>
  ),
  people: (
    <g {...stroke}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <circle cx="17.5" cy="8.5" r="2.6" />
      <path d="M15.8 14.2c2.6.5 4.7 2.5 4.7 5.8" />
    </g>
  ),
  pin: (
    <g {...stroke}>
      <path d="M12 21s7-6.6 7-11.5A7 7 0 0 0 5 9.5C5 14.4 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </g>
  ),
  mail: (
    <g {...stroke}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="M3 6l9 7 9-7" />
    </g>
  ),
  phone: (
    <g {...stroke}>
      <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L17 13l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4 7.2 2 2 0 0 1 6 5V3z" />
    </g>
  ),
  bulb: (
    <g {...stroke}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2.3h6c0-1.1.4-1.8 1-2.3A7 7 0 0 0 12 2z" />
    </g>
  ),
  scales: (
    <g {...stroke}>
      <path d="M12 3v18" />
      <path d="M5 7l-3 6a3.5 3.5 0 0 0 6 0l-3-6z" />
      <path d="M19 7l-3 6a3.5 3.5 0 0 0 6 0l-3-6z" />
      <path d="M5 7h14" />
      <path d="M8 21h8" />
    </g>
  ),
  heart: (
    <g {...stroke}>
      <path d="M12 20s-7-4.4-9.5-9C.8 7.2 3 3.5 6.8 3.5c2 0 3.5 1 5.2 3 1.7-2 3.2-3 5.2-3 3.8 0 6 3.7 4.3 7.5C19 15.6 12 20 12 20z" />
    </g>
  ),
  medal: (
    <g {...stroke}>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M8.5 13.5 7 21l5-2.7 5 2.7-1.5-7.5" />
    </g>
  ),
  eye: (
    <g {...stroke}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </g>
  ),
  truck: (
    <g {...stroke}>
      <rect x="2.5" y="7" width="14" height="10" rx="1.6" />
      <path d="M16.5 10.5H19l2.5 3V17h-5" />
      <circle cx="7" cy="18.5" r="1.6" />
      <circle cx="17.5" cy="18.5" r="1.6" />
    </g>
  ),
  leaf: (
    <g {...stroke}>
      <path d="M20 6c-4 0-7 1.5-8 5-1-3.5-4-5-8-5 0 8 4 13 8 16 4-3 8-8 8-16z" />
      <path d="M12 11v9" />
    </g>
  ),
  arrow: (
    <g {...stroke} strokeWidth={2}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </g>
  ),
  arrowUp: (
    <g {...stroke} strokeWidth={2}>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </g>
  ),
  check: (
    <g {...stroke} strokeWidth={2.4}>
      <polyline points="20 6 9 17 4 12" />
    </g>
  ),
  checkCircle: (
    <g {...stroke} strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="8 12.5 11 15.5 16 9" />
    </g>
  ),
  alert: (
    <g {...stroke} strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="13" />
      <line x1="12" y1="16.5" x2="12" y2="16.6" />
    </g>
  ),
  box: (
    <g {...stroke}>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8z" />
      <path d="m3 8 9 5 9-5" />
      <path d="M12 21V13" />
    </g>
  ),
  microscope: (
    <g {...stroke}>
      <path d="M6 18h12" />
      <path d="M8 18a6 6 0 0 0 10-4" />
      <path d="M11 4h3l2 6h-5z" />
      <path d="M12.5 10v4" />
    </g>
  ),
  globe: (
    <g {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z" />
    </g>
  ),
  clock: (
    <g {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </g>
  ),
  users: (
    <g {...stroke}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c0-3.9 3.1-6.6 7-6.6s7 2.7 7 6.6" />
    </g>
  ),
  star: (
    <g {...stroke}>
      <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />
    </g>
  ),
};

export const ICON_KEYS = Object.keys(PATHS).sort();

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name?: string | null;
}

export default function Icon({ name, ...props }: IconProps) {
  const node = (name && PATHS[name]) || PATHS.capsule;
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      {node}
    </svg>
  );
}
