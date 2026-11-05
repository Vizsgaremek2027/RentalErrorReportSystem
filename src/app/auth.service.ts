import { Injectable, computed, signal } from '@angular/core';

export type Role = 'user' | 'admin';
export interface User { name: string; role: Role; }

const STORAGE_KEY = 'rers_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<User | null>(this.load());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'admin');

  // IDEIGLENES: később a Laravel API válasza dönti el a szerepkört
  login(email: string, password: string): User | null {
    if (!email || !password) return null;
    const role: Role = email === 'admin@rers.hu' ? 'admin' : 'user';
    const user: User = { name: email, role };
    this._user.set(user);
    this.save(user);
    return user;
  }

  logout(): void {
    this._user.set(null);
    this.save(null);
  }

  // Hova kerüljön a felhasználó belépés után
  homeUrl(): string {
    const user = this._user();
    if (!user) return '/home';
    return user.role === 'admin' ? '/admin' : '/user';
  }

  private load(): User | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  private save(user: User | null): void {
    try {
      if (user) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ha a tárolás nem elérhető, a belépés csak az oldal frissítéséig él
    }
  }
}