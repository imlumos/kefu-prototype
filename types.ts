
export type QAStatus = 'pass' | 'fail';

export interface ModificationLog {
  modified_by: string;
  reason: string;
  time: string;
}

export interface QARecord {
  id: string;
  agent_name: string;
  upload_time: string;
  asr_content: string;
  duration: number; // in seconds
  keywords_detected: string[];
  system_result: QAStatus;
  final_result: QAStatus;
  is_modified: boolean;
  modification_log: ModificationLog | null;
}

export interface UploadedFile {
  id: string;
  fileName: string;
  parsedName: string;
  isParsingFailed: boolean;
  content: string;
}
