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
// Tokens do antd ajustados para contraste AA (texto >= 4.5:1)
const antdTheme = {
  token: {
    colorPrimary: '#0958d9',
    colorLink: '#0958d9',
    colorError: '#cf1322',
    colorTextDescription: '#595959',
    colorTextSecondary: '#595959',
    colorTextPlaceholder: '#6b7280',
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
