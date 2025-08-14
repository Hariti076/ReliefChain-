import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {AptosWalletAdapterProvider} from "@aptos-labs/wallet-adapter-react"


// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component
root.render(
  <React.StrictMode>
        <AptosWalletAdapterProvider autoConnect = {true}>

    <App />
        </AptosWalletAdapterProvider>

  </React.StrictMode>
);

// Optional: Add service worker for offline functionality (uncomment if needed)
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then((registration) => {
//         console.log('SW registered: ', registration);
//       })
//       .catch((registrationError) => {
//         console.log('SW registration failed: ', registrationError);
//       });
//   });
// }