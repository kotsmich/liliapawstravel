export interface Dog {
  id: string;
  name: string;
  size: 'small' | 'medium' | 'large';
  age: number;
  chipId: string;
  pickupLocation: string;
  dropLocation: string;
  notes: string;
  requesterName?: string | null;
  requesterEmail?: string | null;
  requesterPhone?: string | null;
}
