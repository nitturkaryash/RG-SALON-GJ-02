export interface ExcelClient {
  full_name: string;
  phone: string;
  email?: string;
  gender?: string;
  notes?: string;
  birth_date?: string;
  anniversary_date?: string;
}

export interface ImportResult {
  success: boolean;
  client: ExcelClient;
  error?: string;
}

export interface ImportStats {
  total: number;
  successful: number;
  failed: number;
  errors: ImportResult[];
} 