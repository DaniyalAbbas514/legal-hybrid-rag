import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminCasesPage from './pages/AdminCasesPage';
import AdminSupportPage from './pages/AdminSupportPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminManagementPage from './pages/AdminManagementPage';
import WelcomePage from './pages/WelcomePage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/cases" element={<AdminCasesPage />} />
          <Route path="/admin/support" element={<AdminSupportPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/management" element={<AdminManagementPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
