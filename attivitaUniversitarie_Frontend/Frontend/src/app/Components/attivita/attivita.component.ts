import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authService';
import { AttivitaService } from '../../services/attivita.service';
import { CommonModule } from '@angular/common';

interface Attivita {
  id: number;
  titolo: string;
  descrizione: string;
  scadenza: string;
  stato: string;
  idUser: string;
}

@Component({
  selector: 'app-attivita',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './attivita.component.html',
  styleUrls: ['./attivita.component.css']
})

/**
 * Questa classe rappresenta il componente Angular responsabile della gestione delle attività.
 * Consente all'utente di visualizzare, aggiungere, modificare ed eliminare le proprie attività.
 * Interagisce con il servizio `AttivitaService` per comunicare con il backend.
 */
export class AttivitaComponent implements OnInit {
  attivitaList: Attivita[] = [];
  stati: string[] = ['Da fare', 'In corso', 'Completata'];
  selectedAttivita: Attivita | null = null;
  attivitaForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private attivitaService: AttivitaService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.attivitaForm = this.fb.group({
      id: [0],
      titolo: ['', Validators.required],
      descrizione: ['', Validators.required],
      scadenza: ['', Validators.required],
      stato: ['', Validators.required],
      idUser: ['1'],
    });
  }

  ngOnInit(): void {
    this.loadAttivita();
  }

  /**
   * Carica l'elenco delle attività associate all'utente corrente.
   * 
   * **Funzionalità:**
   *  - Effettua una richiesta HTTP al servizio `AttivitaService` per recuperare i dati delle attività.
   *  - Gestisce la risposta del servizio:
   *      - In caso di successo, estrae le attività dalla risposta e le assegna alla proprietà `attivitaList`.
   *      - In caso di errore, registra un messaggio di errore nel console e, se l'errore è un 401 (non autorizzato), reindirizza l'utente alla pagina di autenticazione.
   */
  loadAttivita(): void {
    this.attivitaService.getAttivitaByUser().subscribe({
      next: (data: any) => {  
        if (data && data.$values && Array.isArray(data.$values)) {
          this.attivitaList = data.$values.map((attivita: any) => {
            const scadenza = attivita.scadenza ? new Date(attivita.scadenza) : null;
            return {
              ...attivita,
              scadenza
            };
          });
        } else {
          console.error('Dati ricevuti non contengono la proprietà `$values` o non è un array');
        }
      },
      error: (error) => {
        console.error('Errore durante il caricamento delle attività', error);
        if (error.status === 401) {
          this.router.navigate(['/auth']);
        }
      }
    });
  }
  

  /**
   * Aggiunge una nuova attività all'elenco.
   * 
   * **Funzionalità:**
   *  Valida i dati inseriti nel form.
   *  Crea un nuovo oggetto `Attivita` a partire dai dati validati.
   *  Ottiene l'ID dell'utente autenticato.
   *  Invia una richiesta al servizio `AttivitaService` per creare la nuova attività.
   *  Aggiorna l'elenco delle attività e resetta il form.
   */  
  addAttivita(): void {
    if (this.attivitaForm.invalid) {
      this.attivitaForm.markAllAsTouched(); // Mostra gli errori per i campi non validi
      alert('Per favore, compila tutti i campi obbligatori.');
      return;
    }

    if (this.attivitaForm.valid) {
        const formValue = this.attivitaForm.value;
        const scadenzaDate = new Date(formValue.scadenza);
        const scadenzaISO = scadenzaDate.toISOString();  
        const newAttivita: Attivita = {
            ...formValue,
            scadenza: scadenzaISO,  
        };
        const userId = this.authService.getUserId();
        if (userId) {
            newAttivita.idUser = userId;
            
            this.attivitaService.createAttivita(newAttivita).subscribe({
                next: (response: Attivita) => {
                    this.attivitaList.push(response);
                    this.resetForm(); 
                },
                error: (error) => {
                    console.error('Errore durante l\'aggiunta dell\'attività', error);
                }
            });
        } else {
            console.error('Errore: ID utente non trovato.');
        }
    }
}

  /**
   * Seleziona un'attività per la modifica e popola il form con i suoi dati.
   *
   * **Parametri:**
   * - `id (number)`: L'ID dell'attività da modificare.
   *
   * **Funzionalità:**
   * Cerca l'attività nell'elenco `attivitaList` utilizzando il suo ID.
   * Se l'attività viene trovata:
   *    - Converte la data di scadenza dell'attività (se presente) in un oggetto `Date`.
   *    - Corregge la data di scadenza per tenere conto del fuso orario dell'utente (conversione da UTC a locale).
   *    - Formatta la data di scadenza corretta in formato ISO 8601 (solo data, senza parte oraria).
   *    - Imposta i valori del form `attivitaForm` con i dati dell'attività selezionata, sovrascrivendo i valori esistenti.
   *    - Imposta la proprietà `scadenza` del form con la data di scadenza formattata.
   * Se l'attività non viene trovata:
   *    - Non esegue alcuna operazione (l'utente potrebbe ricevere un messaggio di errore visivo in base all'implementazione dell'interfaccia utente).
   */
  editAttivita(id: number): void {
    this.selectedAttivita = this.attivitaList.find(a => a.id === id) || null;
    if (this.selectedAttivita) {
      const scadenzaDate = this.selectedAttivita.scadenza
        ? new Date(this.selectedAttivita.scadenza)
        : null;
  
      const localDateTime = scadenzaDate
        ? new Date(scadenzaDate.getTime() - scadenzaDate.getTimezoneOffset() * 60000) 
        : null;
  
      const formattedDate = localDateTime
        ? localDateTime.toISOString().slice(0, 16) 
        : '';
  
      this.attivitaForm.patchValue({
        ...this.selectedAttivita,
        scadenza: formattedDate
      });
    }
  }
  
  

/**
 * Aggiorna un'attività esistente nell'elenco.
 *
 * **Funzionalità:**
 * Controlla la validità del form `attivitaForm` e verifica che sia presente un'attività selezionata (`this.selectedAttivita`).
 * Se entrambi i controlli sono superati:
 *    - Recupera i dati dal form `attivitaForm`.
 *    - Crea un nuovo oggetto `Attivita` con i dati aggiornati, inclusi i dati del form e la data di scadenza convertita in formato ISO 8601 (se presente).
 *    - Effettua una richiesta al servizio `attivitaService` per aggiornare l'attività sul server.
 *    - In caso di successo:
 *        - Registra un messaggio di conferma nel console.
 *        - Trova l'indice dell'attività da aggiornare nell'elenco `attivitaList`.
 *        - Aggiorna l'attività nell'elenco locale con i dati dell'attività aggiornata.
 *        - Resetta il form.
 *    - In caso di errore:
 *        - Registra un messaggio di errore nel console.
 */
  updateAttivita(): void {
    if (this.attivitaForm.invalid) {
      this.attivitaForm.markAllAsTouched(); // Mostra gli errori per i campi non validi
      alert('Per favore, compila tutti i campi obbligatori.');
      return;
    }

    if (this.attivitaForm.valid && this.selectedAttivita) {
      const formValue = this.attivitaForm.value;
  
      const updatedAttivita: Attivita = {
        ...formValue,
        scadenza: formValue.scadenza
          ? new Date(formValue.scadenza).toISOString() 
          : null
      };
  
      this.attivitaService.updateAttivita(updatedAttivita.id, updatedAttivita).subscribe({
        next: () => {
          const index = this.attivitaList.findIndex(a => a.id === updatedAttivita.id);
          if (index !== -1) {
            this.attivitaList[index] = updatedAttivita;
          }
          this.resetForm(); 
        },
        error: (error) => {
          console.error('Errore durante l\'aggiornamento dell\'attività', error);
        }
      });
    }
  }  

/**
 * Elimina un'attività dall'elenco.
 *
 * **Funzionalità:**
 * Invia una richiesta al servizio `attivitaService` per eliminare l'attività sul server.
 * In caso di successo:
 *    - Registra un messaggio di conferma nel console.
 *    - Rimuove l'attività eliminata dall'elenco locale `attivitaList`.
 * In caso di errore:
 *    - Registra un messaggio di errore nel console.
 *
 * @param id  L'ID dell'attività da eliminare.
 */
  deleteAttivita(id: number): void {
    this.attivitaService.deleteAttivita(id).subscribe({
      next: () => {
        this.attivitaList = this.attivitaList.filter(a => a.id !== id);
      },
      error: (error) => {
        console.error('Errore durante l\'eliminazione dell\'attività', error);
      }
    });
  }

  // Resetta il form
  resetForm(): void {
    this.selectedAttivita = null;
    this.attivitaForm.reset({ dataScadenza: '' });
  }

  // Logout
  logout() {
    this.authService.logout(); 
    this.router.navigate(['/auth']);
  }
}
