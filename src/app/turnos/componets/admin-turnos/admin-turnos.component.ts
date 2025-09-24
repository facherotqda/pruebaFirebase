import { Component, OnInit, inject, signal } from '@angular/core';
import { SupabaseDbService } from '../../../services/supabase-db.service';
import { CredencialesService } from '../../../services/credenciales.service';
import { Turno, Especialidad,EspecialistaCard } from '../../../models/interfaces-turnos';


@Component({
  selector: 'app-admin-turnos',
  standalone: false,
  templateUrl: './admin-turnos.component.html',
  styleUrls: ['./admin-turnos.component.css']
})
export class AdminTurnosComponent implements OnInit {
  private db = inject(SupabaseDbService);
  private auth = inject(CredencialesService);



  turnos = signal<Turno[]>([]);
  pacientes = signal<any[]>([]);
  especialidades = signal<Especialidad[]>([]);
  especialistasFiltrados = signal<any[]>([]);
  //horariosDisponibles = signal<{ horario: string; fecha: string }[]>([]);
   horariosDisponibles = signal<string[]>([]);
  mensaje = signal<{ texto: string; tipo: 'success' | 'error' | 'warning' | 'info' } | null>(null);
 loadingFechas = false;
  pacienteSeleccionado: any = null;
  especialidadSeleccionada: string | null = null;
  especialistaSeleccionado: any = null;
  horarioSeleccionado: { horario: string; fecha: string } | null = null;
  fechaSeleccionada: string | null = null;
  fechasDisponibles = signal<string[]>([]);
  horariosPorDia = signal<{ fecha: string; dia: string; horas: string[] }[]>([]);
    nombreEspecialistaSeleccionado = '';



 /*  get fechasUnicas() {
    const map = new Map<string, boolean>();
    this.horariosDisponibles().forEach(h => map.set(h.fecha, true));
    return Array.from(map.keys()).sort();
  } */


 /*  seleccionarFecha(fecha: string) {
    this.fechaSeleccionada = fecha;
    this.horarioSeleccionado = null;          // reinicio la hora
  } */


    async seleccionarFecha(fecha: string) {
  this.fechaSeleccionada = fecha;
  
  try {
    console.log(this.especialistaSeleccionado!.user_auth_id, fecha);
    const horarios = await this.db.obtenerHorariosDisponibles(this.especialistaSeleccionado!.user_auth_id, fecha);
    const horariosStrings = horarios?.map((h: { horario_disponible: string }) => h.horario_disponible) || [];
    this.horariosDisponibles.set(horariosStrings);
  } catch (error) {
    console.error("Error al obtener horarios disponibles:", error);
  }
}

  seleccionarHorario(h: { horario: string; fecha: string }) {
    this.horarioSeleccionado = h;
  }

/*   get horasFiltradas() {
    if (!this.fechaSeleccionada) return [];
    return this.horariosDisponibles().filter(h => h.fecha === this.fechaSeleccionada);
  } */

  async ngOnInit() { await this.cargarDatos(); }

  async cargarDatos() {
    const usuario = await this.auth.getUsuarioActualAsync();
    if (!usuario || await this.auth.getPerfilActual() !== 'admin') return;

    const [todosTurnos, usuarios, especialidadesImg] = await Promise.all([
      this.db.obtenerTodosLosTurnos(),
      this.db.obtenerTodosLosUsuarios(),
      this.db.obtenerEspecialidadesConImagen()
    ]);

    this.turnos.set(todosTurnos.map(t => ({
      ...t,
      fecha_turno: new Date(t.fecha_hora),
      hora_turno: new Date(t.fecha_hora).toTimeString().substring(0, 5)
    })));

    this.pacientes.set(usuarios.filter(u => u.perfil === 'paciente'));
    this.especialidades.set(especialidadesImg);
  }

  seleccionarPaciente(p: any) {
    this.pacienteSeleccionado = p;
    this.resetSelecciones(true);
    this.especialidades.set(this.especialidades().slice(0, 10));
  }

  seleccionarEspecialidad(e: string) { this.especialidadSeleccionada = e; this.resetSelecciones(); this.filtrarEspecialistas(); this.resetHorarios(); }


/*   async seleccionarEspecialista(est: any) {
    this.especialistaSeleccionado = est; this.horariosDisponibles.set([]);
    const hoy = new Date().toISOString().substring(0, 10);
    const horarios = await this.db.obtenerHorariosDisponibles(est.user_auth_id, hoy);
    if (!horarios?.length) { this.mensaje.set({ texto: 'No hay horarios disponibles hoy.', tipo: 'warning' }); return; }
    this.mensaje.set(null); this.horariosDisponibles.set(horarios);
  } */




         async seleccionarEspecialista(est: EspecialistaCard) {
    this.especialistaSeleccionado = est;
    this.nombreEspecialistaSeleccionado = `${est.nombre} ${est.apellido}`;
    this.resetHorarios();
    this.loadingFechas = true;
     console.log("antes de  obtenerFechasDisponibles");
    const fechas = await this.db.obtenerFechasDisponibles(est.user_auth_id, 14);
    console.log("despues de  obtenerFechasDisponibles");
    console.log(fechas)
    this.loadingFechas = false;
    if (!fechas.length) {
      this.mensaje.set({ texto: 'El especialista no tiene horarios disponibles en los próximos 15 días.', tipo: 'warning' });
      return;
    }
    this.fechasDisponibles.set(fechas);
  }


        private resetHorarios() {
    this.horariosDisponibles.set([]);
    this.fechasDisponibles.set([]);
    this.horariosPorDia.set([]);
    this.horarioSeleccionado = null;
  }


  async confirmarTurno() {
    if (!this.pacienteSeleccionado || !this.especialistaSeleccionado || !this.horarioSeleccionado) return;
    const fechaHora = `${this.horarioSeleccionado.fecha}T${this.horarioSeleccionado.horario}`;
    await this.db.solicitarTurno({
      paciente_id: this.pacienteSeleccionado.user_auth_id,
      especialista_id: this.especialistaSeleccionado.user_auth_id,
      especialidad: this.especialidadSeleccionada!,
      fecha_hora: fechaHora,
      estado: 'solicitado'
    } as Turno);
    await this.cargarDatos(); this.mensaje.set({ texto: 'Turno creado.', tipo: 'success' }); this.cancelarSeleccion();
  }

  cancelarSeleccion() { 
    
  //  this.resetSelecciones(); 
  this.resetHorarios();
  this.especialidadSeleccionada = null;
    this.especialistaSeleccionado = null;
    this.nombreEspecialistaSeleccionado = '';
  
  }


  
  private resetSelecciones(keepPaciente = false) {
    if (!keepPaciente) this.pacienteSeleccionado = this.pacienteSeleccionado;
    this.especialistaSeleccionado = null; this.horariosDisponibles.set([]);
    this.horarioSeleccionado = null;
  }

  async cancelarTurno(t: any) {
    if (!t.motivo_cancelacion) { this.mensaje.set({ texto: 'Ingrese motivo.', tipo: 'error' }); return; }
    await this.db.cancelarTurno(t.id, t.motivo_cancelacion); await this.cargarDatos();
  }

  async aceptarTurno(t: Turno) { await this.db.aceptarTurno(t.id!); await this.cargarDatos(); }
  async rechazarTurno(t: any) {
    if (!t.motivo_rechazo) { this.mensaje.set({ texto: 'Ingrese motivo.', tipo: 'error' }); return; }
    await this.db.rechazarTurno(t.id, t.motivo_rechazo); await this.cargarDatos();
  }

  async finalizarTurno(t: any) {
    if (!t.comentario_especialista) { this.mensaje.set({ texto: 'Ingrese comentario.', tipo: 'error' }); return; }
    await this.db.finalizarTurno(t.id, t.comentario_especialista); await this.cargarDatos();
  }

  private async filtrarEspecialistas() {
    const usuarios = await this.db.obtenerTodosLosUsuarios();
    this.especialistasFiltrados.set(usuarios.filter(
      u => u.perfil === 'especialista' && u.especialidades?.includes(this.especialidadSeleccionada)
    ));
  }

  async cerrarSesion() { await this.auth.logout(); window.location.href = '/home'; }

horasParaFecha(): string[] {
  return this.horariosDisponibles();
}

  formatearHora(h: string): string {
    const [hh, mm] = h.split(':'); let hr = +hh;
    const suf = hr >= 12 ? 'pm' : 'am'; hr = hr % 12; if (hr === 0) hr = 12;
    return `${hr.toString().padStart(2, '0')}:${mm} ${suf}`;
  }



}
