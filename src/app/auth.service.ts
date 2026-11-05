import { Injectable, computed, signal } from '@angular/core';

export type Role = 'user' | 'admin';
export interface User { name: string; role: Role; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'admin');

  login(email: string, password: string): boolean {
    if (!email || !password) return false;
    const role: Role = email === 'admin@rers.hu' ? 'admin' : 'user';
    this._user.set({ name: email, role });
    return true;
  }

  logout(): void {
    this._user.set(null);
  }
}