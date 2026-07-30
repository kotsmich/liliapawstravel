export interface TripResultPhoto {
  id: string;
  url: string;
  sortOrder: number;
}

/** A completed trip published as a public photo gallery. */
export interface TripResult {
  id: string;
  date: string;
  departureCity: string;
  arrivalCity: string;
  photos: TripResultPhoto[];
  photoCount: number;
  coverPhotoUrl: string | null;
}

export interface TripResultPayload {
  date: string;
  departureCity: string;
  arrivalCity: string;
}
