import { Dog } from '@models/lib/dog.model';
import { TripDestination } from '@models/lib/trip.model';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toDogPayload(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formValue: any,
  destinations: TripDestination[],
  pickupLocations: TripDestination[],
): Omit<Dog, 'id'> {
  const { newRequesterName, requesterKey: _rk, ...dogData } = formValue;

  const pickupDest = pickupLocations.find((d) => d.id === dogData.pickupLocationId) ?? null;
  const pickupLocation = pickupLocations.length > 0 ? (pickupDest?.name ?? 'Other') : (dogData.pickupLocation || '');
  const pickupLocationId = pickupDest ? dogData.pickupLocationId : null;

  const dropDest = destinations.find((d) => d.id === dogData.destinationId) ?? null;
  const dropLocation = dropDest ? dropDest.name : dogData.dropLocation;

  return {
    ...dogData,
    pickupLocation,
    pickupLocationId,
    dropLocation,
    ...(newRequesterName?.trim() ? { newRequesterName: newRequesterName.trim() } : {}),
  };
}
