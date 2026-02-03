
import React, { useState } from 'react';
import { QARecord } from './types';
import Dashboard from './components/Dashboard';
import { 
  LayoutGrid, 
  Headphones,
  User,
  Power,
  ChevronRight
} from 'lucide-react';

const MOCK_DATA: QARecord[] = [
  {
    id: "uuid-001",
    agent_name: "王伟",
    upload_time: "2023-10-27 10:00:00",
    asr_content: "客服：您好，请问有什么可以帮您？\n用户：我想投诉你们的产品！\n客服：实在抱歉给您带来不便，请问具体遇到了什么问题？",
    duration: 120,
    keywords_detected: ["投诉"],
    system_result: "fail",
    final_result: "pass",
    is_modified: true,
    modification_log: {
      modified_by: "Admin",
      reason: "系统误判，话术标准",
      time: "2023-10-27 12:00:00"
    }
  },
  {
    id: "uuid-002",
    agent_name: "张芳",
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
    agent_name: "李明明",
    upload_time: "2023-10-27 14:30:00",
    asr_content: "客服：您好，请问有什么可以帮您？\n用户：你们这个软件怎么打不开啊？\n客服：请问您报错信息是什么呢？",
    duration: 210,
    keywords_detected: [],
    system_result: "pass",
    final_result: "pass",
    is_modified: false,
    modification_log: null
  },
  {
    id: "uuid-004",
    agent_name: "张晓萍",
    upload_time: "2023-10-27 16:45:00",
    asr_content: "客服：您好。\n用户：我要退货！质量太差了！\n客服：非常抱歉，我马上为您办理退货流程。",
    duration: 155,
    keywords_detected: ["退货", "质量太差"],
    system_result: "fail",
    final_result: "fail",
    is_modified: true,
    modification_log: {
      modified_by: "Admin",
      reason: "用户情绪强烈，需介入核查",
      time: "2023-10-27 17:00:00"
    }
  },
  {
    id: "uuid-005",
    agent_name: "赵晓霞",
    upload_time: "2023-10-28 09:10:00",
    asr_content: "客服：您好，欢迎致电。\n用户：请问你们周末上班吗？\n客服：我们周末是全天候为您服务的。",
    duration: 45,
    keywords_detected: [],
    system_result: "pass",
    final_result: "pass",
    is_modified: false,
    modification_log: null
  }
];

const App: React.FC = () => {
  const [records, setRecords] = useState<QARecord[]>(MOCK_DATA);

  const handleAddRecords = (newRecords: QARecord[]) => {
    setRecords(prev => [...newRecords, ...prev]);
  };

  return (
    <div className="min-h-screen flex bg-[#f0f2f5]">
      {/* 侧边栏 */}
      <aside className="w-64 bg-[#fff] border-r border-[#e6e6e6] flex flex-col fixed h-full z-20">
        <div className="h-14 flex items-center px-6 gap-3 border-b border-[#f0f0f0]">
          <div className="bg-[#587CF6] p-1.5 rounded-md shadow-sm">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-[#303133] text-lg tracking-tight">客服后台</span>
        </div>

        <nav className="flex-1 py-4">
          <button
            className="w-full flex items-center gap-3 px-6 py-4 transition-all bg-[#F0F3FF] text-[#587CF6] border-r-2 border-[#587CF6]"
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-sm font-medium">质检管理</span>
          </button>
        </nav>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* 顶栏 */}
        <header className="h-14 bg-white border-b border-[#e6e6e6] px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm text-[#606266]">
            <span>工作台</span>
            <ChevronRight className="w-4 h-4 text-[#C0C4CC]" />
            <span className="text-[#303133] font-medium">质检管理</span>
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

        {/* 页面内容 */}
        <main className="p-5">
          <div className="animate-in fade-in duration-300">
            <Dashboard 
              records={records} 
              onAddRecords={handleAddRecords}
              onUpdateRecord={(upd) => setRecords(prev => prev.map(r => r.id === upd.id ? upd : r))} 
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
