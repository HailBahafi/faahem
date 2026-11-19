type P = { className?: string };
const base = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const Play = (p: P) => (<svg {...base} {...p}><path d="M7 4v16l13-8z" fill="currentColor" /></svg>);
export const Pause = (p: P) => (<svg {...base} {...p}><path d="M8 4v16M16 4v16" /></svg>);
// RTL: "next" points left, "back" points right.
export const Next = (p: P) => (<svg {...base} {...p}><path d="M15 6l-6 6 6 6" /></svg>);
export const Back = (p: P) => (<svg {...base} {...p}><path d="M9 6l6 6-6 6" /></svg>);
export const Reset = (p: P) => (<svg {...base} {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>);
export const Lock = (p: P) => (<svg {...base} width={13} height={13} {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>);
export const Check = (p: P) => (<svg {...base} {...p}><path d="M5 12l5 5 9-10" /></svg>);
export const Cross = (p: P) => (<svg {...base} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const Bolt = (p: P) => (<svg {...base} {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg>);
