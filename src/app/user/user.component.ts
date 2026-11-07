import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ReportService } from '../report.service';
import Swal from 'sweetalert2';
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

  // Csak a bejelentkezett lakó saját bejelentései (az e-mail cím azonosítja)
  protected readonly myReports = computed(() =>
    this.reportService.reports().filter(r => r.reporter === this.auth.user()?.email),
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

      Swal.fire({
        title: 'Hiányzó adatok!',
        text: 'Kérlek töltsd ki az összes mezőt, és győződj meg róla, hogy a leírás legalább 10 karakter hosszú.',
        icon: 'warning',
        confirmButtonText: 'Rendben',
      })
      return;
    }
    const reporter = this.auth.user()?.email;
    if (!reporter){
      Swal.fire({
        title: 'Hiba!',
        text: 'A bejelentkezéshez regisztráció szükséges!',
        icon: 'error',
        confirmButtonText: 'Rendben',
      });
      return;
    }
    this.reportService.add(this.form.getRawValue(), reporter);
    this.form.reset();
    this.sent.set(true);

    Swal.fire({
      title: 'Sikeres bejelentés!',
      text: 'A bejelentését sikeresen rögzítettük.',
      icon: 'success',
      confirmButtonText: 'Rendben',
      confirmButtonColor: '#3085d6'
    });
  }
}