export interface Dog {
  id: string;
  name: string;
  size: 'Small' | 'Medium' | 'Large';
  microchipId: string;
  fromCountry: string;
  fromCity: string;
  toCountry: string;
  toCity: string;
  specialNotes: string;
}
