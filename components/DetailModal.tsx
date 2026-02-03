
import React, { useState, useEffect } from 'react';
import { QARecord, QAStatus } from '../types';
import { X, MessageSquare, ShieldAlert, Save, Info, BrainCircuit, Terminal, Loader2, ClipboardList } from 'lucide-react';
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

  // 默认进入即触发 AI 智能解读
  useEffect(() => {
    const fetchAIAnalysis = async () => {
      setIsAnalyzing(true);
      try {
        const analysis = await analyzeTranscript(record.asr_content, record.keywords_detected);
        setAiAnalysis(analysis);
      } catch (error) {
        setAiAnalysis({
          conclusion: "获取 AI 结论失败，请稍后重试。",
          summary: "获取内容总结失败，请稍后重试。"
        });
      } finally {
        setIsAnalyzing(false);
      }
    };
    fetchAIAnalysis();
  }, [record.asr_content, record.keywords_detected]);

  const handleSave = () => {
    // 强制要求填写原因
    if (!reason.trim()) return;

    onSave({
      ...record,
      final_result: result,
      is_modified: true, // 只要经过人工保存，就标记为已修改
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
        <div className="px-6 py-4 bg-white border-b border-[#f0f0f0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#587CF6] p-1.5 rounded-[4px]">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-[#303133]">质检数据详情</h3>
            <span className="text-xs text-[#909399] font-mono bg-[#f5f7fa] px-2 py-0.5 rounded border border-[#e6e6e6]">ID: {record.id}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#f5f7fa] rounded text-[#909399] transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#fafafa]">
          {/* 左侧：内容分析区域 */}
          <div className="lg:col-span-8 space-y-4">
            {/* AI 智能质检结论 */}
            <div className="bg-[#f0f9eb] border border-[#e1f3d8] p-5 rounded-[4px] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-[#67c23a] font-bold text-sm">
                  <BrainCircuit className="w-5 h-5" /> AI 智能质检结论
                </div>
                {isAnalyzing && (
                  <div className="flex items-center gap-1.5 text-xs text-[#67c23a]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    AI 正在生成结论...
                  </div>
                )}
              </div>
              {isAnalyzing ? (
                <div className="h-16 flex items-center justify-center text-[#909399] text-sm italic">
                  正在调取 AI 接口，生成质检结论...
                </div>
              ) : (
                <p className="text-[#303133] text-sm leading-relaxed">
                  {aiAnalysis?.conclusion || "暂无质检结论"}
                </p>
              )}
            </div>

            {/* ASR 内容总结 */}
            <div className="bg-white p-5 rounded-[4px] border border-[#ebeef5] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#606266] flex items-center gap-2 uppercase tracking-tight">
                  <ClipboardList className="w-4 h-4 text-[#587CF6]" />
                  ASR 内容总结
                </h4>
                {isAnalyzing && (
                  <div className="flex items-center gap-1.5 text-xs text-[#909399]">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    正在总结内容...
                  </div>
                )}
              </div>
              {isAnalyzing ? (
                <div className="h-12 flex items-center justify-center text-[#909399] text-xs italic">
                  正在提取对话摘要...
                </div>
              ) : (
                <p className="text-[#606266] text-sm leading-relaxed">
                  {aiAnalysis?.summary || "暂无内容总结"}
                </p>
              )}
            </div>

            {/* ASR 识别文本 */}
            <div className="bg-white p-5 rounded-[4px] border border-[#ebeef5] shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-[#606266] flex items-center gap-2 uppercase tracking-tight">
                <Terminal className="w-4 h-4 text-[#587CF6]" />
                ASR 识别文本
              </h4>
              <div className="bg-[#1e1e1e] text-[#d4d4d4] p-6 rounded-[4px] font-mono text-sm leading-relaxed min-h-[300px] border border-[#333] shadow-inner overflow-auto whitespace-pre-wrap">
                {record.asr_content}
              </div>
            </div>
          </div>

          {/* 右侧：审核面板 */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-[#ebeef5] rounded-[4px] p-6 shadow-sm space-y-6">
              <h4 className="text-sm font-bold text-[#606266] flex items-center gap-2 uppercase tracking-tight">
                <ShieldAlert className="w-4 h-4 text-[#587CF6]" /> 审核控制面板
              </h4>

              <div className="space-y-4">
                <label className="text-xs font-bold text-[#909399] uppercase tracking-wider block">人工判定结果</label>
                <div className="flex border border-[#dcdfe6] rounded-[4px] overflow-hidden">
                  <button 
                    onClick={() => setResult('pass')} 
                    className={`flex-1 py-2 text-sm font-medium transition-all ${result === 'pass' ? 'bg-[#67c23a] text-white' : 'bg-white text-[#606266] hover:bg-[#fafafa]'}`}
                  >
                    通过
                  </button>
                  <button 
                    onClick={() => setResult('fail')} 
                    className={`flex-1 py-2 text-sm font-medium transition-all border-l border-[#dcdfe6] ${result === 'fail' ? 'bg-[#f56c6c] text-white' : 'bg-white text-[#606266] hover:bg-[#fafafa]'}`}
                  >
                    不通过
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-bold text-[#909399] uppercase tracking-wider">质检备注 / 修正原因</label>
                    <span className="text-[10px] text-[#f56c6c] font-bold">(必填)</span>
                  </div>
                  <div className="p-3 bg-[#fdf6ec] rounded-[4px] flex gap-2 border border-[#faecd8] mb-2">
                    <Info className="w-4 h-4 text-[#e6a23c] shrink-0" />
                    <p className="text-[10px] text-[#e6a23c] leading-normal font-medium">保存任何判定结果都必须填写审核意见，以备溯源。</p>
                  </div>
                  <textarea 
                    className={`w-full p-3 bg-[#fafafa] border rounded-[4px] text-sm outline-none focus:border-[#587CF6] min-h-[150px] transition-colors placeholder:text-[#C0C4CC] ${!reason.trim() ? 'border-[#faecd8]' : 'border-[#dcdfe6]'}`}
                    placeholder="请详细描述审核意见或修正理由..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleSave}
                  disabled={!reason.trim()}
                  className="w-full py-2.5 bg-[#587CF6] text-white font-bold rounded-[4px] hover:bg-[#6C8EF8] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#587CF6]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Save className="w-4 h-4" /> 确认提交审核意见
                </button>
              </div>
            </div>
            
            {/* 数据摘要卡片 */}
            <div className="bg-white border border-[#ebeef5] rounded-[4px] p-5 text-xs text-[#909399] space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f0]">
                <span>被质检人</span>
                <span className="font-bold text-[#303133]">{record.agent_name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f0]">
                <span>录音时长</span>
                <span className="font-bold text-[#303133]">{record.duration}s</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f0]">
                <span>系统初筛结果</span>
                <span className={`font-bold px-2 py-0.5 rounded ${record.system_result === 'pass' ? 'bg-[#f0f9eb] text-[#67c23a]' : 'bg-[#fef0f0] text-[#f56c6c]'}`}>
                  {record.system_result === 'pass' ? '合格' : '不合格'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>入库时间</span>
                <span className="text-[#606266]">{record.upload_time}</span>
              </div>
            </div>

            {record.is_modified && (
              <div className="bg-[#F0F3FF] border border-[#DCE4FF] p-4 rounded-[4px] space-y-2 border-l-4 border-l-[#587CF6]">
                <p className="text-[11px] font-bold text-[#587CF6] uppercase tracking-wider">历史审核摘要</p>
                <div className="text-xs text-[#303133] italic leading-relaxed">
                  "{record.modification_log?.reason}"
                </div>
                <div className="text-[10px] text-[#909399] text-right mt-1">
                   {record.modification_log?.modified_by} 于 {record.modification_log?.time}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
