
import React, { useState } from 'react';
import { QARecord, QAStatus } from '../types';
import { Search, Eye, UserCheck, CheckCircle2, XCircle, Plus, Download } from 'lucide-react';
import DetailModal from './DetailModal';
import UploadSection from './UploadSection';

interface DashboardProps {
  records: QARecord[];
  onUpdateRecord: (record: QARecord) => void;
  onAddRecords: (records: QARecord[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ records, onUpdateRecord, onAddRecords }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [systemFilter, setSystemFilter] = useState<QAStatus | 'all'>('all');
  const [finalFilter, setFinalFilter] = useState<QAStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedRecord, setSelectedRecord] = useState<QARecord | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.includes(searchTerm);
    const matchesSystem = systemFilter === 'all' || r.system_result === systemFilter;
    const matchesFinal = finalFilter === 'all' || r.final_result === finalFilter;
    const matchesDate = (!dateRange.start || r.upload_time >= dateRange.start) && (!dateRange.end || r.upload_time <= dateRange.end);
    return matchesSearch && matchesSystem && matchesFinal && matchesDate;
  });

  const handleExport = () => {
    alert("正在导出数据至 Excel...");
  };

  return (
    <div className="space-y-4">
      {/* 筛选区域 - 查询按钮紧贴筛选条件 */}
      <div className="bg-white p-5 rounded-sm border border-[#ebeef5] shadow-sm flex flex-wrap gap-x-6 gap-y-4 items-center">
        <div className="flex flex-wrap gap-x-6 gap-y-4 items-center flex-1">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[#606266] whitespace-nowrap">关键词</label>
            <div className="relative w-44">
              <input 
                type="text" 
                placeholder="被质检人 / ID" 
                className="w-full px-3 py-1.5 border border-[#dcdfe6] rounded-[4px] text-sm focus:border-[#587CF6] outline-none transition-colors placeholder:text-[#C0C4CC]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[#606266] whitespace-nowrap">系统结论</label>
            <select 
              className="w-28 px-2 py-1.5 border border-[#dcdfe6] rounded-[4px] text-sm focus:border-[#587CF6] outline-none text-[#606266]"
              value={systemFilter}
              onChange={(e) => setSystemFilter(e.target.value as any)}
            >
              <option value="all">全部</option>
              <option value="pass">通过</option>
              <option value="fail">不通过</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[#606266] whitespace-nowrap">最终结论</label>
            <select 
              className="w-28 px-2 py-1.5 border border-[#dcdfe6] rounded-[4px] text-sm focus:border-[#587CF6] outline-none text-[#606266]"
              value={finalFilter}
              onChange={(e) => setFinalFilter(e.target.value as any)}
            >
              <option value="all">全部</option>
              <option value="pass">通过</option>
              <option value="fail">不通过</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[#606266] whitespace-nowrap">创建日期</label>
            <div className="flex items-center gap-1">
              <input 
                type="date" 
                className="px-2 py-1.5 border border-[#dcdfe6] rounded-[4px] text-sm outline-none text-[#606266] focus:border-[#587CF6]"
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
              <span className="text-[#C0C4CC]">-</span>
              <input 
                type="date" 
                className="px-2 py-1.5 border border-[#dcdfe6] rounded-[4px] text-sm outline-none text-[#606266] focus:border-[#587CF6]"
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>

          <button className="px-5 py-1.5 bg-[#587CF6] text-white text-sm font-medium rounded-[4px] hover:bg-[#6C8EF8] active:bg-[#4A69D6] transition-colors flex items-center gap-1">
            <Search className="w-3.5 h-3.5" />
            查询
          </button>
        </div>
        
        <div className="flex items-center gap-3 ml-auto">
          <button 
            onClick={handleExport}
            className="px-5 py-1.5 bg-white text-[#606266] border border-[#dcdfe6] text-sm font-medium rounded-[4px] hover:bg-[#f5f7fa] active:bg-[#f0f0f0] transition-colors flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            导出
          </button>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-1.5 bg-white text-[#587CF6] border border-[#587CF6] text-sm font-medium rounded-[4px] hover:bg-[#F0F3FF] active:bg-[#d9ecff] transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            数据上传
          </button>
        </div>
      </div>

      {/* 列表区域 */}
      <div className="bg-white rounded-sm border border-[#ebeef5] shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-[#f5f7fa] text-[#909399] font-medium border-b border-[#ebeef5]">
            <tr>
              <th className="px-4 py-3 border-r border-[#ebeef5]">创建时间</th>
              <th className="px-4 py-3 border-r border-[#ebeef5]">被质检人</th>
              <th className="px-4 py-3 border-r border-[#ebeef5]">通话时长</th>
              <th className="px-4 py-3 border-r border-[#ebeef5]">系统结果</th>
              <th className="px-4 py-3 border-r border-[#ebeef5]">最终结果</th>
              <th className="px-4 py-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebeef5]">
            {filteredRecords.map((record) => (
              <tr key={record.id} className="hover:bg-[#f5f7fa] transition-colors">
                <td className="px-4 py-3 text-[#606266] whitespace-nowrap">{record.upload_time}</td>
                <td className="px-4 py-3 font-medium text-[#303133]">{record.agent_name}</td>
                <td className="px-4 py-3 text-[#606266]">{Math.floor(record.duration / 60)}分{record.duration % 60}秒</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                    record.system_result === 'pass' 
                    ? 'bg-[#f0f9eb] text-[#67c23a] border-[#e1f3d8]' 
                    : 'bg-[#fef0f0] text-[#f56c6c] border-[#fde2e2]'
                  }`}>
                    {record.system_result === 'pass' ? '通过' : '不通过'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                      record.final_result === 'pass' 
                      ? 'bg-[#67c23a] text-white border-[#67c23a]' 
                      : 'bg-[#f56c6c] text-white border-[#f56c6c]'
                    }`}>
                      {record.final_result === 'pass' ? '通过' : '不通过'}
                    </span>
                    {record.is_modified && <UserCheck className="w-4 h-4 text-[#587CF6]" title="已人工修改" />}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button 
                    onClick={() => setSelectedRecord(record)}
                    className="text-[#587CF6] hover:text-[#6C8EF8] text-sm font-medium"
                  >
                    查看详情
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRecords.length === 0 && (
          <div className="py-20 text-center text-[#909399] bg-[#fafafa]">暂无数据记录</div>
        )}
      </div>

      {selectedRecord && (
        <DetailModal 
          record={selectedRecord} 
          onClose={() => setSelectedRecord(null)} 
          onSave={(upd) => { onUpdateRecord(upd); setSelectedRecord(null); }} 
        />
      )}

      {/* 数据上传模态框 */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-3xl rounded-[4px] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#f0f0f0] flex items-center justify-between">
              <h3 className="text-lg font-medium text-[#303133]">数据上传</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-[#909399] hover:text-[#303133] transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <UploadSection onComplete={(newRecords) => {
                onAddRecords(newRecords);
                setShowUploadModal(false);
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
