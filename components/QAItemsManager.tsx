
import React, { useState } from 'react';
import { QAItem, CallType, ItemStatus } from '../types';
import { Plus, Search, Edit3, Trash2, ShieldAlert, CheckCircle2, ToggleLeft, ToggleRight } from 'lucide-react';

const MOCK_ITEMS: QAItem[] = [
  { id: '1', call_type: 'inbound', name: '礼貌用语', content: '是否使用标准问候语', qa_standard: '包含“您好，请问有什么可以帮您”', fail_standard: '语气生硬或无问候', is_critical: true, status: 'enabled' },
  { id: '2', call_type: 'both', name: '需求理解', content: '是否准确记录客户诉求', qa_standard: '复述确认需求', fail_standard: '理解偏差导致重复询问', is_critical: true, status: 'enabled' },
  { id: '3', call_type: 'outbound', name: '身份核实', content: '拨通后核实对方身份', qa_standard: '确认姓名及事由', fail_standard: '直接陈述业务信息', is_critical: false, status: 'disabled' },
];

const QAItemsManager: React.FC = () => {
  const [items, setItems] = useState<QAItem[]>(MOCK_ITEMS);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<QAItem | null>(null);

  const initialFormData: Omit<QAItem, 'id'> = {
    name: '',
    call_type: 'both',
    content: '',
    qa_standard: '',
    fail_standard: '',
    is_critical: false,
    status: 'enabled'
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const handleOpenEdit = (item: QAItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      call_type: item.call_type,
      content: item.content,
      qa_standard: item.qa_standard,
      fail_standard: item.fail_standard,
      is_critical: item.is_critical,
      status: item.status
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...formData, id: i.id } : i));
    } else {
      setItems(prev => [...prev, { ...formData, id: Math.random().toString(36).substr(2, 9) }]);
    }
    setShowModal(false);
  };

  const toggleStatus = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: i.status === 'enabled' ? 'disabled' : 'enabled' } : i));
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-sm border border-[#ebeef5] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h2 className="text-lg font-bold text-[#303133]">质检规则配置</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0C4CC]" />
            <input type="text" placeholder="搜索质检项名称" className="pl-9 pr-4 py-1.5 border border-[#dcdfe6] rounded-[4px] text-sm focus:border-[#587CF6] outline-none w-64" />
          </div>
        </div>
        <button onClick={handleOpenAdd} className="px-5 py-2 bg-[#587CF6] text-white text-sm font-bold rounded-[4px] hover:bg-[#6C8EF8] flex items-center gap-2 shadow-lg shadow-[#587CF6]/20 transition-all">
          <Plus className="w-4 h-4" />新增质检项
        </button>
      </div>

      <div className="bg-white rounded border border-[#ebeef5] shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f5f7fa] text-[#909399] font-medium border-b border-[#ebeef5]">
            <tr>
              <th className="px-6 py-4">质检项名称</th>
              <th className="px-6 py-4">适用类型</th>
              <th className="px-6 py-4">质检内容</th>
              <th className="px-6 py-4">质检标准</th>
              <th className="px-6 py-4 text-center">关键项</th>
              <th className="px-6 py-4 text-center">状态</th>
              <th className="px-6 py-4 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebeef5]">
            {items.map(item => (
              <tr key={item.id} className={`hover:bg-[#f5f7fa] transition-colors ${item.status === 'disabled' ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                <td className="px-6 py-4 font-bold text-[#303133]">{item.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    item.call_type === 'inbound' ? 'bg-blue-50 text-blue-500 border-blue-100' : 
                    item.call_type === 'outbound' ? 'bg-orange-50 text-orange-500 border-orange-100' : 
                    'bg-gray-50 text-gray-500 border-gray-100'
                  }`}>
                    {item.call_type === 'inbound' ? '呼入' : item.call_type === 'outbound' ? '呼出' : '通用'}
                  </span>
                </td>
                <td className="px-6 py-4 text-[#606266] max-w-[150px] truncate" title={item.content}>{item.content}</td>
                <td className="px-6 py-4 text-[#606266] max-w-[150px] truncate" title={item.qa_standard}>{item.qa_standard}</td>
                <td className="px-6 py-4 text-center font-medium">
                  {item.is_critical ? <span className="text-[#f56c6c]">是</span> : <span className="text-[#C0C4CC]">-</span>}
                </td>
                <td className="px-6 py-4 text-center">
                   <button onClick={() => toggleStatus(item.id)} className="transition-transform active:scale-90">
                      {item.status === 'enabled' ? <ToggleRight className="w-6 h-6 text-[#587CF6]" /> : <ToggleLeft className="w-6 h-6 text-[#C0C4CC]" />}
                   </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => handleOpenEdit(item)} className="text-[#587CF6] hover:underline flex items-center gap-1 font-medium"><Edit3 className="w-3.5 h-3.5" />修改</button>
                    <button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))} className="text-[#f56c6c] hover:underline flex items-center gap-1 font-medium"><Trash2 className="w-3.5 h-3.5" />删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b font-bold text-[#303133] text-lg">{editingItem ? '修改质检规则项' : '新增质检规则项'}</div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#606266]">质检项名称</label>
                  <input 
                    type="text" 
                    className="w-full border rounded p-2 text-sm outline-none focus:border-[#587CF6]" 
                    placeholder="输入规则名称"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#606266]">适用通话类型</label>
                  <select 
                    className="w-full border rounded p-2 text-sm outline-none focus:border-[#587CF6]"
                    value={formData.call_type}
                    onChange={(e) => setFormData({...formData, call_type: e.target.value as any})}
                  >
                    <option value="both">通用</option>
                    <option value="inbound">呼入质检</option>
                    <option value="outbound">呼出质检</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#606266]">质检内容</label>
                <textarea 
                   className="w-full border rounded p-2 text-sm h-16 outline-none focus:border-[#587CF6]" 
                   placeholder="详细描述质检点..."
                   value={formData.content}
                   onChange={(e) => setFormData({...formData, content: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#606266]">质检标准</label>
                <textarea 
                  className="w-full border rounded p-2 text-sm h-20 outline-none focus:border-[#587CF6]" 
                  placeholder="描述合格的判定条件..." 
                  value={formData.qa_standard}
                  onChange={(e) => setFormData({...formData, qa_standard: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="critical" 
                    className="w-4 h-4 rounded text-[#587CF6] focus:ring-[#587CF6]"
                    checked={formData.is_critical}
                    onChange={(e) => setFormData({...formData, is_critical: e.target.checked})}
                  />
                  <label htmlFor="critical" className="text-sm text-[#606266] font-medium">关键考核项</label>
                </div>
                <div className="flex items-center gap-2">
                   <label className="text-sm text-[#606266] font-medium">启用状态：</label>
                   <select 
                      className="border rounded px-2 py-1 text-xs outline-none focus:border-[#587CF6]"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    >
                      <option value="enabled">启用</option>
                      <option value="disabled">不启用</option>
                   </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-[#fafafa] flex justify-end gap-3 border-t">
              <button onClick={() => setShowModal(false)} className="px-6 py-2 text-sm text-[#909399] hover:text-[#606266]">取消</button>
              <button onClick={handleSubmit} className="px-6 py-2 bg-[#587CF6] text-white text-sm font-bold rounded shadow-lg shadow-[#587CF6]/20 hover:bg-[#6C8EF8]">提交保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QAItemsManager;
