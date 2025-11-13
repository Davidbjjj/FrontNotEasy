# Guia de Integração: ReCAPTCHA v3 e Login Social

Essa implementação adiciona suporte a **ReCAPTCHA v3** e **login social** (Google e GitHub) ao seu formulário de login.

## ✅ O que foi adicionado

### 1. **ReCAPTCHA v3**
- Proteção invisível contra bots
- Validação automática ao fazer login
- Token enviado ao backend para verificação adicional

### 2. **Login Social**
- **Google OAuth**: Login com conta Google
- **GitHub OAuth**: Login com conta GitHub
- Buttons integrados e fáceis de usar

### 3. **Componentes Criados**
- `RecaptchaComponent.js` - Gerencia validação ReCAPTCHA
- `SocialLoginButtons.js` - Botões de login social
- `GitHubCallbackPage.js` - Page de callback para GitHub OAuth

## 🔧 Setup Passo a Passo

### 1. Instalar Dependências
```powershell
npm install
```

As seguintes dependências foram adicionadas ao `package.json`:
- `react-google-recaptcha` - Para ReCAPTCHA v3
- `@react-oauth/google` - Para Google OAuth
- Será necessário implementar GitHub OAuth manualmente no backend

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (ou copie de `.env.example`):

```env
# ReCAPTCHA v3
REACT_APP_RECAPTCHA_SITE_KEY=YOUR_RECAPTCHA_V3_SITE_KEY

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

# GitHub OAuth
REACT_APP_GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID
REACT_APP_GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback
```

### 3. Obter Credenciais

#### **Google OAuth**
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Ative a API "Google+ API"
4. Crie credenciais OAuth 2.0 (tipo "Web application")
5. Adicione URIs autorizados:
   - `http://localhost:3000`
   - `http://localhost:3000/login`
   - Seu domínio de produção
6. Copie o **Client ID**

#### **ReCAPTCHA v3**
1. Acesse [Google reCAPTCHA Console](https://www.google.com/recaptcha/admin)
2. Crie um novo site
3. Selecione **reCAPTCHA v3**
4. Adicione domínios:
   - `localhost`
   - Seu domínio de produção
5. Copie a **Site Key** e a **Secret Key** (guardar a secret key de forma segura no backend)

#### **GitHub OAuth** (Opcional)
1. Acesse [GitHub Developer Settings](https://github.com/settings/developers)
2. Clique em "New OAuth App"
3. Preencha os dados:
   - **Application name**: Nome da sua app
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
4. Copie o **Client ID** (guarde o Secret key de forma segura no backend)

### 4. Adicionar Rota de Callback do GitHub

No seu `RouterConfig.js`, adicione a rota:

```jsx
import GitHubCallbackPage from './login/views/pages/GitHubCallbackPage';

// ... dentro das rotas
<Route path="/auth/github/callback" element={<GitHubCallbackPage />} />
```

### 5. Implementar no Backend

Seu backend precisa:

#### **ReCAPTCHA Validation**
```javascript
// Exemplo em Node.js/Express
const axios = require('axios');

async function verifyRecaptcha(token) {
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify`,
    null,
    {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token,
      },
    }
  );
  
  // response.data.score entre 0.0 e 1.0
  // > 0.5 é considerado legítimo
  return response.data.score > 0.5;
}

// No seu endpoint de login:
app.post('/auth/login', async (req, res) => {
  const { email, password, recaptchaToken } = req.body;
  
  const isBot = !(await verifyRecaptcha(recaptchaToken));
  if (isBot) {
    return res.status(400).json({ error: 'Falha na verificação ReCAPTCHA' });
  }
  
  // ... continuar com autenticação normal
});
```

#### **Google OAuth**
```javascript
// Verificar token do Google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

app.post('/auth/login/google', async (req, res) => {
  const { token } = req.body;
  const payload = await verifyGoogleToken(token);
  
  // Procurar/criar usuário com email do Google
  const user = await findOrCreateUser({
    email: payload.email,
    nome: payload.name,
    photo: payload.picture,
  });
  
  // Retornar token JWT
  const jwtToken = jwt.sign({ userId: user.id, role: user.role }, SECRET);
  res.json({ token: jwtToken });
});
```

#### **GitHub OAuth**
```javascript
// Trocar código por token
async function exchangeGithubCode(code) {
  const response = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    },
    { headers: { Accept: 'application/json' } }
  );
  
  return response.data.access_token;
}

// Obter dados do usuário
async function getGithubUser(accessToken) {
  const response = await axios.get('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
}

app.post('/auth/login/github', async (req, res) => {
  const { code } = req.body;
  const accessToken = await exchangeGithubCode(code);
  const githubUser = await getGithubUser(accessToken);
  
  // Procurar/criar usuário com dados do GitHub
  const user = await findOrCreateUser({
    email: githubUser.email,
    nome: githubUser.name,
    photo: githubUser.avatar_url,
  });
  
  // Retornar token JWT
  const jwtToken = jwt.sign({ userId: user.id, role: user.role }, SECRET);
  res.json({ token: jwtToken });
});
```

## 📱 Como Usar

1. **O usuário clica em um dos botões de login social**
2. **Se usar Google**: Uma janela pop-up de autenticação do Google aparece
3. **Se usar GitHub**: Redireciona para GitHub, valida, e volta via callback
4. **ReCAPTCHA v3**: Executado automaticamente e invisibilmente
5. **Após autenticação com sucesso**: Token é armazenado e usuário é redirecionado para `/listas`

## 🎨 Personalizações

### Mudar cores dos botões
Edite em `Login.module.css`:
```css
.primaryBtn {
  background: #sua-cor !important;
}

.githubBtn {
  background-color: #sua-cor !important;
}
```

### Desabilitar login social
Comente/remova o componente `<SocialLoginButtons />` em `LoginComponent.js`

### Desabilitar ReCAPTCHA
Comente/remova o componente `<RecaptchaComponent />` em `LoginComponent.js`

## 🔒 Segurança

- **ReCAPTCHA Secret Key**: Guarde segura no backend, NUNCA exponha no frontend
- **GitHub Secret**: Idem, sempre no backend
- **Google Client ID**: Seguro no frontend (é público por natureza)
- **Tokens JWT**: Armazenados em localStorage (considere usar HttpOnly cookies em produção)

## ✨ Próximos Passos

1. Obter e configurar as credenciais (Google, GitHub, ReCAPTCHA)
2. Criar arquivo `.env` local com as keys
3. Implementar endpoints no backend
4. Testar localmente
5. Fazer deploy com as credenciais de produção

## 📚 Referências

- [Google reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [react-google-recaptcha](https://www.npmjs.com/package/react-google-recaptcha)
- [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)

## ⚠️ Troubleshooting

### "ReCAPTCHA is not working"
- Verifique se `REACT_APP_RECAPTCHA_SITE_KEY` está correto
- Certifique-se de que `localhost` foi adicionado aos domínios no Google reCAPTCHA Console

### "Google login não funciona"
- Verifique `REACT_APP_GOOGLE_CLIENT_ID`
- Adicione `http://localhost:3000` aos "Authorized JavaScript origins"

### "GitHub login não funciona"
- Verifique `REACT_APP_GITHUB_CLIENT_ID` e `REACT_APP_GITHUB_REDIRECT_URI`
- Certifique-se de que a rota `/auth/github/callback` existe

---

**Dúvidas?** Revise os componentes em `src/login/presentation/components/` ou consulte a documentação oficial das APIs.
