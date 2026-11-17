import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './global.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { TokenProvider } from "./token/states/TokenState"; 
import { AuthProvider } from './auth/AuthProvider';
import { ConfigProvider } from 'antd';
import { ToastProvider } from './ui/Toast/ToastProvider';
import { NotificationsProvider } from './notifications/NotificationsProvider';
// Tokens do antd alinhados ao design do Figma (Noteasy) e com contraste AA
const antdTheme = {
  token: {
    colorPrimary: '#D12E25',       // Color/primary/primary
    colorPrimaryHover: '#A52520',  // primary-dark
    colorLink: '#1A3979',          // Color/secundary/secundary
    colorLinkHover: '#142B5C',
    colorSuccess: '#067003',
    colorWarning: '#B84F0C',
    colorError: '#D11800',
    colorInfo: '#1A3979',
    colorTextBase: '#000000',
    colorTextDescription: '#595959',
    colorTextSecondary: '#595959',
    colorTextPlaceholder: '#656565',
    colorBgLayout: '#F6F6F6',
    borderRadius: 8,
    fontFamily: "'Alexandria', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    controlHeightLG: 54,
  },
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
        <TokenProvider>
          <AuthProvider>
            <ConfigProvider theme={antdTheme}>
            <ToastProvider>
              <NotificationsProvider>
                <App />
              </NotificationsProvider>
            </ToastProvider>
            </ConfigProvider>
          </AuthProvider>
        </TokenProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
