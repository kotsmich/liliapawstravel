import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Dog } from '@models/lib/dog.model';
import { requesterRequiredValidator } from '@admin/shared/validators/requester-required.validator';

/** Form group used by DogManagerService.setDogs to mirror existing dogs in the FormArray. */
export function dogGroup(dog?: Partial<Dog>): FormGroup {
  return new FormGroup({
    id:               new FormControl(dog?.id               ?? ''),
    name:             new FormControl(dog?.name             ?? ''),
    size:             new FormControl(dog?.size             ?? ''),
    height:           new FormControl(dog?.height           ?? null),
    behaviors:        new FormControl(dog?.behaviors        ?? []),
    gender:           new FormControl(dog?.gender           ?? ''),
    age:              new FormControl(dog?.age              ?? 1),
    chipId:           new FormControl(dog?.chipId           ?? ''),
    pickupLocation:   new FormControl(dog?.pickupLocation   ?? ''),
    pickupLocationId: new FormControl(dog?.pickupLocationId ?? null),
    dropLocation:     new FormControl(dog?.dropLocation     ?? ''),
    notes:            new FormControl(dog?.notes            ?? ''),
    requesterId:      new FormControl(dog?.requesterId      ?? null),
    photoUrl:         new FormControl(dog?.photoUrl         ?? null),
    documentUrl:      new FormControl(dog?.documentUrl      ?? null),
    destinationId:    new FormControl(dog?.destinationId    ?? null),
    receiver:         new FormControl(dog?.receiver         ?? null),
    receiverPhone:    new FormControl(dog?.receiverPhone    ?? null),
  });
}

/** Form group for the dialog's add mode — no requester fields (requester is set at the batch level). */
export function buildAddDogGroup(index: number): FormGroup {
  return new FormGroup({
    name:             new FormControl(`Dog ${index}`, Validators.required),
    size:             new FormControl(null),
    height:           new FormControl(null),
    behaviors:        new FormControl([] as string[]),
    gender:           new FormControl(null),
    age:              new FormControl(null, Validators.min(0)),
    chipId:           new FormControl(null),
    pickupLocation:   new FormControl(''),
    pickupLocationId: new FormControl(null),
    dropLocation:     new FormControl(''),
    notes:            new FormControl(''),
    destinationId:    new FormControl(null),
    receiver:         new FormControl(null),
    receiverPhone:    new FormControl(null),
  });
}

/** Form group for the dialog's edit mode — includes requester fields and the requester validator. */
export function buildEditDogGroup(d: Dog): FormGroup {
  return new FormGroup({
    name:             new FormControl(d.name, Validators.required),
    size:             new FormControl(d.size),
    height:           new FormControl(d.height            ?? null),
    behaviors:        new FormControl(d.behaviors         ?? []),
    gender:           new FormControl(d.gender),
    age:              new FormControl(d.age, Validators.min(0)),
    chipId:           new FormControl(d.chipId),
    pickupLocation:   new FormControl(d.pickupLocation    ?? ''),
    pickupLocationId: new FormControl(d.pickupLocationId  ?? null),
    dropLocation:     new FormControl(d.dropLocation      ?? ''),
    notes:            new FormControl(d.notes             ?? ''),
    requesterId:      new FormControl(d.requesterId       ?? null),
    requesterKey:     new FormControl(d.requesterId       ?? null),
    newRequesterName: new FormControl(null),
    destinationId:    new FormControl(d.destinationId     ?? null),
    receiver:         new FormControl(d.receiver          ?? null),
    receiverPhone:    new FormControl(d.receiverPhone     ?? null),
  }, { validators: requesterRequiredValidator });
}
