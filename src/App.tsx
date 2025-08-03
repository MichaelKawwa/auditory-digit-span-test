import React, { useState } from 'react';
import AgeInput from './components/AgeInput';
import Instructions from './components/Instructions';
import DigitSpanTest, { DigitSpanResults } from './components/DigitSpanTest';
import { ChakraProvider } from '@chakra-ui/react'
import Results from './components/Results';
import AdGate from './components/AdGate';

export type Step = 'age' | 'instructions' | 'test' | 'ad' | 'results';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('age');
  const [age, setAge] = useState<number | null>(null);
  const [results, setResults] = useState<DigitSpanResults | null>(null);

  return (
    <ChakraProvider>
    <div className="app-container">
      {step === 'age' && (
        <AgeInput
          onNext={(userAge) => {
            setAge(userAge);
            setStep('instructions');
          }}
        />
      )}
      {step === 'instructions' && (
        <Instructions onNext={() => setStep('test')} />
      )}
      {step === 'test' && age !== null && (
        <DigitSpanTest
          age={age}
          onComplete={(res) => {
            setResults(res);
            setStep('ad');
          }}
        />
      )}
      {step === 'ad' && results && (
        <AdGate
          onComplete={() => setStep('results')}
        />
      )}
      {step === 'results' && results && age !== null && (
        <Results results={results} age={age} onRestart={() => {
          setResults(null);
          setStep('age');
          }} />
        )}
      </div>
    </ChakraProvider>
  );
};

export default App;
