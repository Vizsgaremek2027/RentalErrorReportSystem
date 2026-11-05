import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ReportService } from '../report.service';

@Component({
  selector: 'app-user',
  imports: [ReactiveFormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
})
export class UserComponent {
  protected readonly auth = inject(AuthService);
  protected readonly reportService = inject(ReportService);
  private readonly fb = inject(NonNullableFormBuilder);

  // Csak a bejelentkezett lakó saját bejelentései
  protected readonly myReports = computed(() =>
    this.reportService.reports().filter(r => r.reporter === this.auth.user()?.name),
  );

  protected readonly sent = signal(false);

  protected readonly form = this.fb.group({
    title: ['', [Validators.required]],
    category: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(10)]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const reporter = this.auth.user()?.name;
    if (!reporter) return;
    this.reportService.add(this.form.getRawValue(), reporter);
    this.form.reset();
    this.sent.set(true);
  }
}