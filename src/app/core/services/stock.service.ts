import { Injectable } from "@angular/core";
import { StockBalance, StockEntry } from "../models/stock.model";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";

@Injectable({providedIn: 'root'})
export class StockService extends ApiService {
    constructor() {
        super();
        this.endpoint = 'stock';
    }

    getAll(): Observable<StockEntry[]> {
        return this.http.get<StockEntry[]>(this.getApiUrl());
    }

    getById(id: number): Observable<StockEntry> {
        return this.http.get<StockEntry>(`${this.getApiUrl()}/${id}`);
    }

    create(entry: StockEntry): Observable<StockEntry> {
        return this.http.post<StockEntry>(this.getApiUrl(), entry);
    }

    update(id: number, entry: StockEntry): Observable<StockEntry> {
        return this.http.put<StockEntry>(`${this.getApiUrl()}/${id}`, entry);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.getApiUrl()}/${id}`);
    }

    balances(): Observable<StockBalance[]> {
        return this.http.get<StockBalance[]>(`${this.getApiUrl()}/balances`);
    }
}