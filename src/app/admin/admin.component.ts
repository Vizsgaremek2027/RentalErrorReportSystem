import { Component, inject } from '@angular/core';
import { ReportService, Status } from '../report.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent {
  protected readonly reportService = inject(ReportService);

  protected onStatusChange(id: number, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as Status;
    this.reportService.setStatus(id, status);
  }
}