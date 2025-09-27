import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, PLATFORM_ID } from "@angular/core";
import { environment } from "../../../environments/environment";
import { isPlatformBrowser } from "@angular/common";

export abstract class ApiService {
    protected http = inject(HttpClient);
    protected environment = environment;
    protected endpoint = '';
    protected platformId = inject(PLATFORM_ID);
    protected getApiUrl(): string {
        return `${this.environment.apiUrl}/api/${this.endpoint}`;
    }
}