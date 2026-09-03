import React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './home-animations.css';
import './dropdown-layer.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { StoreProvider } from './Store';

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <StoreProvider>
      <HelmetProvider>
        <PayPalScriptProvider deferLoading={true}>
          <App />
        </PayPalScriptProvider>
      </HelmetProvider>
    </StoreProvider>
  </React.StrictMode>
);

// Si quieres medir el rendimiento de la aplicación, puedes pasar una función
// a reportWebVitals, por ejemplo: reportWebVitals(console.log)
reportWebVitals();
