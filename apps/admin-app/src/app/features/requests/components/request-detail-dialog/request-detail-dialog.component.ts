import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { TripRequest, Trip } from '@myorg/models';

@Component({
  selector: 'app-request-detail-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, DialogModule, ButtonModule, TagModule, TableModule],
  template: `
    <p-dialog
      header="Request Details"
      [visible]="visible"
      (visibleChange)="visibleChange.emit($event)"
      [modal]="true"
      [style]="{ width: '600px' }"
      [draggable]="false"
      >
      @if (request; as req) {
        <p class="request-summary">
          Request for trip <strong>{{ tripDate(req.tripId) }}</strong>
          under requester <strong>{{ req.requesterName }}</strong>
        </p>
        <div class="detail-section">
          <h3>Requester</h3>
          <p class="flex align-items-center gap-2"><i class="pi pi-user"></i> {{ req.requesterName }}</p>
          <p class="flex align-items-center gap-2"><i class="pi pi-envelope"></i> {{ req.requesterEmail }}</p>
          <p class="flex align-items-center gap-2"><i class="pi pi-phone"></i> {{ req.requesterPhone }}</p>
        </div>
        <div class="detail-section">
          <h3>Trip</h3>
          <p class="flex align-items-center gap-2"><i class="pi pi-calendar"></i> <strong>{{ tripDate(req.tripId) }}</strong></p>
          <p>Submitted: {{ req.submittedAt | date:'dd/MM/yyyy HH:mm' }}</p>
          <p>Status: <p-tag [value]="req.status" [severity]="statusSeverity(req.status)" /></p>
        </div>
        <div class="detail-section">
          <h3>Dogs ({{ req.dogs.length }})</h3>
          <p-table [value]="req.dogs" styleClass="p-datatable-sm" [tableStyle]="{ 'min-width': '100%' }">
            <ng-template pTemplate="header">
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Age</th>
                <th>Chip ID</th>
                <th>Pickup</th>
                <th>Drop</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-dog>
              <tr>
                <td>{{ dog.name }}</td>
                <td>{{ dog.size }}</td>
                <td>{{ dog.age }} yr</td>
                <td>{{ dog.chipId }}</td>
                <td>{{ dog.pickupLocation }}</td>
                <td>{{ dog.dropLocation }}</td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      }
    
      <ng-template pTemplate="footer">
        <p-button
          label="Approve"
          icon="pi pi-check"
          severity="success"
          [disabled]="request?.status !== 'pending'"
          (onClick)="approve.emit()"
          />
        <p-button
          label="Reject"
          icon="pi pi-times"
          severity="danger"
          [outlined]="true"
          [disabled]="request?.status !== 'pending'"
          (onClick)="reject.emit()"
          />
        @if (request?.status !== 'pending') {
          <p-button
            label="Delete"
            icon="pi pi-trash"
            severity="danger"
            (onClick)="deleteRequest.emit(request!)"
            />
        }
        <p-button
          label="Cancel"
          icon="pi pi-arrow-left"
          severity="secondary"
          [outlined]="true"
          (onClick)="cancel.emit()"
          />
      </ng-template>
    </p-dialog>
    `,
  styles: [],
})
export class RequestDetailDialogComponent {
  @Input() visible: boolean = false;
  @Input() request: TripRequest | null = null;
  @Input() trips: Trip[] = [];

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() approve = new EventEmitter<void>();
  @Output() reject = new EventEmitter<void>();
  @Output() deleteRequest = new EventEmitter<TripRequest>();
  @Output() cancel = new EventEmitter<void>();

  statusSeverity(status: TripRequest['status']): 'warn' | 'success' | 'danger' | 'secondary' {
    if (status === 'pending') return 'warn';
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'danger';
    return 'secondary';
  }

  fmtDate(date: string): string {
    if (!date) return '—';
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }

  tripDate(tripId: string | undefined): string {
    if (!tripId) return '—';
    const trip = this.trips.find((t) => t.id === tripId);
    return trip ? this.fmtDate(trip.date) : tripId;
  }
}
