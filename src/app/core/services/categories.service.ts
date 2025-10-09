import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { Observable } from "rxjs";
import { Category } from "../models/category.model";

@Injectable({ providedIn: 'root' })
export class CategoriesService extends ApiService {
    constructor() {
        super();
        this.endpoint = 'category';
    }
    
    getAll(): Observable<Category[]> {
        return this.http.get<Category[]>(this.getApiUrl());
    }
    getById(id: string): Observable<Category> {
        return this.http.get<Category>(`${this.getApiUrl()}/${id}`);
    }
    create(category: Category): Observable<Category> {
        return this.http.post<Category>(this.getApiUrl(), category);
    }
    update(id: string, category: Category): Observable<Category> {
        return this.http.put<Category>(`${this.getApiUrl()}/${id}`, category);
    }
    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.getApiUrl()}/${id}`);
    }
}