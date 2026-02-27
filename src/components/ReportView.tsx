import React from 'react';
import { motion } from 'motion/react';
import { BGAAnalysisResult, BasicInfoA, BasicInfoB, Scenario } from '../types';
import { CheckCircle2, AlertTriangle, Info, RefreshCw, FileText, Activity } from 'lucide-react';

interface Props {
  key?: React.Key;
  scenario: Scenario;
  infoA: BasicInfoA | null;
  infoB: BasicInfoB | null;
  result: BGAAnalysisResult;
  onReset: () => void;
}

export default function ReportView({ scenario, infoA, infoB, result, onReset }: Props) {
  const isA = scenario === 'A';
  const color = isA ? 'indigo' : 'emerald';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-200"
    >
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <FileText className={`w-8 h-8 mr-3 text-${color}-600`} />
            血气分析综合评估报告
          </h1>
          <p className="text-slate-500 mt-2">PediBGA 智能生成</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> 重新评估
        </button>
      </div>

      {/* Patient Info */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2 text-slate-400" /> 患者信息
        </h2>
        <div className="bg-slate-50 rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {isA && infoA ? (
            <>
              <div><span className="text-slate-500 block">场景</span><span className="font-medium">UABGA</span></div>
              <div><span className="text-slate-500 block">胎龄</span><span className="font-medium">{infoA.gestationalAgeWeeks}周{infoA.gestationalAgeDays}天</span></div>
              <div><span className="text-slate-500 block">出生体重</span><span className="font-medium">{infoA.birthWeight}g</span></div>
              <div><span className="text-slate-500 block">分娩方式</span><span className="font-medium">{infoA.deliveryMode}</span></div>
              <div className="col-span-2"><span className="text-slate-500 block">Apgar评分</span><span className="font-medium">1min: {infoA.apgar1} / 5min: {infoA.apgar5} / 10min: {infoA.apgar10}</span></div>
              <div className="col-span-2"><span className="text-slate-500 block">高危因素</span><span className="font-medium">{infoA.highRiskFactors || '无'}</span></div>
            </>
          ) : infoB ? (
            <>
              <div><span className="text-slate-500 block">场景</span><span className="font-medium">常规血气</span></div>
              <div><span className="text-slate-500 block">年龄</span><span className="font-medium">{infoB.ageValue} {infoB.ageUnit === 'days' ? '天' : infoB.ageUnit === 'months' ? '月' : '岁'}</span></div>
              <div><span className="text-slate-500 block">体重</span><span className="font-medium">{infoB.weight}kg</span></div>
              <div><span className="text-slate-500 block">标本类型</span><span className="font-medium">{infoB.sampleType}</span></div>
              <div className="col-span-2"><span className="text-slate-500 block">吸氧情况</span><span className="font-medium">{infoB.oxygenStatus || '未提供'}</span></div>
              <div className="col-span-2"><span className="text-slate-500 block">简要诊断</span><span className="font-medium">{infoB.clinicalDiagnosis || '未提供'}</span></div>
            </>
          ) : null}
        </div>
      </section>

      {/* Step 1 */}
      <section className="mb-8 border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">第一步：内在一致性验证</h3>
          {result.step1.isConsistent ? (
            <span className="flex items-center text-emerald-600 text-sm font-medium"><CheckCircle2 className="w-4 h-4 mr-1" /> 通过</span>
          ) : (
            <span className="flex items-center text-amber-600 text-sm font-medium"><AlertTriangle className="w-4 h-4 mr-1" /> 不一致</span>
          )}
        </div>
        <div className="p-5 text-sm text-slate-600">
          <p className="font-mono bg-slate-100 p-2 rounded mb-2">[H⁺] = 24 × PaCO₂ / [HCO₃⁻]</p>
          <p>计算值: {result.step1.calculatedH.toFixed(1)} nmol/L</p>
          <p>pH对应值: {result.step1.expectedH.toFixed(1)} nmol/L</p>
          {!result.step1.isConsistent && <p className="text-amber-600 mt-2 font-medium">⚠️ 血气数值内在一致性不佳，该结果可能存在误差，建议复查。</p>}
        </div>
      </section>

      {/* Step 2 */}
      <section className="mb-8 border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">第二步：酸碱状态判断</h3>
        </div>
        <div className="p-5">
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-2 rounded-tl-lg">参数</th>
                  <th className="px-4 py-2">正常范围</th>
                  <th className="px-4 py-2 rounded-tr-lg">判断</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2 font-medium">pH</td>
                  <td className="px-4 py-2 text-slate-500">{result.step2.pHRange}</td>
                  <td className={`px-4 py-2 font-medium ${result.step2.pHEval !== '正常' ? 'text-amber-600' : 'text-emerald-600'}`}>{result.step2.pHEval}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2 font-medium">PaCO₂</td>
                  <td className="px-4 py-2 text-slate-500">{result.step2.PaCO2Range || '-'}</td>
                  <td className={`px-4 py-2 font-medium ${result.step2.PaCO2Eval !== '正常' ? 'text-amber-600' : 'text-emerald-600'}`}>{result.step2.PaCO2Eval}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2 font-medium">HCO₃⁻</td>
                  <td className="px-4 py-2 text-slate-500">{result.step2.HCO3Range || '-'}</td>
                  <td className={`px-4 py-2 font-medium ${result.step2.HCO3Eval !== '正常' ? 'text-amber-600' : 'text-emerald-600'}`}>{result.step2.HCO3Eval}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2 font-medium">BE</td>
                  <td className="px-4 py-2 text-slate-500">{result.step2.BERange}</td>
                  <td className={`px-4 py-2 font-medium ${result.step2.BEEval !== '正常' ? 'text-amber-600' : 'text-emerald-600'}`}>{result.step2.BEEval}</td>
                </tr>
                {isA && (
                  <>
                    <tr className="border-b border-slate-100">
                      <td className="px-4 py-2 font-medium">乳酸</td>
                      <td className="px-4 py-2 text-slate-500">{result.step2.LactateRange}</td>
                      <td className={`px-4 py-2 font-medium ${result.step2.LactateEval !== '正常' ? 'text-amber-600' : 'text-emerald-600'}`}>{result.step2.LactateEval}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium">PaO₂</td>
                      <td className="px-4 py-2 text-slate-500">{result.step2.PaO2Range}</td>
                      <td className={`px-4 py-2 font-medium ${result.step2.PaO2Eval !== '正常' ? 'text-amber-600' : 'text-emerald-600'}`}>{result.step2.PaO2Eval}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg inline-block">
            <span className="text-slate-600 text-sm mr-2">酸碱状态:</span>
            <span className={`font-semibold ${result.step2.pHStatus.includes('酸血症') || result.step2.pHStatus.includes('碱血症') ? 'text-red-600' : 'text-slate-800'}`}>
              {result.step2.pHStatus}
            </span>
            {result.step2.isHighestRisk && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">最高危值</span>}
          </div>
        </div>
      </section>

      {/* Step 3 */}
      <section className="mb-8 border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">第三步：原发紊乱类型判断</h3>
        </div>
        <div className="p-5 text-sm text-slate-600">
          <div className="flex space-x-8 mb-4">
            <div><span className="text-slate-400">pH变化:</span> <span className="font-medium text-slate-800">{result.step3.pHDir}</span></div>
            <div><span className="text-slate-400">PaCO₂变化:</span> <span className="font-medium text-slate-800">{result.step3.PaCO2Dir}</span></div>
            <div><span className="text-slate-400">方向:</span> <span className="font-medium text-slate-800">{result.step3.direction}</span></div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg inline-block">
            <span className="text-slate-600 mr-2">原发紊乱:</span>
            <span className="font-semibold text-slate-800">{result.step3.primaryDisorder}</span>
          </div>
        </div>
      </section>

      {/* Step 4 */}
      {result.step4.compensationType !== '不适用' && (
        <section className="mb-8 border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">第四步：代偿反应评估</h3>
          </div>
          <div className="p-5 text-sm text-slate-600">
            <p className="font-mono bg-slate-100 p-2 rounded mb-3">{result.step4.formula}</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><span className="text-slate-400 block">预期范围</span><span className="font-medium text-slate-800">{result.step4.expectedRange}</span></div>
              <div><span className="text-slate-400 block">实际值</span><span className="font-medium text-slate-800">{result.step4.actualValue ?? '-'}</span></div>
            </div>
            <div className={`p-3 rounded-lg inline-block font-medium ${result.step4.isCompensated ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {result.step4.isCompensated ? <CheckCircle2 className="w-4 h-4 inline mr-1" /> : <AlertTriangle className="w-4 h-4 inline mr-1" />}
              {result.step4.conclusion}
            </div>
          </div>
        </section>
      )}

      {/* Step 5 */}
      <section className="mb-8 border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">第五步：阴离子间隙 (AG)</h3>
        </div>
        <div className="p-5 text-sm text-slate-600">
          {result.step5.AG !== null ? (
            <>
              <p className="font-mono bg-slate-100 p-2 rounded mb-3">AG = [Na⁺] - ([Cl⁻] + [HCO₃⁻]) = {result.step5.AG.toFixed(1)} mEq/L</p>
              {result.step5.correctedAG !== null && (
                <p className="font-mono bg-slate-100 p-2 rounded mb-3">校正AG = {result.step5.correctedAG.toFixed(1)} mEq/L</p>
              )}
              <div className="mb-3">
                <span className="text-slate-400 mr-2">AG分类:</span>
                <span className={`font-semibold ${result.step5.classification === '高AG' ? 'text-red-600' : 'text-slate-800'}`}>
                  {result.step5.classification}
                </span>
              </div>
              {result.step5.causes && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="font-medium text-slate-700 block mb-1">可能病因提示:</span>
                  <span className="text-slate-600">{result.step5.causes}</span>
                </div>
              )}
            </>
          ) : (
            <p className="text-amber-600 font-medium"><AlertTriangle className="w-4 h-4 inline mr-1" /> 缺少Na⁺和/或Cl⁻数值，无法计算阴离子间隙。如存在代谢性酸中毒，强烈建议补充电解质检查以计算AG，有助于明确病因。</p>
          )}
        </div>
      </section>

      {/* Step 6 */}
      {result.step6.deltaAG !== null && (
        <section className="mb-8 border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">第六步：ΔAG分析 (Delta-Delta)</h3>
          </div>
          <div className="p-5 text-sm text-slate-600">
            <p className="font-mono bg-slate-100 p-2 rounded mb-2">ΔAG = 实测AG - 12 = {result.step6.deltaAG.toFixed(1)}</p>
            <p className="font-mono bg-slate-100 p-2 rounded mb-4">预计[HCO₃⁻] = ΔAG + 实测[HCO₃⁻] = {result.step6.expectedHCO3?.toFixed(1)}</p>
            <div className={`p-3 rounded-lg inline-block font-medium ${result.step6.conclusion.includes('单纯') ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {result.step6.conclusion.includes('单纯') ? <CheckCircle2 className="w-4 h-4 inline mr-1" /> : <AlertTriangle className="w-4 h-4 inline mr-1" />}
              {result.step6.conclusion}
            </div>
          </div>
        </section>
      )}

      {/* Quick Check */}
      <section className="mb-8 border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">快速法交叉验证</h3>
        </div>
        <div className="p-5 text-sm text-slate-600">
          <div className="flex space-x-8 mb-3">
            <div><span className="text-slate-400">pH:</span> <span className="font-medium text-slate-800">{result.quickCheck.pHDir}</span></div>
            <div><span className="text-slate-400">PaCO₂:</span> <span className="font-medium text-slate-800">{result.quickCheck.PaCO2Dir}</span></div>
            <div><span className="text-slate-400">方向:</span> <span className="font-medium text-slate-800">{result.quickCheck.direction}</span></div>
            <div><span className="text-slate-400">提示:</span> <span className="font-medium text-slate-800">{result.quickCheck.primaryDisorder}</span></div>
          </div>
          <div className="flex items-center">
            <span className="text-slate-400 mr-2">与六步法结论对照:</span>
            {result.quickCheck.isConsistent ? (
              <span className="font-medium text-emerald-600 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1" /> 一致</span>
            ) : (
              <span className="font-medium text-amber-600 flex items-center"><AlertTriangle className="w-4 h-4 mr-1" /> 存在差异</span>
            )}
          </div>
        </div>
      </section>

      {/* UABGA Specific */}
      {isA && result.uabga && (
        <section className="mb-10 border-2 border-indigo-100 rounded-xl overflow-hidden">
          <div className="bg-indigo-50 px-5 py-4 border-b border-indigo-100">
            <h3 className="font-bold text-indigo-900 flex items-center">
              <Activity className="w-5 h-5 mr-2" /> UABGA专项评估 (依据2021专家共识)
            </h3>
          </div>
          <div className="p-5 bg-white">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">窒息诊断评估</h4>
                <p className="text-lg font-bold text-slate-800">{result.uabga.asphyxia}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">预后不良风险分层</h4>
                <p className={`text-lg font-bold ${result.uabga.riskLevel.includes('高风险') ? 'text-red-600' : result.uabga.riskLevel.includes('中风险') ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {result.uabga.riskLevel}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Final Conclusion */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b-2 border-slate-800 pb-2 inline-block">最终诊断结论</h2>
        <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-md">
          <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2 font-semibold">酸碱紊乱诊断</h3>
          <p className="text-xl font-medium leading-relaxed mb-6">{result.finalDiagnosis}</p>
          
          <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2 font-semibold">临床处理建议</h3>
          <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-line">
            {result.clinicalSuggestions}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-500 leading-relaxed border border-slate-200">
        <strong className="text-slate-700">⚠️ 免责声明：</strong>
        本分析结果仅供临床参考，不能替代临床医生的综合判断。血气分析结果需结合患者临床表现、病史及其他辅助检查综合评估。所有临床决策应由负责的临床医生做出。
      </div>
    </motion.div>
  );
}
