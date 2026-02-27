import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity } from 'lucide-react';
import { Scenario, BasicInfoA, BasicInfoB, BGAData, BGAAnalysisResult } from './types';
import ScenarioSelection from './components/ScenarioSelection';
import BasicInfoForm from './components/BasicInfoForm';
import DataInput from './components/DataInput';
import ReportView from './components/ReportView';
import { analyzeBGA } from './utils/bgaAnalysis';

export default function App() {
  const [step, setStep] = useState<'scenario' | 'info' | 'input' | 'report'>('scenario');
  const [scenario, setScenario] = useState<Scenario>(null);
  const [infoA, setInfoA] = useState<BasicInfoA | null>(null);
  const [infoB, setInfoB] = useState<BasicInfoB | null>(null);
  const [bgaData, setBgaData] = useState<BGAData | null>(null);
  const [result, setResult] = useState<BGAAnalysisResult | null>(null);

  const handleScenarioSelect = (selected: Scenario) => {
    setScenario(selected);
    setStep('info');
  };

  const handleInfoSubmit = (info: BasicInfoA | BasicInfoB) => {
    if (scenario === 'A') {
      setInfoA(info as BasicInfoA);
    } else {
      setInfoB(info as BasicInfoB);
    }
    setStep('input');
  };

  const handleDataSubmit = (data: BGAData) => {
    setBgaData(data);
    const analysisResult = analyzeBGA(scenario, infoA, infoB, data);
    setResult(analysisResult);
    setStep('report');
  };

  const handleReset = () => {
    setStep('scenario');
    setScenario(null);
    setInfoA(null);
    setInfoB(null);
    setBgaData(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleReset}>
            <div className="bg-slate-900 text-white p-2 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">PediBGA</span>
          </div>
          <div className="text-sm font-medium text-slate-500 hidden sm:block">
            儿童重症医学与围产医学血气分析智能评估助手
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 'scenario' && (
            <ScenarioSelection key="scenario" onSelect={handleScenarioSelect} />
          )}
          {step === 'info' && scenario && (
            <BasicInfoForm
              key="info"
              scenario={scenario}
              onSubmit={handleInfoSubmit}
              onBack={() => setStep('scenario')}
            />
          )}
          {step === 'input' && scenario && (
            <DataInput
              key="input"
              scenario={scenario}
              infoA={infoA}
              infoB={infoB}
              onSubmit={handleDataSubmit}
              onBack={() => setStep('info')}
            />
          )}
          {step === 'report' && scenario && result && (
            <ReportView
              key="report"
              scenario={scenario}
              infoA={infoA}
              infoB={infoB}
              result={result}
              onReset={handleReset}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
