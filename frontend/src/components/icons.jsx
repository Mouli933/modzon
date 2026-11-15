const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
};

export const ArrowIcon = (props) => (
  <svg {...base} {...props}><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
);
export const ChevronIcon = (props) => (
  <svg {...base} {...props}><path d="m6 9 6 6 6-6" /></svg>
);
export const MenuIcon = (props) => (
  <svg {...base} {...props}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const CloseIcon = (props) => (
  <svg {...base} {...props}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const SearchIcon = (props) => (
  <svg {...base} {...props}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4-4" /></svg>
);
export const DownloadIcon = (props) => (
  <svg {...base} {...props}><path d="M12 3v12m0 0 5-5m-5 5-5-5M5 17v4h14v-4" /></svg>
);
export const LockIcon = (props) => (
  <svg {...base} {...props}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
);
export const UnlockIcon = (props) => (
  <svg {...base} {...props}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 7.5-2" /></svg>
);
export const TableFileIcon = (props) => (
  <svg {...base} {...props}><path d="M5 3h10l4 4v14H5V3Zm10 0v5h4M8 12h8M8 16h8" /></svg>
);
export const FolderIcon = (props) => (
  <svg {...base} {...props}><path d="M4 7h6l2 2h8v11H4V7Zm3-4h6l2 2h4" /></svg>
);
export const BookIcon = (props) => (
  <svg {...base} {...props}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Zm0 13A2.5 2.5 0 0 1 6.5 16H20M8 7h8M8 10h8" /></svg>
);
export const BoltIcon = (props) => (
  <svg {...base} {...props}><path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z" /></svg>
);
