import React from 'react';
import { motion } from 'motion/react';
import { Activity, Baby } from 'lucide-react';
import { Scenario } from '../types';

interface Props {
  key?: React.Key;
  onSelect: (scenario: Scenario) => void;
}

export default function ScenarioSelection({ onSelect }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">👋 您好！我是 PediBGA</h1>
        <p className="text-lg text-slate-600">儿童重症医学与围产医学血气分析智能评估助手</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <button
          onClick={() => onSelect('A')}
          className="group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all text-left"
        >
          <div className="bg-indigo-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors">
            <Baby className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">
            🅰 场景A：新生儿脐动脉血气 (UABGA)
          </h2>
          <p className="text-slate-600 leading-relaxed">
            适用于：新生儿出生时脐动脉/脐静脉血气评估。包含基于2021专家共识的窒息诊断与风险分层。
          </p>
        </button>

        <button
          onClick={() => onSelect('B')}
          className="group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all text-left"
        >
          <div className="bg-emerald-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
            <Activity className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">
            🅱 场景B：儿童/新生儿动脉血气
          </h2>
          <p className="text-slate-600 leading-relaxed">
            适用于：所有年龄段儿童（含新生儿生后动态监测）的常规动脉血气评估。采用六步法系统分析。
          </p>
        </button>
      </div>
    </motion.div>
  );
}
