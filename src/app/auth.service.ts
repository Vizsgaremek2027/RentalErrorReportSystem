import { Injectable, computed, signal } from '@angular/core';

export type Role = 'user' | 'admin';
export interface User { name: string; email: string; role: Role; }
interface StoredUser extends User { password: string; }

const SESSION_KEY = 'rers_user';
const USERS_KEY = 'rers_users';

// IDEIGLENES: beépített admin fiók, később a Laravel adatbázisból jön
const ADMIN: StoredUser = {
  name: 'Adminisztrátor',
  email: 'admin@rers.hu',
  password: 'Admin-2026!',
  role: 'admin',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<User | null>(this.loadSession());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'admin');

  // Regisztráció: false, ha az e-mail cím már foglalt
  register(name: string, email: string, password: string): boolean {
    const mail = email.trim().toLowerCase();
    const users = this.loadUsers();
    if (mail === ADMIN.email || users.some(u => u.email === mail)) return false;
    users.push({ name: name.trim(), email: mail, password, role: 'user' });
    this.write(USERS_KEY, users, true);
    return true;
  }

  // Belépés: csak létező fiókkal és helyes jelszóval
  login(email: string, password: string): User | null {
    const mail = email.trim().toLowerCase();
    const found = [ADMIN, ...this.loadUsers()].find(
      u => u.email === mail && u.password === password,
    );
    if (!found) return null;
    const user: User = { name: found.name, email: found.email, role: found.role };
    this._user.set(user);
    this.write(SESSION_KEY, user, false);
    return user;
  }

  logout(): void {
    this._user.set(null);
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* nincs tárolás */ }
  }

  // Hova kerüljön a felhasználó belépés után
  homeUrl(): string {
    const user = this._user();
    if (!user) return '/home';
    return user.role === 'admin' ? '/admin' : '/user';
  }

  private loadSession(): User | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      const user = raw ? (JSON.parse(raw) as User) : null;
      return user?.email ? user : null;
    } catch {
      return null;
    }
  }

  private loadUsers(): StoredUser[] {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? (JSON.parse(raw) as StoredUser[]) : [];
    } catch {
      return [];
    }
  }

  private write(key: string, value: unknown, persistent: boolean): void {
    try {
      (persistent ? localStorage : sessionStorage).setItem(key, JSON.stringify(value));
    } catch {
      // ha a tárolás nem elérhető, az adat csak az oldal frissítéséig él
    }
  }
}