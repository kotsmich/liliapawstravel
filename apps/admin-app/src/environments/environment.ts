import type { TripDestination } from '@models/lib/trip.model';

export const environment = {
  production: true,
  apiUrl: '/api',
  wsAppUrl: 'wss://api.liliapawstravel.com/ws/app',
  defaultDestinations: [
    { name: 'Μόναχο' },
    { name: 'Στουγκαρδη' },
    { name: 'Καρσλουη' },
    { name: 'Φρανκφούρτη' },
    { name: 'Κολωνια' },
    { name: 'Ντίσελντορφ' },
    { name: 'Ντορτμουντ' },
    { name: 'Ολλανδια' },
    { name: 'Καλαις' },
  ] as TripDestination[],
  defaultPickupLocations: [
    { name: 'Αγιοκαμπος' },
    { name: 'Λάρισα' },
    { name: 'Λιτοχωρο' },
    { name: 'Κατερινη' },
    { name: 'Θεσσαλονίκη' },
    { name: 'Κοζανι' },
    { name: 'Ιωάννινα' },
    { name: 'Ηγουμενιτσα' },
  ] as TripDestination[],
};
