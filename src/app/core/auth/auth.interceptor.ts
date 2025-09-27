// ...existing code...
import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "./auth.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);

    if (auth.isAuthenticated() && auth.getToken()) {
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${auth.getToken()}`,
                'X-Company-Id': auth.getCompanyId() || ''
            }
        });
        return next(authReq);
    }
    return next(req);
};
