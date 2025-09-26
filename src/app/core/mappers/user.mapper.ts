import { User } from '../models/auth.model';

export function mapSupabaseUser(user: any): User {
  return {
    id: user.id,
    role: user.user_metadata['role'],
    name: user.user_metadata['name'],
    email: user.email ?? '',
    phone: user.phone,
    status: user.user_metadata['status'], //'active' | 'inactive';
    created_at: user.created_at,
    currentBusinessId: user.user_metadata['businessId'],
  };
}
