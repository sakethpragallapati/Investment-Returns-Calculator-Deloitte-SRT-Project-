import { useState } from 'react';
import Stepper from './components/Stepper';
import StepInvestment from './components/StepInvestment';
import StepWorkforce from './components/StepWorkforce';
import StepIncentives from './components/StepIncentives';
import Results from './components/Results';
import { performCalculation } from './utils/calculator';
import './App.css';

const INITIAL_DATA = {
  landCost: 0,
  buildingCost: 0,
  newMachinery: 0,
  refurbMachinery: 0,
  isGoiEval: false,
  isRented: false,
  employmentCount: 0,
  incentiveType: 'none',
  focusSector: '',
  anchorCount: '',
};

export default function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [result, setResult] = useState(null);

  const goTo = (s) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCalculate = () => {
    // Client-side calculation (mirrors backend for instant preview)
    const calc = performCalculation(formData);
    setResult(calc);
    goTo(4);
  };

  const handleRecalculate = () => {
    setResult(null);
    goTo(1);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-badge">📋 Policy Estimator Tool</div>
        <h1>UPEMP 2020</h1>
        <p>Capital Subsidy Calculator — UP Electronics Manufacturing Policy</p>
      </header>

      {/* Stepper */}
      <Stepper currentStep={step} />

      {/* Step Panels */}
      <main>
        {step === 1 && (
          <StepInvestment
            data={formData}
            onChange={setFormData}
            onNext={() => goTo(2)}
          />
        )}

        {step === 2 && (
          <StepWorkforce
            data={formData}
            onChange={setFormData}
            onNext={() => goTo(3)}
            onBack={() => goTo(1)}
          />
        )}

        {step === 3 && (
          <StepIncentives
            data={formData}
            onChange={setFormData}
            onBack={() => goTo(2)}
            onCalculate={handleCalculate}
          />
        )}

        {step === 4 && result && (
          <Results result={result} onRecalculate={handleRecalculate} />
        )}
      </main>
    </div>
  );
}
