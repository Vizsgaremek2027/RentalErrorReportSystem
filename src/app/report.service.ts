import { Injectable, signal } from '@angular/core';

export type Status = 'Beküldve' | 'Folyamatban' | 'Megoldva';

export interface Report {
  id: number;
  title: string;
  category: string;
  description: string;
  reporter: string;
  status: Status;
}

const STORAGE_KEY = 'rers_reports';

@Injectable({ providedIn: 'root' })
export class ReportService {
  readonly categories = ['Vízvezeték', 'Villany', 'Fűtés', 'Lift', 'Közös terület', 'Egyéb'];
  readonly statuses: Status[] = ['Beküldve', 'Folyamatban', 'Megoldva'];

  private readonly _reports = signal<Report[]>(this.load());
  readonly reports = this._reports.asReadonly();

  add(data: { title: string; category: string; description: string }, reporter: string): void {
    const list = this._reports();
    const id = list.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    this.update([...list, { id, ...data, reporter, status: 'Beküldve' }]);
  }

  setStatus(id: number, status: Status): void {
    this.update(this._reports().map(r => (r.id === id ? { ...r, status } : r)));
  }

  private update(list: Report[]): void {
    this._reports.set(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ha a tárolás nem elérhető, a lista csak az oldal frissítéséig él
    }
  }

  private load(): Report[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Report[]) : [];
    } catch {
      return [];
    }
  }
}