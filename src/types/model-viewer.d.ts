/* eslint-disable @typescript-eslint/no-namespace */
import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          poster?: string;
          alt?: string;
          'auto-rotate'?: boolean | string;
          'camera-controls'?: boolean | string;
          'touch-action'?: string;
          'interaction-prompt'?: string;
          'shadow-intensity'?: string;
          'shadow-softness'?: string;
          exposure?: string;
          'environment-image'?: string;
          ar?: boolean | string;
          'ar-modes'?: string;
          loading?: 'auto' | 'lazy' | 'eager';
          reveal?: 'auto' | 'interaction' | 'manual';
        },
        HTMLElement
      >;
    }
  }
}

export {};