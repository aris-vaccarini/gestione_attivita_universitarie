import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';
import { AuthComponent } from './Components/auth/auth.component';
import { AttivitaComponent } from './Components/attivita/attivita.component';

export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: 'login', component: AuthComponent },
  { path: 'attivita', component: AttivitaComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth' }

];
