import { Component, HostListener, inject, signal } from '@angular/core';
import { ReportService, Status } from '../report.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent {
  protected readonly reportService = inject(ReportService);

  private readonly IMG_KEY = 'rental-error-report-images-by-id';

  protected viewer = signal<{ images: string[]; index: number } | null>(null);

  protected onStatusChange(id: number, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as Status;
    this.reportService.setStatus(id, status);
  }

  protected imagesFor(id: string | number): string[] {
    try {
      const raw = localStorage.getItem(this.IMG_KEY);
      const map: Record<string, string[]> = raw ? JSON.parse(raw) : {};
      return map[String(id)] ?? [];
    } catch {
      return [];
    }
  }

  protected displayName(reporter: string): string {
    return reporter?.includes('@') ? reporter.split('@')[0] : reporter;
  }

  protected openViewer(id: string | number): void {
    const images = this.imagesFor(id);
    if (images.length) this.viewer.set({ images, index: 0 });
  }

  protected closeViewer(): void {
    this.viewer.set(null);
  }

  protected next(): void {
    const v = this.viewer();
    if (v) this.viewer.set({ ...v, index: (v.index + 1) % v.images.length });
  }

  protected prev(): void {
    const v = this.viewer();
    if (v) this.viewer.set({ ...v, index: (v.index - 1 + v.images.length) % v.images.length });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeViewer();
  }
}