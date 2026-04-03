import { Component, Output, EventEmitter, ChangeDetectionStrategy, signal, inject, DestroyRef, OnInit } from '@angular/core';
import { interval, Subject, merge, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent implements OnInit {
  @Output() requestClicked = new EventEmitter<void>();
  @Output() contactClicked = new EventEmitter<void>();

  private destroyRef = inject(DestroyRef);
  private userAction$ = new Subject<void>();

  current = signal(0);

  slides = [
    { bg: '#f5dfc0', emoji: '🐕', label: 'hero.slides.goldenHeading' },
    { bg: '#d4e8c2', emoji: '🐶', label: 'hero.slides.rescueReady' },
    { bg: '#c8dff0', emoji: '🐩', label: 'hero.slides.safeInTransit' },
    { bg: '#f0d0c8', emoji: '🦮', label: 'hero.slides.adoptedWithLove' },
    { bg: '#e8d4f0', emoji: '🐾', label: 'hero.slides.everyPawMatters' },
    { bg: '#d0eee8', emoji: '🐕‍🦺', label: 'hero.slides.serviceDogDelivered' },
    { bg: '#fce4d4', emoji: '🐈', label: 'hero.slides.smallPassengers' },
    { bg: '#e4f0d0', emoji: '❤️', label: 'hero.slides.reunitedWithFamily' },
    { bg: '#f5dfc0', emoji: '🐕', label: 'hero.slides.goldenHeading' },
    { bg: '#d4e8c2', emoji: '🐶', label: 'hero.slides.rescueReady' },
    { bg: '#c8dff0', emoji: '🐩', label: 'hero.slides.safeInTransit' },
    { bg: '#f0d0c8', emoji: '🦮', label: 'hero.slides.adoptedWithLove' },
    { bg: '#e8d4f0', emoji: '🐾', label: 'hero.slides.everyPawMatters' },
    { bg: '#d0eee8', emoji: '🐕‍🦺', label: 'hero.slides.serviceDogDelivered' },
    { bg: '#fce4d4', emoji: '🐈', label: 'hero.slides.smallPassengers' },
    { bg: '#e4f0d0', emoji: '❤️', label: 'hero.slides.reunitedWithFamily' },
  ];

  ngOnInit(): void {
    merge(of(null), this.userAction$).pipe(
      switchMap(() => interval(3500)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.current.update(c => (c + 1) % this.slides.length);
    });
  }

  prev(): void {
    this.current.update(c => (c - 1 + this.slides.length) % this.slides.length);
    this.userAction$.next();
  }

  next(): void {
    this.current.update(c => (c + 1) % this.slides.length);
    this.userAction$.next();
  }

  goTo(i: number): void {
    this.current.set(i);
    this.userAction$.next();
  }
}
