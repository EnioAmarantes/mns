import { Injectable } from "@angular/core";
import { Warehouse } from "../models/warehouse.model";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";

@Injectable({providedIn: 'root'})
export class WarehousesService extends ApiService {
    constructor() {
        super();
        this.endpoint = 'warehouse';
    }

    getAll(): Observable<Warehouse[]> {
        return this.http.get<Warehouse[]>(this.getApiUrl());
    }

    getById(id: string): Observable<Warehouse> {
        return this.http.get<Warehouse>(`${this.getApiUrl()}/${id}`);
    }

    create(warehouse: any): Observable<Warehouse> {
        return this.http.post<Warehouse>(this.getApiUrl(), warehouse);
    }

    update(id: string, warehouse: any): Observable<Warehouse> {
        return this.http.put<Warehouse>(`${this.getApiUrl()}/${id}`, warehouse);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.getApiUrl()}/${id}`);
    }

}