import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Product } from "../models/product.model";
import { ApiService } from "./api.service";


@Injectable({ providedIn: 'root' })
export class ProductsService extends ApiService {
    constructor() {
        super();
        this.endpoint = 'product';
    }

    getAll(): Observable<Product[]> {
        return this.http.get<Product[]>(this.getApiUrl());
    }

    getById(id: string): Observable<Product> {
        return this.http.get<Product>(`${this.getApiUrl()}/${id}`);
    }

    create(product: Product): Observable<Product> {
        return this.http.post<Product>(this.getApiUrl(), product);
    }

    update(id: string, product: Product): Observable<Product> {
        return this.http.put<Product>(`${this.getApiUrl()}/${id}`, product);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.getApiUrl()}/${id}`);
    }

}