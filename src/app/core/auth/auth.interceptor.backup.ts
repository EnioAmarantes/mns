// Backup do interceptor original para referência futura
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);
    const platformId = inject(PLATFORM_ID);

    if (isPlatformBrowser(platformId) && auth.isAuthenticated() && auth.getToken()) {
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
