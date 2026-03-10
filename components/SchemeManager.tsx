
import React, { useState, useMemo } from 'react';
import { QAScheme, CallType, QAItem } from '../types';
import { Plus, Search, Edit3, Trash2, Settings2, Info, ClipboardList, MinusCircle, PlusCircle, AlertTriangle, ShieldCheck, X, Star } from 'lucide-react';

// 模拟初始质检项池
const INITIAL_ITEMS: QAItem[] = [
  { id: '1', call_type: 'inbound', name: '礼貌用语', content: '是否包含标准问候语', qa_standard: '合格', fail_standard: '不合格', is_critical: true, status: 'enabled' },
  { id: '2', call_type: 'both', name: '需求理解', content: '是否准确复述用户诉求', qa_standard: '合格', fail_standard: '不合格', is_critical: true, status: 'enabled' },
  { id: '3', call_type: 'outbound', name: '身份核实', content: '拨通后核实对方身份', qa_standard: '合格', fail_standard: '不合格', is_critical: false, status: 'enabled' },
  { id: '4', call_type: 'both', name: '服务态度', content: '语气是否和蔼专业', qa_standard: '合格', fail_standard: '不合格', is_critical: false, status: 'enabled' },
  { id: '5', call_type: 'inbound', name: '解决效率', content: '是否在3分钟内提供方案', qa_standard: '合格', fail_standard: '不合格', is_critical: false, status: 'enabled' },
  { id: '6', call_type: 'both', name: '系统录入', content: '工单内容是否准确无误', qa_standard: '合格', fail_standard: '不合格', is_critical: true, status: 'enabled' },
];

const MOCK_SCHEMES: QAScheme[] = [
  { id: 's1', name: '呼入标准质检方案', call_type: 'inbound', item_ids: ['1', '2', '4'], standard_fail_threshold: 1, critical_fail_threshold: 1, status: 'enabled' },
  { id: 's2', name: '呼出回访方案', call_type: 'outbound', item_ids: ['2', '3'], standard_fail_threshold: 2, critical_fail_threshold: 1, status: 'enabled' }
];

const SchemeManager: React.FC = () => {
  const [schemes, setSchemes] = useState<QAScheme[]>(MOCK_SCHEMES);
  // 使用 state 维护所有规则，以便模拟“设为关键”的持久化
  const [allRules, setAllRules] = useState<QAItem[]>(INITIAL_ITEMS);
  const [showModal, setShowModal] = useState(false);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [editingScheme, setEditingScheme] = useState<QAScheme | null>(null);
  
  const [formData, setFormData] = useState<Omit<QAScheme, 'id'>>({
    name: '',
    call_type: 'inbound',
    item_ids: [],
    standard_fail_threshold: 1,
    critical_fail_threshold: 1,
    status: 'enabled'
  });

  const handleOpenAdd = () => {
    setEditingScheme(null);
    setFormData({ name: '', call_type: 'inbound', item_ids: [], standard_fail_threshold: 1, critical_fail_threshold: 1, status: 'enabled' });
    setShowModal(true);
  };

  const handleOpenEdit = (scheme: QAScheme) => {
    setEditingScheme(scheme);
    setFormData({ ...scheme });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (editingScheme) {
      setSchemes(prev => prev.map(s => s.id === editingScheme.id ? { ...formData, id: s.id } : s));
    } else {
      setSchemes(prev => [...prev, { ...formData, id: `s-${Math.random().toString(36).substr(2, 5)}` }]);
    }
    setShowModal(false);
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      item_ids: prev.item_ids.filter(i => i !== id)
    }));
  };

  const addItem = (id: string) => {
    if (!formData.item_ids.includes(id)) {
      setFormData(prev => ({
        ...prev,
        item_ids: [...prev.item_ids, id]
      }));
    }
    setShowItemPicker(false);
  };

  const toggleCritical = (id: string) => {
    setAllRules(prev => prev.map(item => 
      item.id === id ? { ...item, is_critical: !item.is_critical } : item
    ));
  };

  // 统计已选标准项和关键项数量
  const selectedItemsData = useMemo(() => {
    return allRules.filter(item => formData.item_ids.includes(item.id));
  }, [formData.item_ids, allRules]);

  const selectedCounts = useMemo(() => {
    return {
      standard: selectedItemsData.filter(i => !i.is_critical).length,
      critical: selectedItemsData.filter(i => i.is_critical).length
    };
  }, [selectedItemsData]);

  // 待选池（过滤掉已选的，且符合场景和状态的）
  const availableItems = useMemo(() => {
    return allRules.filter(item => 
      !formData.item_ids.includes(item.id) && 
      (item.call_type === 'both' || item.call_type === formData.call_type) &&
      item.status === 'enabled'
    );
  }, [formData.item_ids, formData.call_type, allRules]);

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-sm border border-[#ebeef5] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h2 className="text-lg font-bold text-[#303133]">质检方案管理</h2>
          <p className="text-xs text-[#909399]">在此配置针对不同通话类型的质检项目组合及自动判定规则</p>
        </div>
        <button onClick={handleOpenAdd} className="px-5 py-2 bg-[#587CF6] text-white text-sm font-bold rounded-[4px] hover:bg-[#6C8EF8] flex items-center gap-2 shadow-lg shadow-[#587CF6]/20 transition-all">
          <Plus className="w-4 h-4" />创建方案
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schemes.map(scheme => (
          <div key={scheme.id} className="bg-white border border-[#ebeef5] rounded-[4px] shadow-sm hover:shadow-md transition-shadow group">
            <div className="p-5 border-b border-[#f5f7fa] flex items-center justify-between">
              <div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase mb-1 inline-block ${
                  scheme.call_type === 'inbound' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'
                }`}>
                  {scheme.call_type === 'inbound' ? '呼入场景' : '呼出场景'}
                </span>
                <h3 className="font-bold text-[#303133] group-hover:text-[#587CF6] transition-colors">{scheme.name}</h3>
              </div>
              <Settings2 className="w-5 h-5 text-[#C0C4CC]" />
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#909399]">已选质检项</span>
                <span className="font-bold text-[#303133]">{scheme.item_ids.length} 项</span>
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between items-center text-xs">
                  <span className="text-[#909399] flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> 标准项判定</span>
                  <span className="text-[#587CF6] font-bold">≥ {scheme.standard_fail_threshold} 项不通过</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#909399] flex items-center gap-1 text-[#f56c6c]"><AlertTriangle className="w-3 h-3" /> 关键项判定</span>
                  <span className="text-[#f56c6c] font-bold">≥ {scheme.critical_fail_threshold} 项不通过</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-[#f5f7fa]">
                <button onClick={() => handleOpenEdit(scheme)} className="flex-1 py-1.5 text-xs font-medium text-[#587CF6] bg-[#F0F3FF] rounded hover:bg-[#e0e8ff] transition-colors flex items-center justify-center gap-1">
                  <Edit3 className="w-3.5 h-3.5" />编辑方案
                </button>
                <button onClick={() => setSchemes(prev => prev.filter(s => s.id !== scheme.id))} className="px-3 py-1.5 text-xs text-[#f56c6c] border border-[#fde2e2] rounded hover:bg-[#fef0f0] transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b font-bold text-[#303133] text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#587CF6]" />
                {editingScheme ? '修改质检方案' : '创建新质检方案'}
              </div>
              <button onClick={() => setShowModal(false)} className="text-[#C0C4CC] hover:text-[#909399]"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
              <div className="space-y-5">
                {/* 基本信息 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#606266]">方案名称</label>
                    <input 
                      type="text" 
                      className="w-full border rounded p-2 text-sm outline-none focus:border-[#587CF6] transition-all" 
                      placeholder="如：华东呼入标准流程"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#606266]">适用通话类型</label>
                    <select 
                      className="w-full border rounded p-2 text-sm outline-none focus:border-[#587CF6] transition-all"
                      value={formData.call_type}
                      onChange={(e) => {
                        const newType = e.target.value as CallType;
                        setFormData({
                          ...formData, 
                          call_type: newType,
                          item_ids: [] 
                        });
                      }}
                    >
                      <option value="inbound">呼入质检</option>
                      <option value="outbound">呼出质检</option>
                    </select>
                  </div>
                </div>

                {/* 已选质检项列表 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-[#F8F9FB] px-4 py-2 rounded-t border-x border-t border-[#ebeef5]">
                    <label className="text-xs font-bold text-[#303133] flex items-center gap-1.5">
                      必须检查的质检项
                      <span className="text-[10px] text-[#909399] font-normal">(已添加 {formData.item_ids.length} 项)</span>
                    </label>
                    <button 
                      onClick={() => setShowItemPicker(true)}
                      className="text-[11px] bg-[#587CF6] text-white px-3 py-1 rounded font-bold flex items-center gap-1 hover:bg-[#6C8EF8] transition-all shadow-sm"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> 添加质检项
                    </button>
                  </div>

                  <div className="border border-[#ebeef5] rounded-b overflow-hidden bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAFAFA] text-[#909399] border-b">
                        <tr>
                          <th className="px-4 py-2 font-medium">质检项名称</th>
                          <th className="px-4 py-2 font-medium w-24 text-center">关键</th>
                          <th className="px-4 py-2 font-medium w-20 text-center">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0F0F0]">
                        {selectedItemsData.length > 0 ? (
                          selectedItemsData.map(item => (
                            <tr key={item.id} className="hover:bg-[#F9FBFF] transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {item.is_critical && <AlertTriangle className="w-3.5 h-3.5 text-[#f56c6c]" />}
                                  <p className="font-bold text-[#303133]">{item.name}</p>
                                </div>
                                <p className="text-[10px] text-[#909399] truncate max-w-[200px] mt-0.5">{item.content}</p>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button 
                                  onClick={() => toggleCritical(item.id)}
                                  className={`p-1.5 rounded transition-colors ${
                                    item.is_critical ? 'text-[#f56c6c] bg-[#fef0f0]' : 'text-[#C0C4CC] hover:text-[#587CF6] hover:bg-[#F0F3FF]'
                                  }`}
                                  title={item.is_critical ? "取消关键" : "设为关键"}
                                >
                                  <Star className={`w-4 h-4 ${item.is_critical ? 'fill-current' : ''}`} />
                                </button>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button 
                                  onClick={() => removeItem(item.id)}
                                  className="text-[#909399] hover:text-[#f56c6c] p-1.5 rounded transition-colors"
                                  title="移除此项"
                                >
                                  <MinusCircle className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-4 py-12 text-center text-[#909399] bg-white italic">
                              暂未配置检查项，请点击右上方按钮从项目池中添加
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 判定阈值区域 - 优化紧凑度 */}
                <div className="space-y-3">
                  <div className="p-5 bg-[#F9FBFF] rounded-[4px] border border-[#DCE4FF] space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Settings2 className="w-4 h-4 text-[#587CF6]" />
                      <h4 className="text-xs font-bold text-[#303133]">自动化判定逻辑设定</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                      {/* 标准项阈值 */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] text-[#606266] font-bold flex items-center justify-between">
                          <span>标准项判定</span>
                          <span className="text-[10px] font-normal text-[#909399]">(已选:{selectedCounts.standard})</span>
                        </label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-[#606266] whitespace-nowrap">当不通过 ≥</span>
                          <input 
                            type="number" 
                            min="1" 
                            max={Math.max(selectedCounts.standard, 1)}
                            className="w-12 px-1.5 py-1 border border-[#DCDFE6] rounded text-sm outline-none focus:border-[#587CF6] bg-white shadow-sm text-center font-bold"
                            value={formData.standard_fail_threshold}
                            onChange={(e) => setFormData({...formData, standard_fail_threshold: parseInt(e.target.value) || 1})}
                          />
                          <span className="text-[11px] text-[#606266] whitespace-nowrap">项时，整体不合格</span>
                        </div>
                      </div>

                      {/* 关键项阈值 */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] text-[#606266] font-bold flex items-center justify-between">
                          <span>关键项判定</span>
                          <span className="text-[10px] font-normal text-[#909399]">(已选:{selectedCounts.critical})</span>
                        </label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-[#606266] whitespace-nowrap">当不通过 ≥</span>
                          <input 
                            type="number" 
                            min="1" 
                            max={Math.max(selectedCounts.critical, 1)}
                            className="w-12 px-1.5 py-1 border border-[#DCDFE6] rounded text-sm outline-none focus:border-[#f56c6c] bg-white shadow-sm text-center font-bold text-[#f56c6c]"
                            value={formData.critical_fail_threshold}
                            onChange={(e) => setFormData({...formData, critical_fail_threshold: parseInt(e.target.value) || 1})}
                          />
                          <span className="text-[11px] text-[#606266] whitespace-nowrap">项时，整体不合格</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2 border-t border-[#DCE4FF]">
                      <Info className="w-3.5 h-3.5 text-[#587CF6] mt-0.5 shrink-0" />
                      <p className="text-[10px] text-[#587CF6] leading-relaxed">
                        判定规则：标准项与关键项阈值属于“或”关系。任意一项满足判定条件，则系统自动判定整单为“不通过”。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-[#fafafa] flex justify-end gap-3 border-t">
              <button onClick={() => setShowModal(false)} className="px-6 py-2 text-sm text-[#909399] hover:text-[#606266] transition-colors">取消</button>
              <button onClick={handleSubmit} className="px-8 py-2 bg-[#587CF6] text-white text-sm font-bold rounded shadow-lg shadow-[#587CF6]/20 hover:bg-[#6C8EF8] transition-all">保存方案</button>
            </div>
          </div>
        </div>
      )}

      {/* 质检项池选择浮窗 (Item Picker) */}
      {showItemPicker && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-5 py-4 border-b flex items-center justify-between bg-[#F8F9FB]">
              <h4 className="font-bold text-[#303133] flex items-center gap-2 text-sm">
                <PlusCircle className="w-4 h-4 text-[#587CF6]" /> 
                从质检项池中添加 (仅显示有效项)
              </h4>
              <button onClick={() => setShowItemPicker(false)} className="text-[#C0C4CC] hover:text-[#909399]"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0C4CC]" />
                <input 
                  type="text" 
                  placeholder="输入名称搜索..." 
                  className="w-full pl-9 pr-4 py-2 border border-[#DCDFE6] rounded-md text-sm outline-none focus:border-[#587CF6] transition-all" 
                />
              </div>

              <div className="max-h-[350px] overflow-y-auto divide-y border border-[#EBEFE5] rounded-md shadow-inner">
                {availableItems.length > 0 ? (
                  availableItems.map(item => (
                    <div 
                      key={item.id} 
                      className="px-4 py-3 flex items-center justify-between hover:bg-[#F9FBFF] cursor-pointer group transition-colors"
                      onClick={() => addItem(item.id)}
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#303133] group-hover:text-[#587CF6] transition-colors">{item.name}</span>
                          {item.is_critical && <span className="text-[9px] text-[#f56c6c] px-1 bg-[#fef0f0] border border-[#fde2e2] rounded font-bold uppercase">Critical</span>}
                        </div>
                        <p className="text-[11px] text-[#909399] truncate mt-0.5">{item.content}</p>
                      </div>
                      <div className="shrink-0 text-[#587CF6] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <span className="text-[11px] font-bold">添加</span>
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-24 text-center text-[#909399] text-xs space-y-2">
                    <p className="italic">没有更多符合当前场景的有效质检项</p>
                    <p className="text-[10px]">请在“质检项管理”中启用更多项目</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t bg-[#FAFAFA] text-right">
              <button 
                onClick={() => setShowItemPicker(false)}
                className="px-5 py-1.5 text-xs text-[#909399] font-bold hover:text-[#606266] transition-colors"
              >
                取消关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemeManager;
