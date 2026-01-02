import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Enforce HTTPS in production
if (import.meta.env.PROD && window.location.protocol !== 'https:') {
  window.location.href = window.location.href.replace('http:', 'https:');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
