import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './authService';


/**
 * `AuthInterceptor` è un servizio che implementa l'interfaccia `HttpInterceptor`.
 * Viene utilizzato per intercettare tutte le richieste HTTP effettuate dall'applicazione
 * e aggiungere un'intestazione di autorizzazione (Authorization) se un token è disponibile.
 * 
 * **Funzionalità:**
 * - Recupera il token di autenticazione dal `AuthService`.
 * - Se il token è presente, lo aggiunge all'intestazione della richiesta HTTP come `Bearer token`.
 * - Se il token non è presente, la richiesta viene inoltrata senza modifiche.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}


  /**
   * Intercetta le richieste HTTP in uscita.
   * 
   * **Funzionalità:**
   * - Recupera il token di autenticazione dal `AuthService`.
   * - Se il token esiste, clona la richiesta HTTP e aggiunge l'intestazione `Authorization` 
   *   con il valore `Bearer token`.
   * - Se il token non è disponibile, la richiesta viene inoltrata senza modifiche.
   * 
   * @param req La richiesta HTTP originale.
   * @param next Il gestore delle richieste HTTP.
   * @returns Un `Observable` dell'evento HTTP con la richiesta modificata (se il token è presente).
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    if (token) {
      console.log('Adding Authorization header with token:', token);
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      return next.handle(authReq);
    }
    return next.handle(req);
  }
}