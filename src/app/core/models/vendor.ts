export interface Vendor {
  id: string;
  business_id: string;
  name: string;
  phone?: string;
  status: 'active' | 'inactive';
  is_global?: boolean;
  created_at?: string;
}
