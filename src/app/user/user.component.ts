import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ReportService } from '../report.service';

@Component({
  selector: 'app-user',
  imports: [ReactiveFormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
})
export class UserComponent {
  auth = inject(AuthService);
  reportService = inject(ReportService);
  private fb = inject(FormBuilder);

  sent = signal(false);

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    category: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
  });

  myReports = () =>
    this.reportService.reports().filter(r => r.reporter === this.auth.user()?.name);

  private readonly IMG_KEY = 'rental-error-report-images-by-id';

  previews = signal<string[]>([]);
  uploadError = signal('');
  private imageMap = signal<Record<string, string[]>>(this.loadImageMap());

  imagesFor(id: string | number): string[] {
    return this.imageMap()[String(id)] ?? [];
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];

    this.uploadError.set('');

    const valid = files.filter(f => f.type.startsWith('image/'));
    if (valid.length !== files.length) {
      this.uploadError.set('Csak képfájlokat lehet csatolni.');
    }

    try {
      this.previews.set(await Promise.all(valid.map(f => this.resizeImage(f))));
    } catch {
      this.uploadError.set('Nem sikerült beolvasni a képet.');
    }
  }

  removePreview(index: number, fileInput: HTMLInputElement) {
    const left = this.previews().filter((_, i) => i !== index);
    this.previews.set(left);
    if (!left.length) fileInput.value = '';
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const before = new Set(this.myReports().map(r => String(r.id)));

    this.reportService.add(this.form.getRawValue(), this.auth.user()?.name ?? '');

    const created = this.myReports().find(r => !before.has(String(r.id)));

    if (created && this.previews().length) {
      this.saveImages(String(created.id), this.previews());
    }

    this.form.reset({ title: '', category: '', description: '' });
    this.previews.set([]);
    this.uploadError.set('');
    const fileEl = document.getElementById('images') as HTMLInputElement | null;
    if (fileEl) fileEl.value = '';
    this.sent.set(true);
  }

  private saveImages(id: string, images: string[]) {
    const updated = { ...this.imageMap(), [id]: images };
    try {
      localStorage.setItem(this.IMG_KEY, JSON.stringify(updated));
      this.imageMap.set(updated);
    } catch {
      this.uploadError.set('A bejelentés elment, de a képek nem fértek el a böngésző tárolójában.');
    }
  }

  private loadImageMap(): Record<string, string[]> {
    try {
      const raw = localStorage.getItem(this.IMG_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private resizeImage(file: File, maxSize = 800): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Hibás kép'));
        img.onload = () => {
          const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }
}