import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Camera, FileText, Keyboard, Loader2, Upload } from 'lucide-react';
import { BGAData, Scenario, BasicInfoA, BasicInfoB } from '../types';
import { extractBGADataFromImage, extractBGADataFromText } from '../services/geminiService';

interface Props {
  key?: React.Key;
  scenario: Scenario;
  infoA: BasicInfoA | null;
  infoB: BasicInfoB | null;
  onSubmit: (data: BGAData) => void;
  onBack: () => void;
}

export default function DataInput({ scenario, infoA, infoB, onSubmit, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<'image' | 'text' | 'manual'>('manual');
  const [bgaData, setBgaData] = useState<BGAData>({
    pH: null, PaCO2: null, PaO2: null, HCO3: null, BE: null,
    Lactate: null, Na: null, K: null, Cl: null, Albumin: null, Glucose: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [rawText, setRawText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setIsLoading(true);
      try {
        const base64Data = base64String.split(',')[1];
        const extracted = await extractBGADataFromImage(base64Data, file.type);
        setBgaData(extracted);
        setIsConfirming(true);
      } catch (error) {
        console.error('Failed to extract data from image:', error);
        alert('识别失败，请重试或手动输入');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTextExtract = async () => {
    if (!rawText.trim()) return;
    setIsLoading(true);
    try {
      const extracted = await extractBGADataFromText(rawText);
      setBgaData(extracted);
      setIsConfirming(true);
    } catch (error) {
      console.error('Failed to extract data from text:', error);
      alert('识别失败，请重试或手动输入');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualChange = (field: keyof BGAData, value: string) => {
    setBgaData(prev => ({
      ...prev,
      [field]: value === '' ? null : Number(value)
    }));
  };

  const handleSubmit = () => {
    // Basic validation
    if (bgaData.pH === null || bgaData.PaCO2 === null || bgaData.HCO3 === null) {
      alert('请至少输入 pH, PaCO2 和 HCO3-');
      return;
    }
    onSubmit(bgaData);
  };

  const checkOutOfBounds = (key: keyof BGAData, value: number | null) => {
    if (value === null) return false;
    
    if (scenario === 'A') {
      switch (key) {
        case 'pH': return value < 7.24 || value > 7.27;
        case 'BE': return value < -5.60 || value > -2.70;
        case 'PaO2': return value >= 37.50;
        case 'Lactate': return value >= 6.00;
        default: return false;
      }
    } else if (scenario === 'B' && infoB) {
      const { ageValue, ageUnit } = infoB;
      const isNeonate = ageUnit === 'days' && ageValue <= 28;
      const isInfant = ageUnit === 'months' && ageValue <= 12;
      
      switch (key) {
        case 'pH':
          return value < 7.35 || value > 7.45;
        case 'PaCO2':
          if (isNeonate || isInfant) return value < 30 || value > 40;
          return value < 35 || value > 45;
        case 'HCO3':
          if (isNeonate) return value < 19 || value > 22;
          if (isInfant) return value < 20 || value > 24;
          return value < 22 || value > 26;
        case 'BE':
          if (isNeonate) return value < -4 || value > 2;
          return value < -2 || value > 2;
        default: return false;
      }
    }
    return false;
  };

  const renderManualForm = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
      {[
        { key: 'pH', label: 'pH', unit: '' },
        { key: 'PaCO2', label: 'PaCO₂', unit: 'mmHg' },
        { key: 'PaO2', label: 'PaO₂', unit: 'mmHg' },
        { key: 'HCO3', label: 'HCO₃⁻', unit: 'mmol/L' },
        { key: 'BE', label: 'BE', unit: 'mmol/L' },
        { key: 'Lactate', label: '乳酸 (Lac)', unit: 'mmol/L' },
        { key: 'Na', label: 'Na⁺', unit: 'mmol/L' },
        { key: 'K', label: 'K⁺', unit: 'mmol/L' },
        { key: 'Cl', label: 'Cl⁻', unit: 'mmol/L' },
        { key: 'Albumin', label: '白蛋白', unit: 'g/dL' },
        { key: 'Glucose', label: '血糖 (Glu)', unit: 'mmol/L' },
      ].map(({ key, label, unit }) => {
        const isOut = checkOutOfBounds(key as keyof BGAData, bgaData[key as keyof BGAData]);
        const isRequired = key === 'pH' || key === 'PaCO2' || key === 'HCO3';
        return (
          <div key={key}>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {label} {unit && <span className="text-slate-400 text-xs">({unit})</span>}
              {isRequired && (
                <sup className="text-red-500 ml-0.5 cursor-help" title="必填项目">*</sup>
              )}
            </label>
            <input
              type="number"
              step="any"
              value={bgaData[key as keyof BGAData] ?? ''}
              onChange={e => handleManualChange(key as keyof BGAData, e.target.value)}
              className={`w-full px-4 py-2 border rounded-xl focus:ring-2 outline-none transition-colors ${
                isOut
                  ? 'bg-yellow-50 border-yellow-400 focus:ring-yellow-500 focus:border-yellow-500 text-yellow-900'
                  : `border-slate-300 ${scenario === 'A' ? 'focus:ring-indigo-500 focus:border-indigo-500' : 'focus:ring-emerald-500 focus:border-emerald-500'}`
              }`}
            />
          </div>
        );
      })}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-200"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-800">输入血气数据</h2>
        <button onClick={onBack} className="text-slate-500 hover:text-slate-700 text-sm font-medium">
          返回上一步
        </button>
      </div>

      <div className="flex space-x-2 mb-6 p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => { setActiveTab('manual'); setIsConfirming(false); }}
          className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'manual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Keyboard className="w-4 h-4 mr-2" /> 逐项输入
        </button>
        <button
          onClick={() => { setActiveTab('image'); setIsConfirming(false); }}
          className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'image' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Camera className="w-4 h-4 mr-2" /> 拍照/上传
        </button>
        <button
          onClick={() => { setActiveTab('text'); setIsConfirming(false); }}
          className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'text' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4 mr-2" /> 粘贴文本
        </button>
      </div>

      {activeTab === 'manual' && renderManualForm()}

      {activeTab === 'image' && !isConfirming && (
        <div className="mt-6">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full h-48 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-400 transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-500" />
            ) : (
              <Upload className="w-8 h-8 mb-2" />
            )}
            <span>{isLoading ? '正在识别中...' : '点击上传血气报告图片'}</span>
          </button>
        </div>
      )}

      {activeTab === 'text' && !isConfirming && (
        <div className="mt-6">
          <textarea
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            placeholder="请在此粘贴血气报告的全部文本内容..."
            className="w-full h-48 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none mb-4"
          />
          <button
            onClick={handleTextExtract}
            disabled={isLoading || !rawText.trim()}
            className="w-full py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {isLoading ? '正在提取...' : '提取数据'}
          </button>
        </div>
      )}

      {isConfirming && (
        <div className="mt-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <h3 className="text-amber-800 font-medium mb-2">📋 识别结果如下，请您核对确认：</h3>
            <p className="text-amber-700 text-sm mb-4">⚠️ 请仔细核对以下数值，如有误差请直接在下方修改。</p>
            {renderManualForm()}
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-slate-200">
        <button
          onClick={handleSubmit}
          className={`w-full py-3 px-4 rounded-xl text-white font-medium transition-colors ${
            scenario === 'A' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {isConfirming ? '确认无误，开始分析' : '开始分析'}
        </button>
      </div>
    </motion.div>
  );
}
