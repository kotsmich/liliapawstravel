export interface Dog {
  id: string;
  name: string;
  size: 'small' | 'medium' | 'large';
  age: number;
  chipId: string;
  pickupLocation: string;
  dropLocation: string;
  notes: string;
}
