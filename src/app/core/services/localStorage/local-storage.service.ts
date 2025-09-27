import { Inject, Injectable, signal } from '@angular/core';

@Injectable({providedIn: 'root'})
export class LocalStorageService<T> {
    private state = signal<T[]>([]);

    constructor(@Inject(String) private key: string) {
        this.load();
    }

    private load() {
        const data = localStorage.getItem(this.key);
        if (data) {
            this.state.set(JSON.parse(data));
        }
    }

    private save() {
        localStorage.setItem(this.key, JSON.stringify(this.state()));
    }

    getAll() {
        return [...this.state()];
    }

    add(item: T) {
        this.state.update(list => {
            const updated = [...list, item];
            localStorage.setItem(this.key, JSON.stringify(updated));
            return updated;
        });
    }

    update(id: number, newItem: T) {
        this.state.update(list => {
            const updated = list.map((item: any) => item.id === id ? newItem : item);
            localStorage.setItem(this.key, JSON.stringify(updated));
            return updated;
        });
    }

    delete(id: number) {
        this.state.update(list => {
            const updated = list.filter((item: any) => item.id !== id);
            localStorage.setItem(this.key, JSON.stringify(updated));
            return updated;
        });
    }

}