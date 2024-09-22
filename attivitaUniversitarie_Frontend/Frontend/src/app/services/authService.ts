import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AuthResponse } from './authResponse';

@Injectable({
  providedIn: 'root'
})


/**
 * `AuthService` gestisce le operazioni di autenticazione e autorizzazione.
 * Fornisce metodi per il login, la registrazione, il logout e la gestione del token JWT.
 */
export class AuthService {
  private apiUrl = 'https://localhost:7163/api/auth'; 

  constructor(private http: HttpClient, private router: Router) {}


  /**
   * Salva il token JWT nel localStorage.
   * 
   * **Funzionalità:**
   * - Verifica che il token sia definito.
   * - Salva il token nel localStorage per poterlo utilizzare nelle future richieste HTTP.
   * 
   * @param token Il token JWT da salvare.
   */
  saveToken(token: string | undefined) {
    if (token) {
      console.log('Saving token:', token);
      localStorage.setItem('authToken', token);
    } else {
      console.error('Token is undefined, cannot save.');
    }
  }
  

  /**
   * Recupera il token JWT dal localStorage.
   * 
   * **Funzionalità:**
   * - Restituisce il token se presente nel localStorage, altrimenti `null`.
   * 
   * @returns Il token JWT o `null` se non trovato.
   */
  getToken(): string | null {
    const token = localStorage.getItem('authToken');
    console.log('Token retrieved from localStorage:', token); 
    return token;  
  }


  /**
   * Esegue il logout rimuovendo il token JWT dal localStorage.
   * 
   * **Funzionalità:**
   * - Rimuove il token di autenticazione dal localStorage.
   * - Reindirizza l'utente alla pagina di autenticazione (`/auth`).
   */
  logout() {
    localStorage.removeItem('authToken');
    this.router.navigate(['/auth']); 
  }


  /**
   * Verifica se l'utente è autenticato controllando la presenza del token JWT.
   * 
   * **Funzionalità:**
   * - Ritorna `true` se un token è presente, altrimenti `false`.
   * 
   * @returns `true` se l'utente è autenticato, altrimenti `false`.
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }


  /**
   * Effettua una richiesta di login con email e password.
   * 
   * **Funzionalità:**
   * - Invia una richiesta POST all'API per l'autenticazione.
   * - Restituisce un `Observable` con la risposta del server che contiene il token JWT.
   * 
   * @param email L'indirizzo email dell'utente.
   * @param password La password dell'utente.
   * @returns Un `Observable` che emette una `AuthResponse` con il token JWT.
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password });
  }


  /**
   * Effettua una richiesta di registrazione con email e password.
   * 
   * **Funzionalità:**
   * - Invia una richiesta POST all'API per registrare un nuovo utente.
   * - Ritorna un `Observable` con il token JWT in caso di successo.
   * - In caso di errore, intercetta l'errore e lo propaga tramite `throwError`.
   * 
   * @param email L'indirizzo email dell'utente.
   * @param password La password dell'utente.
   * @returns Un `Observable` che emette il token JWT in caso di registrazione riuscita.
   */
  register(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { email, password })
      .pipe(
        map((response: any) => {
          return response.token; 
        }),
        catchError(error => {
          return throwError(error);
        })
      );
  }

  
  /**
   * Restituisce un oggetto di intestazioni di autorizzazione contenente il token JWT.
   * 
   * **Funzionalità:**
   * - Recupera il token dal localStorage.
   * - Se il token non è presente, lancia un errore.
   * - Ritorna l'intestazione di autorizzazione con il token.
   * 
   * @returns Un oggetto contenente l'intestazione `Authorization` con il token JWT.
   */
  getAuthHeaders(): { Authorization: string } {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      Authorization: `Bearer ${token}`
    };
  }


  /**
   * Recupera l'ID dell'utente dal payload del token JWT.
   * 
   * **Funzionalità:**
   * - Decodifica il payload del token JWT.
   * - Estrae l'ID dell'utente dal token se presente.
   * 
   * @returns L'ID dell'utente o `null` se il token non è presente o malformato.
   */
  getUserId(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));  
    const userId = tokenPayload['idUser'];
    return userId || null;
  }
  
}
