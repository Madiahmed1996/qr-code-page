// Определения типов данных, использующихся в приложении.

export interface Project {
  id: number;
  name: string;
  description?: string;
}

export interface EntityNode {
  id: number;
  project_id: number;
  name: string;
  parent_id?: number;
}

export interface MetricData {
  id: number;
  entity_id: number;
  metric_key: string;
  metric_value: number;
  recorded_at: string;
}

export interface ImportBatch {
  id: number;
  file_name: string;
  imported_at: string;
  row_count: number;
  new_count: number;
  duplicate_count: number;
  error_count: number;
}

export interface DuplicateLogEntry {
  id: number;
  project_id: number;
  import_batch_id: number;
  entity_type: string;
  existing_id: number | null;
  action: string;
  row_hash: string;
  new_data: any;
  existing_data: any;
  created_at: string;
}

export interface Employee {
  id: number;
  name: string;
  department?: string;
  position?: string;
  team?: string;
  phone?: string;
  active: boolean;
}

export interface WorkObject {
  id: number;
  name: string;
  address?: string;
  type?: string;
  status?: string;
  project?: string;
  responsible?: string;
  comment?: string;
}

export interface WorkAssignment {
  id: number;
  employee_id: number;
  object_id: number;
  start_date?: string;
  end_date?: string;
}

export interface TimesheetEntry {
  id: number;
  employee_id: number;
  date: string;
  hours: number;
  overtime: number;
  status?: string;
}
