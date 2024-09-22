import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './authService';

interface Attivita {
  id: number;
  titolo: string;
  descrizione: string;
  scadenza: string;
  stato: string;
  idUser: string;
}

@Injectable({
  providedIn: 'root'
})

/**
 * Il servizio `AttivitaService` gestisce tutte le operazioni CRUD relative alle attività 
 * degli utenti, tra cui recuperare, creare, aggiornare e cancellare attività.
 * 
 * **Funzionalità principali:**
 * - Recupera le attività associate a un utente specifico.
 * - Consente la creazione di nuove attività.
 * - Consente l'aggiornamento delle attività esistenti.
 * - Consente la cancellazione delle attività esistenti.
 * - Gestisce gli errori relativi alle richieste HTTP.
 */
export class AttivitaService {
  private apiUrl = 'https://localhost:7163/api/attivita';

  constructor(private http: HttpClient, private authService: AuthService) {}


  /**
   * Recupera tutte le attività associate all'utente corrente.
   * 
   * **Funzionalità:**
   * - Esegue una richiesta GET all'endpoint `/byUser` per ottenere le attività 
   *   associate all'utente autenticato.
   * - Utilizza i token di autenticazione presenti negli header.
   * - Gestisce gli errori tramite il metodo `handleError`.
   * 
   * @returns Un `Observable` contenente la lista di attività (`Attivita[]`) dell'utente.
   */
  getAttivitaByUser(): Observable<Attivita[]> {
    return this.http.get<Attivita[]>(`${this.apiUrl}/byUser`, { headers: this.authService.getAuthHeaders() })
      .pipe(
        catchError(this.handleError) 
      );
  }
  
  /**
   * Crea una nuova attività per l'utente corrente.
   * 
   * **Funzionalità:**
   * - Esegue una richiesta POST all'API per creare una nuova attività con i dati forniti.
   * - I token di autenticazione sono inclusi negli header.
   * - Gestisce gli errori tramite il metodo `handleError`.
   * 
   * @param attivita Un oggetto `Attivita` contenente i dati dell'attività da creare.
   * @returns Un `Observable` che restituisce l'attività appena creata.
   */
  createAttivita(attivita: Attivita): Observable<Attivita> {
    return this.http.post<Attivita>(this.apiUrl, attivita, { headers: this.authService.getAuthHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }


  /**
   * Aggiorna un'attività esistente dell'utente.
   * 
   * **Funzionalità:**
   * - Esegue una richiesta PUT all'API per aggiornare un'attività esistente con i nuovi dati forniti.
   * - Utilizza i token di autenticazione presenti negli header.
   * - Gestisce gli errori tramite il metodo `handleError`.
   * 
   * @param id L'ID dell'attività da aggiornare.
   * @param attivita Un oggetto `Attivita` contenente i nuovi dati dell'attività.
   * @returns Un `Observable` vuoto che indica il completamento dell'operazione.
   */
  updateAttivita(id: number, attivita: Attivita): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, attivita, { headers: this.authService.getAuthHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }


  /**
   * Elimina un'attività esistente dell'utente.
   * 
   * **Funzionalità:**
   * - Esegue una richiesta DELETE all'API per rimuovere un'attività specifica.
   * - I token di autenticazione sono inclusi negli header.
   * - Gestisce gli errori tramite il metodo `handleError`.
   * 
   * @param id L'ID dell'attività da eliminare.
   * @returns Un `Observable` vuoto che indica il completamento dell'operazione.
   */
  deleteAttivita(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.authService.getAuthHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }


  /**
   * Gestisce gli errori derivanti dalle richieste HTTP.
   * 
   * **Funzionalità:**
   * - Logga l'errore nella console.
   * - Restituisce un `Observable` che genera un errore da gestire tramite `catchError`.
   * 
   * @param error L'oggetto `HttpErrorResponse` contenente i dettagli dell'errore.
   * @returns Un `Observable` che genera un errore personalizzato.
   */
  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error.message);
    return throwError(() => new Error('An error occurred, please try again later.'));
  }
}
