export interface Dog {
  id: string;
  name: string;
  size: 'small' | 'medium' | 'large';
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
  /** Transient — used only when creating a dog with a brand-new requester. Not stored on the dog. */
  newRequesterName?: string | null;
}
