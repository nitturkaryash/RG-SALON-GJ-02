// ServiceCollection represents a category or group of services
export interface ServiceCollection {
  id: string;
  name: string;
  description: string;
  created_at?: string;
}

// Service represents a salon service with pricing and duration
export interface ServiceItem {
  id: string;
  collection_id: string;
  subcollection_id?: string; // optional link to a sub-collection
  name: string;
  description: string;
  price: number;
  duration: number;
  active: boolean;
  gender?: 'male' | 'female' | null;
  membership_eligible?: boolean; // Controls if service can be purchased with membership balance
  created_at?: string;
}

// ServiceSubCollection represents a sub-grouping within a service collection
export interface ServiceSubCollection {
  id: string;
  collection_id: string;
  name: string;
  description: string;
  created_at?: string;
} 