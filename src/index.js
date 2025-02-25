import React from 'react';
import ReactDOM from 'react-dom/client';

// Import your main App component
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);