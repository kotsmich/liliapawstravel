import { Injectable, signal } from '@angular/core';
import { Dog } from '@models/lib/dog.model';

type IndexedDog = Dog & { _idx: number };

/**
 * Tracks selected dogs across the dogs table and the per-group tables.
 * When `groupKey` is provided, selections are kept per-group and the public
 * `selectedDogs` signal flattens all groups; otherwise it reflects a single
 * unified table selection.
 */
@Injectable()
export class DogSelectionStore {
  readonly selectedDogs = signal<IndexedDog[]>([]);

  private readonly selectionsByGroup = new Map<string, IndexedDog[]>();

  onSelectionChange(dogs: IndexedDog[], groupKey?: string): void {
    if (groupKey !== undefined) {
      this.selectionsByGroup.set(groupKey, dogs);
      this.selectedDogs.set(Array.from(this.selectionsByGroup.values()).flat());
    } else {
      this.selectedDogs.set(dogs);
      this.selectionsByGroup.clear();
    }
  }

  clearGroupSelections(): void {
    this.selectionsByGroup.clear();
    this.selectedDogs.set([]);
  }
}
