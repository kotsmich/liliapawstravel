export type DogHeight = 'under10' | '10to25' | 'over30';
export type DogBehavior = 'friendly' | 'aggressive' | 'fearful' | 'anxious' | 'calm';

export interface Dog {
  id: string;
  name: string;
  size: 'small' | 'medium' | 'large';
  height?: DogHeight | null;
  behaviors?: DogBehavior[] | null;
  gender: 'male' | 'female';
  age: number;
  chipId: string;
  pickupLocation: string;
  dropLocation: string;
  notes: string;
  photoUrl?: string | null;
  documentUrl?: string | null;
  documentType?: string | null;
  requesterId?: string | null;
  destinationId?: string | null;
  pickupLocationId?: string | null;
  receiver?: string | null;
  receiverPhone?: string | null;
  /** Transient — used only when creating a dog with a brand-new requester. Not stored on the dog. */
  newRequesterName?: string | null;
}
