import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { verifyRecaptchaToken } from '../../../recaptcha/recaptchaAPI';

/**
 * Componente de reCAPTCHA v3 (invisível) usando Google oficial.
 *
 * - Usa a site key configurada em REACT_APP_RECAPTCHA_SITE_KEY
 * - Carrega o script do Google dinamicamente
 * - Exponde executeRecaptcha(action) via ref
 * - Ao executar:
 *    1) chama grecaptcha.execute(...) para obter o token
 *    2) envia o token para o backend Node (/verify-recaptcha)
 *    3) só retorna o token se a verificação no backend for bem-sucedida
 */

// Site key do reCAPTCHA v3 (pública). Usa a variável de ambiente se existir,
// e cai para a chave fornecida caso contrário.
const SITE_KEY =
  process.env.REACT_APP_RECAPTCHA_SITE_KEY ||
  '6Lc_wQssAAAAACIiUVn9frfejKD2e-yG6IuDU2By';

export const RecaptchaComponent = forwardRef(({ onToken }, ref) => {
  const scriptLoadedRef = useRef(false);
  const loadingPromiseRef = useRef(null);

  useEffect(() => {
    if (!SITE_KEY) {
      // eslint-disable-next-line no-console
      console.warn(
        'REACT_APP_RECAPTCHA_SITE_KEY não configurada. reCAPTCHA não será executado.'
      );
      return;
    }

    if (scriptLoadedRef.current) return;

    if (!loadingPromiseRef.current) {
      loadingPromiseRef.current = new Promise((resolve) => {
        const existingScript = document.querySelector(
          'script[src*="recaptcha/api.js"]'
        );
        if (existingScript) {
          if (existingScript.getAttribute('data-loaded')) {
            scriptLoadedRef.current = true;
            resolve();
          } else {
            existingScript.addEventListener('load', () => {
              existingScript.setAttribute('data-loaded', 'true');
              scriptLoadedRef.current = true;
              resolve();
            });
          }
          return;
        }

        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          script.setAttribute('data-loaded', 'true');
          scriptLoadedRef.current = true;
          resolve();
        };
        script.onerror = () => {
          // eslint-disable-next-line no-console
          console.error('Falha ao carregar script do reCAPTCHA.');
          resolve();
        };
        document.body.appendChild(script);
      });
    }
  }, []);

  const execute = async (action = 'login') => {
    if (!SITE_KEY) {
      // eslint-disable-next-line no-console
      console.error(
        'REACT_APP_RECAPTCHA_SITE_KEY ausente. Configure no arquivo .env.'
      );
      return null;
    }

    if (loadingPromiseRef.current) {
      await loadingPromiseRef.current;
    }

    if (!window.grecaptcha || !window.grecaptcha.execute) {
      // eslint-disable-next-line no-console
      console.error('grecaptcha não está disponível no window.');
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(SITE_KEY, { action });
      // eslint-disable-next-line no-console
      console.log('DEBUG: reCAPTCHA v3 token:', token);

      if (!token) return null;

      if (typeof onToken === 'function') {
        onToken(token);
      }

      // Verifica o token no backend Node (opcional).
      // Se o backend estiver offline, apenas registra o erro e segue
      // retornando o token para que o backend principal (Java, por exemplo)
      // possa fazer a verificação final.
      try {
        await verifyRecaptchaToken(token);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(
          'Falha na verificação do reCAPTCHA no backend (opcional):',
          err?.message || err
        );
      }

      return token;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erro ao executar reCAPTCHA v3:', error?.message || error);
      return null;
    }
  };

  useImperativeHandle(ref, () => ({
    executeRecaptcha: execute,
  }));

  // reCAPTCHA v3 é invisível, não renderiza nada visual
  return <div style={{ display: 'none' }} />;
});

RecaptchaComponent.displayName = 'RecaptchaComponent';

export default RecaptchaComponent;
