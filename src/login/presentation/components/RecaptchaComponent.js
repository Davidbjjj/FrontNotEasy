import React, { useRef } from 'react';
import ReCAPTCHA from "react-google-recaptcha";

/**
 * Componente reutilizável para ReCAPTCHA v3
 * Retorna token para validação no backend
 */
export const RecaptchaComponent = React.forwardRef(({ onToken }, ref) => {
  const recaptchaRef = useRef(null);

  React.useImperativeHandle(ref, () => ({
    executeRecaptcha: async () => {
      if (recaptchaRef.current) {
        try {
          const token = await recaptchaRef.current.executeAsync();
          recaptchaRef.current.reset();
          return token;
        } catch (error) {
          console.error('ReCAPTCHA error:', error);
          return null;
        }
      }
    },
  }));

  return (
    <ReCAPTCHA
      ref={recaptchaRef}
      sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || "YOUR_SITE_KEY"}
      size="invisible"
    />
  );
});

RecaptchaComponent.displayName = 'RecaptchaComponent';

export default RecaptchaComponent;
