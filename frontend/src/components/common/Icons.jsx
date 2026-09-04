import React from 'react';

export const Icon = ({ name, size = 20, color = 'currentColor', className = '', strokeWidth = 2, ...props }) => {
  const icons = {
    // Navigation & General
    house: (
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    ),
    search: (
      <g>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </g>
    ),
    'circle-user-round': (
      <g>
        <path d="M18 20a6 6 0 0 0-12 0" />
        <circle cx="12" cy="10" r="4" />
        <circle cx="12" cy="12" r="10" />
      </g>
    ),
    menu: (
      <g>
        <line x1="4" x2="20" y1="12" y2="12" />
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="4" x2="20" y1="18" y2="18" />
      </g>
    ),
    bell: (
      <g>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </g>
    ),
    'settings-2': (
      <g>
        <path d="M20 7h-9M14 17H5" />
        <circle cx="17" cy="17" r="3" />
        <circle cx="7" cy="7" r="3" />
      </g>
    ),
    plus: (
      <g>
        <path d="M5 12h14M12 5v14" />
      </g>
    ),
    ellipsis: (
      <g>
        <circle cx="12" cy="12" r="1" fill={color} />
        <circle cx="19" cy="12" r="1" fill={color} />
        <circle cx="5" cy="12" r="1" fill={color} />
      </g>
    ),
    'arrow-left': (
      <g>
        <path d="m12 19-7-7 7-7M19 12H5" />
      </g>
    ),
    'chevron-right': (
      <path d="m9 18 6-6-6-6" />
    ),
    'chevron-left': (
      <path d="m15 18-6-6 6-6" />
    ),
    'chevron-down': (
      <path d="m6 9 6 6 6-6" />
    ),
    check: (
      <path d="M20 6 9 17l-5-5" />
    ),
    eye: (
      <g>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </g>
    ),
    'eye-off': (
      <g>
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" x2="22" y1="2" y2="22" />
      </g>
    ),
    'sliders-horizontal': (
      <g>
        <line x1="21" x2="14" y1="4" y2="4" />
        <line x1="10" x2="3" y1="4" y2="4" />
        <line x1="21" x2="12" y1="12" y2="12" />
        <line x1="8" x2="3" y1="12" y2="12" />
        <line x1="21" x2="16" y1="20" y2="20" />
        <line x1="12" x2="3" y1="20" y2="20" />
        <line x1="14" x2="14" y1="2" y2="6" />
        <line x1="8" x2="8" y1="10" y2="14" />
        <line x1="16" x2="16" y1="18" y2="22" />
      </g>
    ),
    history: (
      <g>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
      </g>
    ),
    lightbulb: (
      <g>
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6M10 22h4" />
      </g>
    ),
    map: (
      <g>
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
        <line x1="9" x2="9" y1="3" y2="18" />
        <line x1="15" x2="15" y1="6" y2="21" />
      </g>
    ),
    'message-square-text': (
      <g>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="8" x2="16" y1="8" y2="8" />
        <line x1="8" x2="12" y1="12" y2="12" />
      </g>
    ),
    'message-circle-heart': (
      <g>
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        <path d="M15.8 9.2a2.5 2.5 0 0 0-3.5 0l-.3.4-.3-.4a2.5 2.5 0 0 0-3.5 3.5l3.8 3.8 3.8-3.8a2.5 2.5 0 0 0 0-3.5Z" />
      </g>
    ),
    headphones: (
      <g>
        <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
      </g>
    ),
    'notebook-tabs': (
      <g>
        <path d="M2 6h4M2 10h4M2 14h4M2 18h4" />
        <rect width="16" height="20" x="4" y="2" rx="2" />
        <path d="M15 2v20" />
      </g>
    ),
    sprout: (
      <g>
        <path d="M7 20h10" />
        <path d="M10 20c5.5-2.5.8-6.4 3-10" />
        <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8Z" />
        <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2Z" />
      </g>
    ),
    'briefcase-business': (
      <g>
        <path d="M12 12h.01" />
        <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <path d="M22 13a18.15 18.15 0 0 1-20 0" />
        <rect width="20" height="14" x="2" y="6" rx="2" />
      </g>
    ),
    'badge-check': (
      <g>
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
        <path d="m9 12 2 2 4-4" />
      </g>
    ),
    'circle-check-big': (
      <g>
        <path d="M21.801 10A10 10 0 1 1 17 3.335" />
        <path d="m9 11 3 3L22 4" />
      </g>
    ),
    'log-out': (
      <g>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
      </g>
    ),
    sun: (
      <g>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </g>
    ),
    moon: (
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    ),
    'image-up': (
      <g>
        <path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21" />
        <path d="m14 19 3-3 3 3" />
        <path d="M17 21v-5" />
        <circle cx="9" cy="9" r="2" />
      </g>
    ),
    'thumbs-up': (
      <path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
    ),
    'bookmark': (
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    ),
    'share-2': (
      <g>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
        <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
      </g>
    ),
    x: (
      <g>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </g>
    ),
    'shield-check': (
      <g>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </g>
    ),
    edit: (
      <g>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </g>
    ),
    'check-circle': (
      <g>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </g>
    )
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {icons[name] || icons.house}
    </svg>
  );
};
