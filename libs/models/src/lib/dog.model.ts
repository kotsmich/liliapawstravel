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
  requesterName?: string | null;
  requesterEmail?: string | null;
  requesterPhone?: string | null;
  requestId?: string | null;
  destinationId?: string | null;
  receiver?: string | null;
  /** Transient — used only when creating a dog with a new admin requester. Not stored on the dog entity. */
  newRequesterName?: string | null;
}
