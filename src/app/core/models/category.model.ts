export interface Category {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  is_global?: boolean;
  created_at?: string;
}
