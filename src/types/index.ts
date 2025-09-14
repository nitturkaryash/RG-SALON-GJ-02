export interface MergedAppointment {
  id: string;
  client_id: string;
  stylist_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  paid: boolean;
  created_at?: string;
  updated_at?: string;
  billed?: boolean;
  stylist_ids?: string[];
  service_ids?: string[];
  is_for_someone_else?: boolean;
  booker_name?: string;
  booker_phone?: string;
  booker_email?: string;
  booking_id?: string | null;
  checked_in?: boolean;
  clientDetails?: ClientAppointmentEntry[];
}

export interface ClientAppointmentEntry {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  services: ServiceEntry[];
  stylists: StylistEntry[];
  isForSomeoneElse: boolean;
}

export interface ExtendedClientAppointmentEntry extends ClientAppointmentEntry {
  client: any | null;
}

export interface ServiceEntry {
  id: string;
  name: string;
  price: number;
  duration: number;
  collection_id?: string;
}

export interface StylistEntry {
  id: string;
  name: string;
}

export interface StylistHoliday {
  id: string;
  stylist_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
  created_at?: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  stylist_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  paid: boolean;
  created_at?: string;
  updated_at?: string;
  billed?: boolean;
  stylist_ids?: string[];
  service_ids?: string[];
  is_for_someone_else?: boolean;
  booker_name?: string;
  booker_phone?: string;
  booker_email?: string;
  booking_id?: string | null;
  checked_in?: boolean;
}
