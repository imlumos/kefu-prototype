
import React, { useState } from 'react';
import { QARecord, QAStatus, CallType } from '../types';
import { Search, UserCheck, Plus, Download, XCircle } from 'lucide-react';
import DetailModal from './DetailModal';
import UploadSection from './UploadSection';

interface DashboardProps {
  records: QARecord[];
  type: CallType;
  onUpdateRecord: (record: QARecord) => void;
  onAddRecords: (records: QARecord[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ records, type, onUpdateRecord, onAddRecords }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState<QAStatus | 'all'>('all');
  const [finalFilter, setFinalFilter] = useState<QAStatus | 'all'>('all');
  const [selectedRecord, setSelectedRecord] = useState<QARecord | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const groups = Array.from(new Set(records.map(r => r.group_name)));

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.includes(searchTerm);
    const matchesGroup = groupFilter === 'all' || r.group_name === groupFilter;
    const matchesSystem = systemFilter === 'all' || r.system_result === systemFilter;
    const matchesFinal = finalFilter === 'all' || r.final_result === finalFilter;
    return matchesSearch && matchesGroup && matchesSystem && matchesFinal;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-sm border border-[#ebeef5] shadow-sm flex flex-wrap gap-x-6 gap-y-4 items-center">
        <div className="flex flex-wrap gap-x-6 gap-y-4 items-center flex-1">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[#606266] whitespace-nowrap">组别</label>
            <select 
              className="w-32 px-2 py-1.5 border border-[#dcdfe6] rounded-[4px] text-sm focus:border-[#587CF6] outline-none text-[#606266]"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="all">全部组别</option>
              {groups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[#606266] whitespace-nowrap">关键词</label>
            <input 
              type="text" 
              placeholder="姓名 / ID" 
              className="w-40 px-3 py-1.5 border border-[#dcdfe6] rounded-[4px] text-sm focus:border-[#587CF6] outline-none transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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

          <button className="px-5 py-1.5 bg-[#587CF6] text-white text-sm font-medium rounded-[4px] hover:bg-[#6C8EF8] transition-colors flex items-center gap-1">
            <Search className="w-3.5 h-3.5" />查询
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-1.5 bg-white text-[#606266] border border-[#dcdfe6] text-sm font-medium rounded-[4px] hover:bg-[#f5f7fa] flex items-center gap-1">
            <Download className="w-3.5 h-3.5" />导出
          </button>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-1.5 bg-white text-[#587CF6] border border-[#587CF6] text-sm font-medium rounded-[4px] hover:bg-[#F0F3FF] flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />导入数据
          </button>
        </div>
      </div>

      <div className="bg-white rounded-sm border border-[#ebeef5] shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-[#f5f7fa] text-[#909399] font-medium border-b border-[#ebeef5]">
            <tr>
              <th className="px-4 py-3 border-r border-[#ebeef5]">时间</th>
              <th className="px-4 py-3 border-r border-[#ebeef5]">所属组别</th>
              <th className="px-4 py-3 border-r border-[#ebeef5]">被质检人</th>
              <th className="px-4 py-3 border-r border-[#ebeef5]">四级分类</th>
              <th className="px-4 py-3 border-r border-[#ebeef5]">系统结果</th>
              <th className="px-4 py-3 border-r border-[#ebeef5]">复检人</th>
              <th className="px-4 py-3 border-r border-[#ebeef5]">最终结果</th>
              <th className="px-4 py-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebeef5]">
            {filteredRecords.map((record) => (
              <tr key={record.id} className="hover:bg-[#f5f7fa] transition-colors">
                <td className="px-4 py-3 text-[#606266] whitespace-nowrap">{record.upload_time}</td>
                <td className="px-4 py-3 text-[#606266]">{record.group_name}</td>
                <td className="px-4 py-3 font-medium text-[#303133] whitespace-nowrap">{record.agent_name}</td>
                <td className="px-4 py-3 text-[#606266]">{record.category}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs border ${record.system_result === 'pass' ? 'bg-[#f0f9eb] text-[#67c23a] border-[#e1f3d8]' : 'bg-[#fef0f0] text-[#f56c6c] border-[#fde2e2]'}`}>
                    {record.system_result === 'pass' ? '通过' : '不通过'}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#909399]">{record.reinspector_name || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs text-white ${record.final_result === 'pass' ? 'bg-[#67c23a]' : 'bg-[#f56c6c]'}`}>
                      {record.final_result === 'pass' ? '通过' : '不通过'}
                    </span>
                    {record.is_modified && <UserCheck className="w-4 h-4 text-[#587CF6]" title="已被人工修正" />}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => setSelectedRecord(record)} className="text-[#587CF6] font-medium hover:underline">查看详情</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRecords.length === 0 && <div className="py-20 text-center text-[#909399] bg-[#fafafa]">暂无数据记录</div>}
      </div>

      {selectedRecord && (
        <DetailModal 
          record={selectedRecord} 
          onClose={() => setSelectedRecord(null)} 
          onSave={(upd) => { onUpdateRecord(upd); setSelectedRecord(null); }} 
        />
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-3xl rounded shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#303133]">数据上传</h3>
              <button onClick={() => setShowUploadModal(false)}><XCircle className="w-5 h-5 text-[#909399]" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <UploadSection onComplete={(newRecs) => {
                const enriched = newRecs.map(r => ({ ...r, call_type: type, group_name: '未分配', category: '待分类' }));
                onAddRecords(enriched);
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
