import { Injectable } from "@angular/core";
import { Supplier } from "../models/supplier.model";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";

@Injectable({ providedIn: 'root' })
export class SuppliersService extends ApiService {
    constructor() {
        super();
        this.endpoint = 'supplier';
    }

    getAll(): Observable<Supplier[]> {
        return this.http.get<Supplier[]>(this.getApiUrl());
    }

    getById(id: string): Observable<Supplier> {
        return this.http.get<Supplier>(`${this.getApiUrl()}/${id}`);
    }

    create(supplier: Supplier): Observable<Supplier> {
        return this.http.post<Supplier>(this.getApiUrl(), supplier);
    }

    update(id: string, supplier: Supplier): Observable<Supplier> {
        return this.http.put<Supplier>(`${this.getApiUrl()}/${id}`, supplier);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.getApiUrl()}/${id}`);
    }
}