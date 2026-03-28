import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TripRequestActions, selectAllRequests, selectRequestsIsLoading } from '@myorg/store';
import { TripRequest } from '@myorg/models';

@Component({
  selector: 'app-requests-list',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, DialogModule, ButtonModule, ToastModule],
  templateUrl: './requests-list.component.html',
  styleUrls: ['./requests-list.component.scss'],
})
export class RequestsListComponent implements OnInit {
  private store = inject(Store);
  private messageService = inject(MessageService);

  requests$ = this.store.select(selectAllRequests);
  loading$ = this.store.select(selectRequestsIsLoading);
  selectedRequest: TripRequest | null = null;
  dialogVisible = false;

  ngOnInit(): void {
    this.store.dispatch(TripRequestActions.loadRequests());
  }

  openDetail(request: TripRequest): void {
    this.selectedRequest = request;
    this.dialogVisible = true;
  }

  approve(): void {
    if (!this.selectedRequest?.tripId) return;
    // approveRequest effect also dispatches loadTripById so trip cards update automatically.
    this.store.dispatch(TripRequestActions.approveRequest({
      requestId: this.selectedRequest.id,
      tripId: this.selectedRequest.tripId,
    }));
    this.messageService.add({ severity: 'success', summary: 'Approved', detail: 'Request confirmed. Trip dogs updated.' });
    this.dialogVisible = false;
  }

  reject(): void {
    if (!this.selectedRequest) return;
    this.store.dispatch(TripRequestActions.updateRequestStatus({
      id: this.selectedRequest.id,
      status: 'completed',
    }));
    this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Request marked as completed.' });
    this.dialogVisible = false;
  }

  statusSeverity(status: TripRequest['status']): 'warn' | 'success' | 'secondary' {
    return status === 'pending' ? 'warn' : status === 'confirmed' ? 'success' : 'secondary';
  }
}
