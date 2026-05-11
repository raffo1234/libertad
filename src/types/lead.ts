export type UnitType = "type_1" | "type_2" | "type_3" | "type_4" | "parking";

export type LeadStatus = "new" | "contacted" | "visit" | "reserved" | "lost";

export interface Lead {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  unit_type: UnitType | null;
  status: LeadStatus;
  notes: string | null;
  source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}
