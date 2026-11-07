import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected readonly error = signal('');

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire({
        title: 'Hiba!',
        text: 'Hibás e-mail cím vagy jelszó. Kérlek, ellenőrizd az adatokat és próbáld újra.',
        icon: 'error',
        confirmButtonText: 'Rendben',
      })
      return;
    }
    const { email, password } = this.form.getRawValue();
    if (this.auth.login(email, password)) {
      this.router.navigate([this.auth.homeUrl()]);
    } else {
      this.error.set('Hibás e-mail cím vagy jelszó.');
    }
  }
}