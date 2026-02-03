
import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle, CheckCircle2, User, Info, Users } from 'lucide-react';
import { QARecord, UploadedFile } from '../types';

interface UploadSectionProps {
  onComplete: (records: QARecord[]) => void;
}

const MAX_FILES = 20;

const UploadSection: React.FC<UploadSectionProps> = ({ onComplete }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [batchName, setBatchName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const newFiles = Array.from(selectedFiles);
    
    if (files.length + newFiles.length > MAX_FILES) {
      alert(`单次最多可上传 ${MAX_FILES} 个文件`);
      return;
    }

    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const parts = file.name.split('_');
        setFiles(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          fileName: file.name,
          parsedName: parts.length > 1 ? parts[0] : '',
          isParsingFailed: parts.length <= 1,
          content: content.slice(0, 5000)
        }]);
      };
      reader.readAsText(file);
    });
  };

  const handleApplyBatchName = () => {
    if (!batchName.trim()) return;
    setFiles(prev => prev.map(f => ({ ...f, parsedName: batchName.trim() })));
  };

  const handleUploadSubmit = () => {
    const newRecords: QARecord[] = files.map(file => ({
      id: `uuid-${Math.random().toString(36).substr(2, 9)}`,
      agent_name: file.parsedName,
      upload_time: new Date().toISOString().replace('T', ' ').split('.')[0],
      asr_content: file.content,
      duration: Math.floor(Math.random() * 200) + 30,
      keywords_detected: [],
      system_result: Math.random() > 0.3 ? 'pass' : 'fail',
      final_result: 'pass',
      is_modified: false,
      modification_log: null
    }));
    onComplete(newRecords);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#fafafa] rounded-[4px] border border-[#ebeef5] p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-[#606266] flex items-center gap-1.5 font-medium">
            <Info className="w-4 h-4 text-[#587CF6]" />
            支持拖拽上传，单次上限 20 份
          </div>
          <span className="text-xs text-[#909399]">请确保文件名包含被质检人姓名（例：张三_001.txt）</span>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
          className={`border-2 border-dashed rounded-[4px] p-10 text-center transition-all cursor-pointer ${
            isDragging ? 'border-[#587CF6] bg-[#F0F3FF]' : 'border-[#dcdfe6] hover:border-[#587CF6] bg-white'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" multiple className="hidden" ref={fileInputRef} onChange={(e) => handleFiles(e.target.files)} />
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-[#f5f7fa] text-[#587CF6] rounded-full flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-[#606266] text-sm">将文件拖到此处，或<span className="text-[#587CF6] font-medium">点击上传</span></p>
            <p className="text-[#909399] text-xs mt-2 uppercase tracking-tight">Support Text / JSON formats</p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="border border-[#ebeef5] rounded-[4px] overflow-hidden bg-white">
          {/* 解析列表头部：包含批量设置功能 */}
          <div className="px-4 py-3 bg-[#f5f7fa] border-b border-[#ebeef5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#606266] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                解析列表 ({files.length})
              </span>
              {files.some(f => !f.parsedName) && (
                <div className="text-[11px] text-[#f56c6c] flex items-center gap-1 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  存在未命名文件
                </div>
              )}
            </div>
            
            {/* 统一设置姓名区域 */}
            <div className="flex items-center gap-2 p-2 bg-white rounded border border-[#dcdfe6] shadow-sm">
              <div className="text-[11px] font-bold text-[#909399] flex items-center gap-1 whitespace-nowrap">
                <Users className="w-3 h-3" />
                批量设置：
              </div>
              <input 
                type="text" 
                placeholder="输入统一姓名" 
                className="flex-1 px-3 py-1 text-xs border border-[#dcdfe6] rounded-[4px] outline-none focus:border-[#587CF6] transition-colors"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
              />
              <button 
                onClick={handleApplyBatchName}
                disabled={!batchName.trim()}
                className="px-3 py-1 bg-[#587CF6] text-white text-[11px] font-bold rounded-[4px] hover:bg-[#6C8EF8] disabled:opacity-50 transition-all"
              >
                应用到全部
              </button>
            </div>
          </div>

          <div className="divide-y divide-[#ebeef5] max-h-[300px] overflow-y-auto">
            {files.map((file) => (
              <div key={file.id} className="px-4 py-3 flex items-center gap-4 group hover:bg-[#fafafa]">
                <FileText className="w-4 h-4 text-[#909399] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#303133] truncate font-medium">{file.fileName}</p>
                </div>
                <div className="w-48 relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C0C4CC]" />
                  <input 
                    type="text" 
                    placeholder="客服姓名" 
                    className={`w-full pl-8 pr-3 py-1 text-xs border rounded-[4px] outline-none transition-all ${
                      !file.parsedName ? 'border-[#fde2e2] bg-[#fef0f0] focus:border-[#f56c6c]' : 'border-[#dcdfe6] focus:border-[#587CF6]'
                    }`}
                    value={file.parsedName}
                    onChange={(e) => setFiles(prev => prev.map(f => f.id === file.id ? { ...f, parsedName: e.target.value } : f))}
                  />
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFiles(prev => prev.filter(f => f.id !== file.id)); }}
                  className="p-1 text-[#C0C4CC] hover:text-[#f56c6c] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="px-4 py-4 bg-[#fcfcfc] flex justify-end gap-3 border-t border-[#f0f0f0]">
             <button 
              onClick={() => setFiles([])}
              className="px-4 py-1.5 text-[#909399] text-sm hover:text-[#606266] transition-colors"
            >
              重置
            </button>
            <button 
              onClick={handleUploadSubmit}
              disabled={files.length === 0 || files.some(f => !f.parsedName)}
              className="px-6 py-1.5 bg-[#587CF6] text-white text-sm font-bold rounded-[4px] hover:bg-[#6C8EF8] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#587CF6]/20 transition-all"
            >
              立即导入系统
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadSection;
