import { Routes, Route, NavLink } from 'react-router-dom';
import { Calculator as CalculatorIcon, BarChart3, BookOpen } from 'lucide-react';
import Home from './components/Home';
import Calculator from './components/Calculator';
import Dashboard from './components/Dashboard';
import './App.css';

export default function App() {
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-badge">📋 Policy Estimator Tool</div>
        <h1>UPEMP 2020</h1>
        <p>Capital Subsidy Calculator — UP Electronics Manufacturing Policy</p>
      </header>

      {/* Navigation Bar */}
      <nav className="app-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          id="nav-home"
        >
          <BookOpen size={16} />
          Rules & Guide
        </NavLink>
        <NavLink
          to="/calculator"
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          id="nav-calculator"
        >
          <CalculatorIcon size={16} />
          Calculator
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          id="nav-dashboard"
        >
          <BarChart3 size={16} />
          Dashboard
        </NavLink>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}
