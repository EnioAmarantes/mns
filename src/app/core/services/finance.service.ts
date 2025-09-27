import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { FinanceEntry } from "../models/finance.model";
import { ApiService } from "./api.service";

@Injectable({providedIn: 'root'})
export class FinanceService extends ApiService {
    constructor() {
        super();
        this.endpoint = 'finance';
    }

    getAll(): Observable<FinanceEntry[]> {
        return this.http.get<FinanceEntry[]>(this.getApiUrl());
    }

    getPendencies(): Observable<FinanceEntry[]> {
        return this.http.get<FinanceEntry[]>(`${this.getApiUrl()}/pendencias`);
    }

    getPagos(): Observable<FinanceEntry[]> {
        return this.http.get<FinanceEntry[]>(`${this.getApiUrl()}/pagos`);
    }

    create(entry: FinanceEntry): Observable<FinanceEntry> {
        return this.http.post<FinanceEntry>(this.getApiUrl(), entry);
    }

    update(id: string, entry: FinanceEntry): Observable<FinanceEntry> {
        return this.http.put<FinanceEntry>(`${this.getApiUrl()}/${id}`, entry);
    }

    delete(id: string) {
        return this.http.delete(`${this.getApiUrl()}/${id}`);
    }
}