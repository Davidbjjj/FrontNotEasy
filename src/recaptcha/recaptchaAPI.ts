
declare const process: {
  env: {
    REACT_APP_RECAPTCHA_BACKEND_URL?: string;
  };
};

const BACKEND_URL =
  process.env.REACT_APP_RECAPTCHA_BACKEND_URL || 'http://localhost:4000';

export async function verifyRecaptchaToken(token: string) {
  let response: Response;

  try {
    response = await fetch(`${BACKEND_URL}/verify-recaptcha`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
  } catch (networkError: any) {
    throw new Error(
      `Não foi possível conectar ao backend de reCAPTCHA em ${BACKEND_URL}. ` +
        'Verifique se o servidor Node está rodando.'
    );
  }

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data?.error || 'Falha na verificação do reCAPTCHA no backend'
    );
  }

  return data;
}
