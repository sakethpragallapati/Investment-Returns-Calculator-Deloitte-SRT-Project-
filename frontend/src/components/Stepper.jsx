import './Stepper.css';

const STEPS = [
  { num: 1, label: 'Investment' },
  { num: 2, label: 'Workforce' },
  { num: 3, label: 'Incentives' },
  { num: 4, label: 'Results' },
];

export default function Stepper({ currentStep }) {
  return (
    <div className="stepper">
      {STEPS.map((step, i) => (
        <div key={step.num} className="stepper-segment">
          {/* Step circle + label */}
          <div
            className={`step ${
              step.num === currentStep ? 'active' : ''
            } ${step.num < currentStep ? 'completed' : ''}`}
          >
            <div className="step-number">
              {step.num < currentStep ? '✓' : step.num}
            </div>
            <span className="step-label">{step.label}</span>
          </div>

          {/* Connector line */}
          {i < STEPS.length - 1 && (
            <div
              className={`step-line ${
                step.num < currentStep ? 'completed' : ''
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
