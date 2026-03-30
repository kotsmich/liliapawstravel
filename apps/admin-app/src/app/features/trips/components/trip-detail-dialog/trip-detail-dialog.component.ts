import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { AccordionModule } from 'primeng/accordion';
import { Trip, Dog, TripRequest } from '@myorg/models';

@Component({
  selector: 'app-trip-detail-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DialogModule, ButtonModule, TagModule, TableModule, TabsModule, AccordionModule],
  templateUrl: './trip-detail-dialog.component.html',
  styleUrls: ['./trip-detail-dialog.component.scss'],
})
export class TripDetailDialogComponent {
  @Input() visible = false;
  @Input() header = 'Trip Details';
  @Input() trip: Trip | null = null;
  @Input() requests: TripRequest[] = [];
  @Input() activeTab = 'dogs';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() tabChanged = new EventEmitter<string>();
  @Output() editDog = new EventEmitter<{ dog: Dog; tripId: string }>();
  @Output() approveRequest = new EventEmitter<TripRequest>();
  @Output() rejectRequest = new EventEmitter<TripRequest>();
  @Output() deleteRequest = new EventEmitter<TripRequest>();
  @Output() closed = new EventEmitter<void>();

  onHide(): void {
    this.visibleChange.emit(false);
    this.closed.emit();
  }

  requestStatusSeverity(status: TripRequest['status']): 'warn' | 'success' | 'danger' | 'secondary' {
    if (status === 'pending') return 'warn';
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'danger';
    return 'secondary';
  }
}
