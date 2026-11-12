import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE } from '../services/apiClient';
import { sincronizarBranding, useBranding } from './brandingStore';

/** Mantém o tema da instituição em dia: roda ao abrir o app e a cada navegação (detecta login/logout). */
export const BrandingSync: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => { void sincronizarBranding(); }, [pathname]);
  return null;
};

/** Logo da instituição para o topo do app; não renderiza nada se não houver. */
export const BrandLogo: React.FC = () => {
  const { logoUrl } = useBranding();
  if (!logoUrl) return null;
  return <img src={`${API_BASE}${logoUrl}`} alt="Logo da instituição" style={{ maxHeight: 28, maxWidth: 120, objectFit: 'contain', marginRight: 12 }} />;
};
