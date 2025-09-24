import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MisTurnosPacienteComponent } from './componets/mis-turnos-paciente/mis-turnos-paciente.component';
import { MisTurnosEspecialistaComponent } from './componets/mis-turnos-especialista/mis-turnos-especialista.component';
import { AdminTurnosComponent } from './componets/admin-turnos/admin-turnos.component';

const routes: Routes = [
  { path: 'paciente', component: MisTurnosPacienteComponent },
  { path: 'especialista', component: MisTurnosEspecialistaComponent },
  { path: 'admin', component: AdminTurnosComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TurnosRoutingModule { }
