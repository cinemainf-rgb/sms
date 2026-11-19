import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { seedDatabase } from './db/database.js'; // استدعاء الدالة

// تشغيل قاعدة البيانات قبل ما البرنامج يفتح
seedDatabase().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
