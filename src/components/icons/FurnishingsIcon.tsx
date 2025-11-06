import React from 'react';

const FurnishingsIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Cushion */}
    <rect x="3" y="7" width="18" height="10" rx="2" ry="2" />
    <path d="M7 7v10M17 7v10" />
    {/* Fabric folds */}
    <path d="M9 9c1 .8 1 .8 2 0M13 9c1 .8 1 .8 2 0" />
  </svg>
);

export default FurnishingsIcon;
