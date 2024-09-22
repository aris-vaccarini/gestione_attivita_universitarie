import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authService'; 
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})


/**
 * Componente per la gestione dell'autenticazione dell'utente (login e registrazione).
 *
 * Questo componente fornisce un form per l'inserimento delle credenziali di accesso 
 * (email e password) e permette all'utente di effettuare il login o registrarsi.
 *
 * Il componente gestisce due modalità: login e registrazione. La modalità corrente
 * è indicata dalla proprietà `isLoginMode`.
 *
 * Il form è costruito utilizzando `FormBuilder` di Angular Reactive Forms.
 * Vengono effettuate le opportune validazioni sui campi email e password.
 * 
 * Il componente interagisce con il servizio `AuthService` per effettuare le operazioni 
 * di login e registrazione. In caso di successo, viene salvato il token di autenticazione 
 * e l'utente viene reindirizzato alla pagina principale dell'applicazione.
 */
export class AuthComponent {
  authForm: FormGroup;
  isLoginMode = true;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['']
    });
  }


/**
 * Gestisce la logica per passare dalla modalità di login alla modalità di registrazione e viceversa.
 *
 * **Funzionalità:**
 *  Inverte il valore booleano di `isLoginMode` per indicare la modalità corrente.
 *  Se si passa alla modalità di login:
 *     - Resetta il campo "confirmPassword" del form per rimuovere qualsiasi valore preesistente.
 *  Se si passa alla modalità di registrazione:
 *     - Imposta un valore vuoto per il campo "confirmPassword" per assicurarsi che sia inizialmente vuoto.
 */
  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    if (this.isLoginMode) {
      this.authForm.get('confirmPassword')?.reset(); 
    } else {
      this.authForm.get('confirmPassword')?.setValue(''); 
    }
  }
  
/*
 * Gestisce la logica per la sottomissione del form, sia in modalità di login che di registrazione.
 *
 * **Funzionalità:**
 *  - Verifica la validità dell'intero form: se non valido, interrompe il flusso.
 *  - Recupera i valori dai campi del form (email, password, confirmPassword).
 *  - In modalità di login:
 *    - Chiama la funzione `login` passando email e password.
 *  - In modalità di registrazione:
 *    - Verifica che le password corrispondano.
 *    - Se corrispondono, chiama la funzione `register` passando email e password.
 *    - Se non corrispondono, mostra un avviso e interrompe il flusso.
 */
  submit() {  
    if (this.isLoginMode) {
      this.authForm.get('confirmPassword')?.setErrors(null);
    } else {
      if (this.authForm.get('password')?.value !== this.authForm.get('confirmPassword')?.value) {
        this.authForm.get('confirmPassword')?.setErrors({ mismatch: true });
        return;
      }
    }
    if (this.authForm.invalid) {
      return;
    }  
    const { email, password, confirmPassword } = this.authForm.value;
    if (this.isLoginMode) {
      this.login(email, password);
    } else {
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      this.register(email, password);
    }
  }
  
/**
 * Effettua il login dell'utente chiamando il servizio `AuthService`.
 * 
 * **Funzionalità:**
 *  - Invia la richiesta di login con email e password all'API tramite `AuthService`.
 *  - Se la risposta contiene un token:
 *    - Il token viene salvato tramite il metodo `saveToken()` di `AuthService`.
 *    - L'utente viene reindirizzato alla pagina delle attività (`/attivita`).
 *  - Se non viene ricevuto un token, stampa un messaggio di errore nella console.
 *  - In caso di errore nella richiesta, stampa un messaggio di errore nella console.
 * 
 * @param email L'email inserita dall'utente.
 * @param password La password inserita dall'utente.
 */
  private login(email: string, password: string) {
    this.authService.login(email, password).subscribe(
      response => {
        if (response && response.token) {
          this.authService.saveToken(response.token);
          this.router.navigate(['/attivita']);
        } else {
          console.error('No token received');
        }
      },
      error => {
        console.error('Login failed', error);
      }
    );
  }
  


  /**
   * Effettua la registrazione di un nuovo utente chiamando il servizio `AuthService`.
   * 
   * **Funzionalità:**
   *  - Invia la richiesta di registrazione con email e password all'API tramite `AuthService`.
   *  - In caso di successo:
   *    - Stampa un messaggio di conferma della registrazione nella console.
   *    - Resetta il form `authForm` per rimuovere i valori inseriti.
   *    - Effettua immediatamente il login dell'utente appena registrato chiamando il metodo `login()`.
   *  - In caso di errore nella richiesta, stampa un messaggio di errore nella console.
   * 
   * @param email L'email inserita dall'utente per la registrazione.
   * @param password La password inserita dall'utente per la registrazione.
   */
  private register(email: string, password: string) {
    this.authService.register(email, password).subscribe(
      response => {
        console.log('Registration successful', response);
        this.authForm.reset(); 
        this.login(email, password);
      },
      error => {
        console.error('Registration failed', error);
      }
    );
  }

}
