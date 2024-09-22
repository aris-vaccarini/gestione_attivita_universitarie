import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})

/**
 * Il servizio `AuthGuard` protegge le rotte dell'applicazione, consentendo l'accesso 
 * solo agli utenti autenticati. Implementa l'interfaccia `CanActivate`, che viene utilizzata
 * per decidere se una rotta può essere attivata o meno.
 */
export class AuthGuard implements CanActivate {
  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: any) {}


  /**
   * Verifica se l'utente è autenticato e decide se attivare la rotta.
   * 
   * **Funzionalità:**
   * - Controlla se l'app è in esecuzione sul browser (necessario per usare `localStorage`).
   * - Se il token di autenticazione è presente in `localStorage`, consente l'attivazione della rotta.
   * - In caso contrario, reindirizza l'utente alla pagina di autenticazione.
   * 
   * @returns `true` se l'utente è autenticato, altrimenti `false`.
   */
  canActivate(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('authToken');
      if (token) {
        return true;
      }
    }
    this.router.navigate(['/auth']);
    return false;
  }
}
