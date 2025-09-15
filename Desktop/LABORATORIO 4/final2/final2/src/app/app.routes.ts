import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from '../../src/app/components/login/login.component';

 import { RegistroComponent } from '../../src/app/components/registro/registro.component'
 import { MiPerfilComponent } from '../../src/app/components/mi-perfil/mi-perfil.component';
 import { HistoriaClinicaComponent } from '../../src/app/components/historia-clinica/historia-clinica.component';


 import { UsuariosComponent } from './components/usuarios/usuarios.component';

 import { adminGuard } from './guards/admin.guard';
 import { TurnosGuard } from './guards/turnos.guard';


 import { EstadisticasComponent } from './components/estadisticas/estadisticas.component'



export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent, data: { animation: 'HomePage' } },
    { path: 'registro', component: RegistroComponent, data: { animation: 'RegisterPage' } },
    { path: 'login', component: LoginComponent, data: { animation: 'LoginPage' } },


     { path: 'mi-perfil', component: MiPerfilComponent ,data: { animation: 'PerfilPage' }},
     { path: 'mi-perfil/:id', component: MiPerfilComponent ,data: { animation: 'PerfilPageID' }},
     { path: 'historia-clinica', component: HistoriaClinicaComponent },
    { path: 'historia-clinica/:id', component: HistoriaClinicaComponent },
     { path: 'estadisticas', component: EstadisticasComponent ,data: { animation: 'estadisticasPage' }},
    {
        path: 'usuarios',
        component: UsuariosComponent,
        canActivate: [adminGuard],
        data: { animation: 'UsuariosPage' }
    },

    {
        path: 'turnos',
        loadChildren: () => import('./turnos/turnos.module').then(m => m.TurnosModule),
        data: { animation: 'TurnosPage' }
    }

];
