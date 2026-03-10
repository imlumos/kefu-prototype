
import React, { useState, useEffect } from 'react';
import { QARecord, QAStatus } from '../types';
import { X, MessageSquare, ShieldAlert, Save, BrainCircuit, Terminal, Loader2, ClipboardList, Star } from 'lucide-react';
import { analyzeTranscript, AnalysisResult } from '../services/geminiService';

interface DetailModalProps {
  record: QARecord;
  onClose: () => void;
  onSave: (updated: QARecord) => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ record, onClose, onSave }) => {
  const [result, setResult] = useState<QAStatus>(record.final_result);
  const [reason, setReason] = useState(record.modification_log?.reason || '');
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const fetchAIAnalysis = async () => {
      setIsAnalyzing(true);
      try {
        const analysis = await analyzeTranscript(record.asr_content, record.keywords_detected);
        setAiAnalysis(analysis);
      } catch (error) {
        setAiAnalysis({
          conclusion_summary: "获取 AI 结论失败，请稍后重试。",
          summary: "获取内容总结失败，请稍后重试。",
          scores: []
        });
      } finally {
        setIsAnalyzing(false);
      }
    };
    fetchAIAnalysis();
  }, [record.asr_content, record.keywords_detected]);

  const handleSave = () => {
    if (!reason.trim()) return;
    onSave({
      ...record,
      final_result: result,
      is_modified: true,
      reinspector_name: "Admin",
      modification_log: {
        modified_by: "Admin",
        reason: reason,
        time: new Date().toLocaleString()
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-6xl rounded-[4px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-white border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#587CF6] p-1.5 rounded-[4px]"><MessageSquare className="w-5 h-5 text-white" /></div>
            <h3 className="font-bold text-[#303133]">质检数据详情</h3>
            <span className="text-[10px] text-[#909399] font-mono bg-[#f5f7fa] px-2 py-0.5 rounded border border-[#e6e6e6]">ID: {record.id}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#f5f7fa] rounded text-[#909399] transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#fafafa]">
          <div className="lg:col-span-8 space-y-4">
            {/* AI 智能质检结论 - 表格化展示 */}
            <div className="bg-[#f0f9eb] border border-[#e1f3d8] p-5 rounded-[4px] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[#67c23a] font-bold text-sm">
                  <BrainCircuit className="w-5 h-5" /> AI 智能质检结论
                </div>
                {isAnalyzing && (
                  <div className="flex items-center gap-1.5 text-xs text-[#67c23a]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> 智能评分中...
                  </div>
                )}
              </div>
              
              {isAnalyzing ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-[#909399]">
                   <Loader2 className="w-8 h-8 animate-spin text-[#67c23a]" />
                   <span className="text-sm">正在根据质检标准进行逐项打分...</span>
                </div>
              ) : (
                <div className="bg-white rounded border border-[#e1f3d8] overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#f9fdf8] text-[#909399] font-medium border-b border-[#e1f3d8]">
                      <tr>
                        <th className="px-4 py-3 w-12 text-center">序号</th>
                        <th className="px-4 py-3">评分项</th>
                        <th className="px-4 py-3 w-24 text-center">是否通过</th>
                        <th className="px-4 py-3">检查说明</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f9eb]">
                      {aiAnalysis?.scores.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#f9fdf8] transition-colors">
                          <td className="px-4 py-3 text-center text-[#C0C4CC] font-mono">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[#303133] font-medium">{item.name}</span>
                              {item.is_critical && (
                                <div className="w-[18px] h-[18px] bg-[#f87171] rounded-[3px] flex items-center justify-center shadow-sm shrink-0" title="关键考核项">
                                  <Star className="w-3 h-3 text-white fill-current" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-[4px] text-[11px] font-bold ${
                              item.is_passed ? 'bg-[#f0f9eb] text-[#67c23a] border border-[#e1f3d8]' : 'bg-[#fef0f0] text-[#f56c6c] border border-[#fde2e2]'
                            }`}>
                              {item.is_passed ? '通过' : '不通过'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#606266] leading-relaxed">{item.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!aiAnalysis?.scores.length && !isAnalyzing && (
                    <div className="py-8 text-center text-[#909399]">暂未识别到评分项，请检查转写内容</div>
                  )}
                </div>
              )}
              {aiAnalysis?.conclusion_summary && !isAnalyzing && (
                <div className="mt-4 pt-3 border-t border-[#e1f3d8]/50 text-xs text-[#67c23a] font-medium">
                  总体评价：{aiAnalysis.conclusion_summary}
                </div>
              )}
            </div>

            <div className="bg-white p-5 rounded-[4px] border border-[#ebeef5] shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-[#606266] flex items-center gap-2 uppercase tracking-tight">
                <ClipboardList className="w-4 h-4 text-[#587CF6]" /> ASR 内容总结
              </h4>
              <p className="text-[#606266] text-sm leading-relaxed">{isAnalyzing ? "正在生成摘要..." : (aiAnalysis?.summary || "暂无总结")}</p>
            </div>

            <div className="bg-white p-5 rounded-[4px] border border-[#ebeef5] shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-[#606266] flex items-center gap-2 uppercase tracking-tight">
                <Terminal className="w-4 h-4 text-[#587CF6]" /> ASR 识别文本
              </h4>
              <div className="bg-[#1e1e1e] text-[#d4d4d4] p-6 rounded-[4px] font-mono text-sm leading-relaxed min-h-[300px] border border-[#333] shadow-inner overflow-auto whitespace-pre-wrap">
                {record.asr_content}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-[#ebeef5] rounded-[4px] p-6 shadow-sm space-y-6">
              <h4 className="text-sm font-bold text-[#606266] flex items-center gap-2 uppercase tracking-tight">
                <ShieldAlert className="w-4 h-4 text-[#587CF6]" /> 审核控制面板
              </h4>
              <div className="space-y-4">
                <label className="text-xs font-bold text-[#909399] uppercase tracking-wider block">人工判定结果</label>
                <div className="flex border border-[#dcdfe6] rounded-[4px] overflow-hidden">
                  <button onClick={() => setResult('pass')} className={`flex-1 py-2 text-sm font-medium transition-all ${result === 'pass' ? 'bg-[#67c23a] text-white' : 'bg-white text-[#606266]'}`}>通过</button>
                  <button onClick={() => setResult('fail')} className={`flex-1 py-2 text-sm font-medium transition-all border-l border-[#dcdfe6] ${result === 'fail' ? 'bg-[#f56c6c] text-white' : 'bg-white text-[#606266]'}`}>不通过</button>
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-1.5"><label className="text-xs font-bold text-[#909399] uppercase tracking-wider">修正原因 (必填)</label></div>
                  <textarea 
                    className="w-full p-3 bg-[#fafafa] border border-[#dcdfe6] rounded-[4px] text-sm outline-none focus:border-[#587CF6] min-h-[120px]"
                    placeholder="请输入核查修改的具体理由..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </div>
              <button onClick={handleSave} disabled={!reason.trim()} className="w-full py-2.5 bg-[#587CF6] text-white font-bold rounded-[4px] hover:bg-[#6C8EF8] disabled:opacity-40 flex items-center justify-center gap-2 transition-all">
                <Save className="w-4 h-4" /> 确认提交审核
              </button>
            </div>
            
            <div className="bg-white border border-[#ebeef5] rounded-[4px] p-5 text-xs text-[#909399] space-y-3">
              <div className="flex justify-between items-center pb-2 border-b"><span>被质检人 / 组别</span><span className="font-bold text-[#303133]">{record.agent_name} / {record.group_name}</span></div>
              <div className="flex justify-between items-center pb-2 border-b"><span>复检人</span><span className="font-bold text-[#303133]">{record.reinspector_name || '-'}</span></div>
              <div className="flex justify-between items-center pb-2 border-b"><span>四级分类</span><span className="font-bold text-[#303133]">{record.category}</span></div>
              <div className="flex justify-between items-center pb-2 border-b"><span>通话类型</span><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${record.call_type === 'inbound' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>{record.call_type === 'inbound' ? '呼入' : '呼出'}</span></div>
              <div className="flex justify-between items-center pb-2 border-b"><span>时长 / 时间</span><span className="text-[#303133]">{record.duration}s / {record.upload_time}</span></div>
              <div className="flex justify-between items-center"><span>系统结果</span><span className={`px-2 py-0.5 rounded ${record.system_result === 'pass' ? 'bg-[#f0f9eb] text-[#67c23a]' : 'bg-[#fef0f0] text-[#f56c6c]'}`}>{record.system_result === 'pass' ? '合格' : '不合格'}</span></div>
            </div>

            {record.is_modified && (
              <div className="bg-[#F0F3FF] border border-[#DCE4FF] p-4 rounded-[4px] space-y-2 border-l-4 border-l-[#587CF6]">
                <p className="text-[11px] font-bold text-[#587CF6] uppercase tracking-wider">历史审核摘要</p>
                <div className="text-xs text-[#303133] italic leading-relaxed">"{record.modification_log?.reason}"</div>
                <div className="text-[10px] text-[#909399] text-right mt-1">{record.modification_log?.modified_by} 于 {record.modification_log?.time}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
