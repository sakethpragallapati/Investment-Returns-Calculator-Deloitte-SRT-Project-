import { useState } from 'react';
import Stepper from './Stepper';
import StepInvestment from './StepInvestment';
import StepWorkforce from './StepWorkforce';
import StepIncentives from './StepIncentives';
import Results from './Results';
import { performCalculation } from '../utils/calculator';

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

export default function Calculator() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [result, setResult] = useState(null);

  const goTo = (s) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCalculate = () => {
    const calc = performCalculation(formData);
    setResult(calc);
    goTo(4);
  };

  const handleRecalculate = () => {
    setResult(null);
    goTo(1);
  };

  return (
    <>
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
          <Results result={result} formData={formData} onRecalculate={handleRecalculate} />
        )}
      </main>
    </>
  );
}
