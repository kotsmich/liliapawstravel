export interface Dog {
  id: string;
  name: string;
  size: 'small' | 'medium' | 'large';
  chipId: string;
  fromCountry: string;
  fromCity: string;
  toCountry: string;
  toCity: string;
  notes: string;
}
