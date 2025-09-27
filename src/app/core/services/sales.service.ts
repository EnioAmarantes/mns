import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Sale } from "../models/sale.model";
import { ApiService } from "./api.service";

@Injectable({ providedIn: 'root' })
export class SalesService extends ApiService {
    constructor() {
        super();
        this.endpoint = 'sale';
    }

    getAll(): Observable<Sale[]> {
        return this.http.get<Sale[]>(this.getApiUrl());
    }
    getById(id: string): Observable<Sale> {
        return this.http.get<Sale>(`${this.getApiUrl()}/${id}`);
    }
    create(sale: Sale): Observable<Sale> {
        return this.http.post<Sale>(this.getApiUrl(), sale);
    }
    update(id: string, sale: Sale): Observable<Sale> {
        return this.http.put<Sale>(`${this.getApiUrl()}/${id}`, sale);
    }
    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.getApiUrl()}/${id}`);
    }
}