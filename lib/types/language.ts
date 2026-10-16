export type TargetLanguageId =
  | 'typescript'
  | 'python'
  | 'go'
  | 'rust'
  | 'devops'
  | 'javascript'
  | 'cpp'
  | 'java'
  | 'text';

export type TargetPresetId =
  | 'fullstack'     // 70% TypeScript, 30% Python
  | 'devops_cloud'  // 50% HCL (Terraform), 35% YAML (K8s/CI), 15% Shell
  | 'systems'       // 60% Rust, 40% Go
  | 'aiml';         // 80% Python, 20% TypeScript

export interface TargetLanguageConfig {
  mode: 'single' | 'preset';
  language?: TargetLanguageId;
  preset?: TargetPresetId;
}

export interface GeneratedCodeFile {
  path: string;
  content: string;
  language: string;
  bytes: number;
}

export interface LanguageMeta {
  id: TargetLanguageId;
  label: string;
  extension: string;
  color: string;
  description: string;
  folder: string;
}

export interface PresetMeta {
  id: TargetPresetId;
  label: string;
  badge: string;
  color: string;
  description: string;
  breakdown: string;
}
