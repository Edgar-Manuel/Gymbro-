import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { logger } from './services/logger'

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        logger.info('Service Worker registrado', 'SW', { scope: registration.scope });

        // Verificar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                logger.info('Nueva versión disponible', 'SW');
                // Aquí podrías mostrar un toast para recargar
              }
            });
          }
        });
      })
      .catch((error) => {
        logger.error('Error al registrar Service Worker', 'SW', error);
      });
  });
}

// Capturar errores globales no manejados
window.addEventListener('unhandledrejection', (event) => {
  logger.error(
    `Unhandled Promise Rejection: ${event.reason}`,
    'Global',
    event.reason instanceof Error ? event.reason : undefined
  );
});

window.addEventListener('error', (event) => {
  logger.error(
    `Global Error: ${event.message}`,
    'Global',
    event.error
  );
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
