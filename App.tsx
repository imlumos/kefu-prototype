
import React, { useState } from 'react';
import { QARecord, CallType } from './types';
import Dashboard from './components/Dashboard';
import QAItemsManager from './components/QAItemsManager';
import SchemeManager from './components/SchemeManager';
import { 
  LayoutGrid, 
  Headphones,
  User,
  Power,
  ChevronRight,
  PhoneIncoming,
  PhoneOutgoing,
  Settings,
  ChevronDown,
  ClipboardList
} from 'lucide-react';

const MOCK_DATA: QARecord[] = [
  {
    id: "uuid-001",
    agent_name: "王伟",
    group_name: "华东一组",
    call_type: "inbound",
    category: "B端_如何更换超管",
    upload_time: "2023-10-27 10:00:00",
    asr_content: "客服：您好，请问有什么可以帮您？\n用户：我想投诉你们的产品！\n客服：实在抱歉给您带来不便，请问具体遇到了什么问题？",
    duration: 120,
    keywords_detected: ["投诉"],
    system_result: "fail",
    final_result: "pass",
    is_modified: true,
    reinspector_name: "李主管",
    modification_log: {
      modified_by: "李主管",
      reason: "系统误判投诉关键词，实际为咨询处理",
      time: "2023-10-27 12:00:00"
    }
  },
  {
    id: "uuid-002",
    agent_name: "张芳",
    group_name: "华南二组",
    call_type: "outbound",
    category: "C端_简历丢失",
    upload_time: "2023-10-27 11:15:00",
    asr_content: "客服：您好，这里是售后中心。\n用户：我的订单还没到，能不能查一下？\n客服：好的，请提供一下订单号。",
    duration: 85,
    keywords_detected: [],
    system_result: "pass",
    final_result: "pass",
    is_modified: false,
    modification_log: null
  },
  {
    id: "uuid-003",
    agent_name: "刘强",
    group_name: "华北三组",
    call_type: "inbound",
    category: "B端_发票申请",
    upload_time: "2023-10-27 14:20:00",
    asr_content: "客服：您好，请问需要开具什么类型的发票？\n用户：我要开增值税专用发票。\n客服：好的，请提供贵司的开票资料。",
    duration: 150,
    keywords_detected: [],
    system_result: "pass",
    final_result: "pass",
    is_modified: false,
    modification_log: null
  },
  {
    id: "uuid-004",
    agent_name: "陈静",
    group_name: "华东一组",
    call_type: "outbound",
    category: "C端_账户注销",
    upload_time: "2023-10-27 15:45:00",
    asr_content: "客服：您好，我是您的专属管家陈静，看到您申请了注销账户...\n用户：不想用了，太麻烦了。\n客服：注销后您的历史记录将清空，您看是否考虑保留？",
    duration: 310,
    keywords_detected: ["注销"],
    system_result: "pass",
    final_result: "pass",
    is_modified: false,
    modification_log: null
  },
  {
    id: "uuid-005",
    agent_name: "赵雷",
    group_name: "华南二组",
    call_type: "inbound",
    category: "B端_权限报错",
    upload_time: "2023-10-27 16:10:00",
    asr_content: "客服：您好，请说下您的报错提示。\n用户：显示‘您没有权限访问此模块’。\n客服：好的，我帮您后台刷新下配置。",
    duration: 95,
    keywords_detected: [],
    system_result: "pass",
    final_result: "fail",
    is_modified: true,
    reinspector_name: "张经理",
    modification_log: {
      modified_by: "张经理",
      reason: "未核实用户身份即操作后台，违反安全规范",
      time: "2023-10-27 17:00:00"
    }
  },
  {
    id: "uuid-006",
    agent_name: "孙悦",
    group_name: "华北三组",
    call_type: "outbound",
    category: "C端_活动回访",
    upload_time: "2023-10-28 09:30:00",
    asr_content: "客服：您好，打扰了，想对您昨天的咨询进行回访。\n用户：挺好的，谢谢。\n客服：感谢支持，祝您生活愉快。",
    duration: 45,
    keywords_detected: [],
    system_result: "pass",
    final_result: "pass",
    is_modified: false,
    modification_log: null
  }
];

type ViewState = 'inbound' | 'outbound' | 'items' | 'schemes';

const App: React.FC = () => {
  const [records, setRecords] = useState<QARecord[]>(MOCK_DATA);
  const [currentView, setCurrentView] = useState<ViewState>('inbound');
  const [menuExpanded, setMenuExpanded] = useState(true);

  const handleAddRecords = (newRecords: QARecord[]) => {
    setRecords(prev => [...newRecords, ...prev]);
  };

  const getBreadcrumb = () => {
    switch(currentView) {
      case 'inbound': return '呼入质检';
      case 'outbound': return '呼出质检';
      case 'items': return '质检项管理';
      case 'schemes': return '质检方案管理';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f0f2f5]">
      <aside className="w-64 bg-[#fff] border-r border-[#e6e6e6] flex flex-col fixed h-full z-20">
        <div className="h-14 flex items-center px-6 gap-3 border-b border-[#f0f0f0]">
          <div className="bg-[#587CF6] p-1.5 rounded-md shadow-sm">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-[#303133] text-lg tracking-tight">客服后台</span>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <div>
            <button
              onClick={() => setMenuExpanded(!menuExpanded)}
              className={`w-full flex items-center justify-between px-6 py-4 transition-all hover:bg-[#F5F7FA] ${(currentView === 'inbound' || currentView === 'outbound' || currentView === 'items' || currentView === 'schemes') ? 'text-[#587CF6]' : 'text-[#606266]'}`}
            >
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-5 h-5" />
                <span className="text-sm font-bold">质检管理</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${menuExpanded ? '' : '-rotate-90'}`} />
            </button>
            
            {menuExpanded && (
              <div className="bg-white">
                <button
                  onClick={() => setCurrentView('inbound')}
                  className={`w-full flex items-center gap-3 pl-14 pr-6 py-3 text-sm transition-all ${currentView === 'inbound' ? 'text-[#587CF6] bg-[#F0F3FF] border-r-2 border-[#587CF6]' : 'text-[#606266] hover:bg-[#F5F7FA]'}`}
                >
                  <PhoneIncoming className="w-4 h-4" />
                  <span>呼入质检</span>
                </button>
                <button
                  onClick={() => setCurrentView('outbound')}
                  className={`w-full flex items-center gap-3 pl-14 pr-6 py-3 text-sm transition-all ${currentView === 'outbound' ? 'text-[#587CF6] bg-[#F0F3FF] border-r-2 border-[#587CF6]' : 'text-[#606266] hover:bg-[#F5F7FA]'}`}
                >
                  <PhoneOutgoing className="w-4 h-4" />
                  <span>呼出质检</span>
                </button>
                <button
                  onClick={() => setCurrentView('items')}
                  className={`w-full flex items-center gap-3 pl-14 pr-6 py-3 text-sm transition-all ${currentView === 'items' ? 'text-[#587CF6] bg-[#F0F3FF] border-r-2 border-[#587CF6]' : 'text-[#606266] hover:bg-[#F5F7FA]'}`}
                >
                  <Settings className="w-4 h-4" />
                  <span>质检项管理</span>
                </button>
                <button
                  onClick={() => setCurrentView('schemes')}
                  className={`w-full flex items-center gap-3 pl-14 pr-6 py-3 text-sm transition-all ${currentView === 'schemes' ? 'text-[#587CF6] bg-[#F0F3FF] border-r-2 border-[#587CF6]' : 'text-[#606266] hover:bg-[#F5F7FA]'}`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>质检方案管理</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </aside>

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-14 bg-white border-b border-[#e6e6e6] px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm text-[#606266]">
            <span>质检管理</span>
            <ChevronRight className="w-4 h-4 text-[#C0C4CC]" />
            <span className="text-[#303133] font-medium">{getBreadcrumb()}</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#606266]">zhao.binbin</span>
              <div className="w-8 h-8 bg-[#f5f7fa] rounded-full flex items-center justify-center border border-[#e6e6e6]">
                <User className="w-4 h-4 text-[#909399]" />
              </div>
            </div>
            <button className="text-[#909399] hover:text-[#f56c6c] transition-colors">
              <Power className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="p-5">
          <div key={currentView} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {currentView === 'inbound' && (
              <Dashboard 
                records={records.filter(r => r.call_type === 'inbound')} 
                type="inbound"
                onAddRecords={handleAddRecords}
                onUpdateRecord={(upd) => setRecords(prev => prev.map(r => r.id === upd.id ? upd : r))} 
              />
            )}
            {currentView === 'outbound' && (
              <Dashboard 
                records={records.filter(r => r.call_type === 'outbound')} 
                type="outbound"
                onAddRecords={handleAddRecords}
                onUpdateRecord={(upd) => setRecords(prev => prev.map(r => r.id === upd.id ? upd : r))} 
              />
            )}
            {currentView === 'items' && <QAItemsManager />}
            {currentView === 'schemes' && <SchemeManager />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
