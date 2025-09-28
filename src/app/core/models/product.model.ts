export interface Product {
  id: string;
  business_id: string;
  category_id: string;
  name: string;
  status: 'active' | 'inactive';
  is_global?: boolean;
  created_at?: string;
}
