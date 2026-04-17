export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const RandomUtil = {
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  },
};

export const RandomProperty = {
  dogNames:        ['Bella', 'Max', 'Luna', 'Rocky', 'Milo', 'Daisy', 'Buddy', 'Coco', 'Loki', 'Zeus', 'Charlie', 'Molly', 'Bear', 'Stella', 'Duke', 'Rosie', 'Rex', 'Penny', 'Archie', 'Nala', 'Finn', 'Maggie', 'Gus', 'Zoe', 'Bruno'],
  sizes:           ['small', 'medium', 'large'] as Array<'small' | 'medium' | 'large'>,
  genders:         ['male', 'female'] as Array<'male' | 'female'>,
  ages:            [1, 2, 3, 4, 5, 6, 7],
  chipIds:         ['111111111111111', '222222222222222', '333333333333333', '444444444444444', '555555555555555'],
  pickupLocations: ['Thessaloniki', 'Athens', 'Bucharest', 'Sofia', 'Belgrade', 'Skopje'],
  dropLocations:   ['Vienna', 'Amsterdam', 'Berlin', 'Munich', 'Hamburg', 'Utrecht'],
  notes:           ['Friendly dog', 'Needs medication', 'Shy around strangers', 'Good with kids', 'Loves car rides', ''],
  requesterNames:  ['Maria', 'Dimitra', 'Nikos', 'Elena', 'Kostas', 'Anna', 'Giorgos', 'Sofia', 'Petros', 'Ioanna', 'Thanasis', 'Christina', 'Vasilis', 'Katerina', 'Alexandros'],
  requesterEmails: ['τεσττεστ1122@gmail.com'],
  requesterPhones: ['+30 6901234567', '+30 6912345678', '+30 6923456789', '+40 7123456789'],
};
