import React, { useEffect, useRef } from 'react';

/**
 * Componente para ReCAPTCHA v3 (MOCK para testes)
 * Retorna um token fake para validação no backend
 * Use este arquivo para desenvolvimento/testes quando o reCAPTCHA real não funcionar
 * 
 * Para usar: substitua a importação em LoginComponent.js
 * import RecaptchaComponent from './RecaptchaComponentMock';
 */
export const RecaptchaComponent = React.forwardRef(({ onToken }, ref) => {
  const recaptchaRef = useRef(null);

  useEffect(() => {
    // Em modo teste, simula o carregamento do reCAPTCHA
    // eslint-disable-next-line no-console
    console.log('DEBUG: reCAPTCHA v3 MOCK mode - usando token fake para testes');
  }, []);

  React.useImperativeHandle(ref, () => ({
    executeRecaptcha: async (action = 'login') => {
      try {
        // Gera um token fake para testes
        const fakeToken = 'fake_recaptcha_token_' + Date.now() + '_' + Math.random().toString(36).substring(7);
        
        // eslint-disable-next-line no-console
        console.log('DEBUG: MOCK reCAPTCHA v3 token generated:', fakeToken);
        console.log('DEBUG: This is a TEST/MOCK token - use only for development');
        
        // Simula delay de processamento
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return fakeToken;
      } catch (error) {
        console.error('ReCAPTCHA MOCK error:', error?.message || error);
        return null;
      }
    },
  }));

  return (
    // ReCAPTCHA v3 é invisível, não precisa renderizar nada
    <div ref={recaptchaRef} style={{ display: 'none' }} />
  );
});

RecaptchaComponent.displayName = 'RecaptchaComponent';

export default RecaptchaComponent;
