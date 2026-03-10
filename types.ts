
export type QAStatus = 'pass' | 'fail';
export type CallType = 'inbound' | 'outbound';
export type ItemStatus = 'enabled' | 'disabled';

export interface ModificationLog {
  modified_by: string;
  reason: string;
  time: string;
}

export interface QARecord {
  id: string;
  agent_name: string;
  group_name: string;
  call_type: CallType;
  category: string;
  upload_time: string;
  asr_content: string;
  duration: number;
  keywords_detected: string[];
  system_result: QAStatus;
  final_result: QAStatus;
  is_modified: boolean;
  modification_log: ModificationLog | null;
  reinspector_name?: string;
}

export interface UploadedFile {
  id: string;
  fileName: string;
  parsedName: string;
  isParsingFailed: boolean;
  content: string;
}

export interface QAItem {
  id: string;
  call_type: CallType | 'both';
  name: string;
  content: string;
  qa_standard: string;
  fail_standard: string;
  is_critical: boolean;
  status: ItemStatus;
}

// 新增：评分项明细
export interface QAItemScore {
  name: string;
  is_passed: boolean;
  description: string;
  is_critical: boolean;
}

export interface AnalysisResult {
  conclusion_summary: string;
  summary: string;
  scores: QAItemScore[]; // 结构化评分
}

// 新增：质检方案
export interface QAScheme {
  id: string;
  name: string;
  call_type: CallType;
  item_ids: string[];
  standard_fail_threshold: number; // 标准项不通过阈值
  critical_fail_threshold: number; // 关键项不通过阈值
  status: ItemStatus;
}
