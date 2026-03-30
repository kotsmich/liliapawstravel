import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TripRequest } from '@myorg/models';

@Component({
  selector: 'app-requests-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, TableModule, TagModule, ButtonModule, BadgeModule],
  template: `
    <p-table
      [value]="requests"
      [loading]="loading"
      [rowHover]="true"
      sortField="submittedAt"
      [sortOrder]="-1"
      styleClass="p-datatable-sm"
      [tableStyle]="{ 'min-width': '60rem' }"
      >
      <ng-template pTemplate="header">
        <tr>
          <th pSortableColumn="requesterName">
            Requester <p-sortIcon field="requesterName" />
          </th>
          <th pSortableColumn="dogsCount">
            Dogs <p-sortIcon field="dogsCount" />
          </th>
          <th pSortableColumn="status">
            Status <p-sortIcon field="status" />
          </th>
          <th pSortableColumn="submittedAt">
            Submitted <p-sortIcon field="submittedAt" />
          </th>
          <th>Actions</th>
        </tr>
      </ng-template>
    
      <ng-template pTemplate="body" let-req>
        <tr style="cursor:pointer" (click)="rowClicked.emit(req)">
          <td>{{ req.requesterName }}</td>
          <td>
            <p-badge [value]="req.dogsCount.toString()" severity="secondary" />
          </td>
          <td>
            <p-tag [value]="req.status" [severity]="statusSeverity(req.status)" />
          </td>
          <td>{{ req.submittedAt | date:'dd/MM/yyyy HH:mm' }}</td>
          <td (click)="$event.stopPropagation()">
            <div class="row-actions flex align-items-center gap-1">
              <p-button
                icon="pi pi-eye"
                label="View"
                [text]="true"
                size="small"
                (onClick)="rowClicked.emit(req)"
                />
              @if (req.status === 'pending') {
                <p-button
                  icon="pi pi-check"
                  label="Approve"
                  [text]="true"
                  size="small"
                  severity="success"
                  (onClick)="approve.emit(req)"
                  />
              }
              @if (req.status === 'pending') {
                <p-button
                  icon="pi pi-times"
                  label="Reject"
                  [text]="true"
                  size="small"
                  severity="danger"
                  (onClick)="reject.emit(req)"
                  />
              }
              @if (req.status !== 'pending') {
                <p-button
                  icon="pi pi-trash"
                  label="Delete"
                  [text]="true"
                  size="small"
                  severity="danger"
                  (onClick)="deleteRequest.emit(req)"
                  />
              }
            </div>
          </td>
        </tr>
      </ng-template>
    
      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="5" style="text-align:center">No requests found.</td>
        </tr>
      </ng-template>
    </p-table>
    `,
  styles: [],
})
export class RequestsTableComponent {
  @Input() requests: Array<TripRequest & { dogsCount: number }> = [];
  @Input() loading: boolean = false;

  @Output() rowClicked = new EventEmitter<TripRequest>();
  @Output() approve = new EventEmitter<TripRequest>();
  @Output() reject = new EventEmitter<TripRequest>();
  @Output() deleteRequest = new EventEmitter<TripRequest>();

  statusSeverity(status: TripRequest['status']): 'warn' | 'success' | 'danger' | 'secondary' {
    if (status === 'pending') return 'warn';
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'danger';
    return 'secondary';
  }
}
