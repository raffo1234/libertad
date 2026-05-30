export interface BitacoraFile {
  id: string;
  entry_id: string;
  name: string;
  size: number;
  type: string;
  r2_key: string;
  url: string;
  created_at: string;
}

export interface BitacoraEntry {
  id: string;
  project_slug: string;
  date: string;
  title: string;
  description: string | null;
  created_by: string;
  created_at: string;
  files?: BitacoraFile[];
}

export interface BitacoraEntryInsert {
  project_slug: string;
  date: string;
  title: string;
  description?: string;
  created_by: string;
}
