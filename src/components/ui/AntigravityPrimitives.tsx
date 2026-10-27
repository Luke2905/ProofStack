'use client';

import React from 'react';

/**
 * Wrappers simples mantidos por compatibilidade.
 * Os efeitos 3D / animações de entrada foram removidos para um visual
 * mais direto, rápido e acessível.
 */

interface TiltSurfaceProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  // Props legadas, ignoradas:
  maxTilt?: number;
  scaleOnHover?: number;
  glareColor?: string;
  disabled?: boolean;
}

export function TiltSurface({ children, className = '', style }: TiltSurfaceProps) {
  return (
    <div style={style} className={`relative ${className}`}>
      {children}
    </div>
  );
}

interface StaggerRevealGridProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerRevealGrid({ children, className = '' }: StaggerRevealGridProps) {
  return <div className={className}>{children}</div>;
}
