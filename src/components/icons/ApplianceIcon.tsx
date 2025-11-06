import React from 'react';

const ApplianceIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
        <path d="M12 11v4" />
        <path d="M16 11v4" />
        <path d="M8 11v4" />
        <path d="M2 7V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2" />
    </svg>
);

export default ApplianceIcon;
