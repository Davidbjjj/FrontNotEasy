import React, { useEffect, useRef } from 'react';

/**
 * Componente para ReCAPTCHA v3
 * Retorna token para validação no backend
 * ReCAPTCHA v3 é invisível e não mostra UI
 */
export const RecaptchaComponent = React.forwardRef(({ onToken }, ref) => {
  const recaptchaRef = useRef(null);

  useEffect(() => {
    // Carrega o script do reCAPTCHA v3 dinamicamente
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // eslint-disable-next-line no-console
      console.log('DEBUG: reCAPTCHA v3 script loaded successfully');
    };
    
    script.onerror = () => {
      console.error('DEBUG: Failed to load reCAPTCHA v3 script');
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  React.useImperativeHandle(ref, () => ({
    executeRecaptcha: async (action = 'login') => {
      try {
        // Aguarda um pouco para garantir que grecaptcha está carregado
        let attempts = 0;
        while (typeof window.grecaptcha === 'undefined' && attempts < 10) {
          // eslint-disable-next-line no-console
          console.log('DEBUG: Waiting for grecaptcha to load... (attempt', attempts + 1, ')');
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (typeof window.grecaptcha === 'undefined') {
          console.error('reCAPTCHA not loaded after timeout');
          return null;
        }

        const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY || '6LeNSQssAAAAAPHPJbhOhm8bswtd7nOr0FkADQaj';
        // eslint-disable-next-line no-console
        console.log('DEBUG: Executing reCAPTCHA v3 with site key:', siteKey.substring(0, 20) + '...');

        // eslint-disable-next-line no-undef
        const token = await grecaptcha.execute(siteKey, { action });
        
        // eslint-disable-next-line no-console
        console.log('DEBUG: reCAPTCHA token obtained:', token?.substring(0, 50) + '...');
        
        return token;
      } catch (error) {
        console.error('ReCAPTCHA v3 error:', error?.message || error);
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
