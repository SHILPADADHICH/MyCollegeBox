export interface Profile {
  id: string;
  name: string;
  full_name: string;
  branch: string;
  year: string;
  gender: "male" | "female" | "other";
  account_type: string;
  phone: string;
  city: string;
  pg_name: string;
  pg_location: string;
  pg_contact: string;
  room_types: string[];
  created_at: string;
}

export interface ProfileUpdate {
  name?: string;
  full_name?: string;
  branch?: string;
  year?: string;
  gender?: "male" | "female" | "other";
  account_type?: string;
  phone?: string;
  city?: string;
  pg_name?: string;
  pg_location?: string;
  pg_contact?: string;
  room_types?: string[];
}
