// Example Node/Express server snippet that verifies reCAPTCHA v3 tokens securely
// Usage: put RECAPTCHA_SECRET_KEY in the server environment (not in frontend)

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

async function verifyRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) throw new Error('RECAPTCHA_SECRET_KEY not configured on server');

  const resp = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
    params: {
      secret,
      response: token,
    },
  });

  return resp.data; // contains success, score, action, hostname, etc.
}

app.post('/auth/login', async (req, res) => {
  try {
    const { email, senha, recaptchaToken } = req.body;

    if (!recaptchaToken) return res.status(400).json({ error: 'recaptchaToken ausente' });

    const verification = await verifyRecaptcha(recaptchaToken);

    // Log para debug (remova em produção)
    console.log('reCAPTCHA verification:', verification);

    if (!verification.success) {
      return res.status(400).json({ error: 'Falha na verificação reCAPTCHA' });
    }

    // Se estiver usando reCAPTCHA v3, você pode confiar no score
    if (verification.score !== undefined && verification.score < 0.5) {
      return res.status(400).json({ error: 'Suspeita de atividade automatizada (score baixo)' });
    }

    // Aqui: verifique email/senha no seu banco, gere token JWT, etc.
    // Exemplo mínimo de retorno:
    return res.json({ ok: true, message: 'Login aceito (exemplo)' });
  } catch (err) {
    console.error('Error in /auth/login:', err.message || err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Example server listening on ${port}`));
}

module.exports = app;
