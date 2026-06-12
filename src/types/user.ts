export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role_id: string | null;
  created_at: string;
}
