import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseDbService } from '../../../services/supabase-db.service';
import { CredencialesService } from '../../../services/credenciales.service';

import { Turno, Especialidad, EspecialistaCard } from '../../../models/interfaces-turnos';

@Component({
  selector: 'app-mis-turnos-especialista',
  standalone: false,
  templateUrl: './mis-turnos-especialista.component.html',
  styleUrls: ['./mis-turnos-especialista.component.css']
})
export class MisTurnosEspecialistaComponent implements OnInit {
  private db = inject(SupabaseDbService);
  private auth = inject(CredencialesService);
  private fb = inject(FormBuilder);
  pacientes = signal<any[]>([]);
  horariosDisponibles = signal<string[]>([]);
  horarioSeleccionado: { horario: string; fecha: string } | null = null;
  loadingFechas = false;
  turnos = signal<Turno[]>([]);
  especialidades = signal<Especialidad[]>([]);
  filtro = signal<{ filtroEspecialidad: string; filtroPaciente: string }>({ filtroEspecialidad: '', filtroPaciente: '' });

  comentario = signal<{ [id: string]: string }>({});
  usuarioActual: any = null;

  modalVisible = signal(false);
  turnoSeleccionado: Turno | null = null;
  mensajeModal = signal('');
  historiaForm!: FormGroup;
  mensaje = signal<{ texto: string; tipo: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  pacienteSeleccionado: any = null;
  especialistaSeleccionado: any = null;
  nombrePaciente= ''
  nombreEspecialistaSeleccionado = '';
  fechasDisponibles = signal<string[]>([]);
   horariosPorDia = signal<{ fecha: string; dia: string; horas: string[] }[]>([]);
  fechaSeleccionada: string | null = null;

 especialidadSeleccionada: string | null = null;



  async ngOnInit() {

    this.usuarioActual = await this.auth.getUsuarioActualAsync();
    this.historiaForm = this.fb.group({
      altura: ['', Validators.required],
      peso: ['', Validators.required],
      temperatura: ['', Validators.required],
      presion: ['', Validators.required],
      clave1: ['', Validators.required],
      valor1: ['', Validators.required],
      clave2: ['', Validators.required],
      valor2: ['', Validators.required],
      clave3: ['', Validators.required],
      valor3: ['', Validators.required],

 rangoControl: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
  numeroControl: [null, [Validators.required, Validators.min(0)]],
  switchControl: [false, Validators.required] // requiredTrue forzamos el si.

    });
    await this.cargarDatos();
 console.log("OnINIT");   
 console.log(this.usuarioActual);

  }

  async cargarDatos() {


    if (!this.usuarioActual) return;
    if ((await this.auth.getPerfilActual()) !== 'especialista') return;

    const [todosTurnos, misDatos, todasEsp, usuarios] = await Promise.all([
      this.db.obtenerTurnosPorUsuario(this.usuarioActual.id, 'especialista'),
      this.db.obtenerUsuarioActual(this.usuarioActual.id),
      this.db.obtenerEspecialidadesConImagen(),
      this.db.obtenerTodosLosUsuarios(),

     
    ]);



    const procesados = todosTurnos.map(t => ({
      ...t,
      fecha_turno: new Date(t.fecha_hora),
      hora_turno: new Date(t.fecha_hora).toTimeString().substring(0, 5)
    }));

    this.turnos.set(procesados);

    const propias = (misDatos.especialidades || []) as string[];
    const conImagen = todasEsp.filter(e => propias.includes(e.nombre));
    this.especialidades.set(conImagen);

    this.pacientes.set(usuarios.filter(u => u.perfil === 'paciente'));

/*     console.log("FUNCION cargarDatos");
console.log(misDatos.especialidades);
console.log(misDatos.user_auth_id);
console.log(misDatos.apellido,misDatos.nombre); */
this.nombrePaciente=(misDatos.apellido+" "+ misDatos.nombre)
 console.log("FUNCION cargarDatos",this.nombrePaciente);
    console.log("FUNCION cargarDatos FIN");

  }

  cumpleFiltro = (t: Turno) => {
    const f = this.filtro();
    const okEsp = !f.filtroEspecialidad || t.especialidad === f.filtroEspecialidad;
//console.log("funcion cumpleFiltro");
//console.log(f.filtroEspecialidad);
//console.log("funcion especialidadSeleccionada");

this.especialidadSeleccionada=f.filtroEspecialidad; 
console.log(this.especialidadSeleccionada);

    const okPac =
      !f.filtroPaciente ||
      t.nombre_paciente!.toLowerCase().includes(f.filtroPaciente.toLowerCase()) ||
      t.apellido_paciente!.toLowerCase().includes(f.filtroPaciente.toLowerCase());
    return okEsp && okPac;
  };

  puedeCancelar = (t: Turno) => !['aceptado', 'realizado', 'rechazado', 'cancelado'].includes(t.estado!);
  puedeRechazar = (t: Turno) => !['aceptado', 'realizado', 'cancelado'].includes(t.estado!);
  puedeAceptar = (t: Turno) => !['realizado', 'cancelado', 'rechazado'].includes(t.estado!);
  puedeFinalizar = (t: Turno) => t.estado === 'aceptado';
  puedeVerResena = (t: Turno) => t.estado === 'realizado' && !!t.comentario_especialista;
  verResena(t: Turno) {

    this.mensaje.set(null);
    setTimeout(() => {
      this.mensaje.set({
        texto: `Reseña del especialista:\n\n${t.comentario_especialista}`,
        tipo: 'info'
      });
    });
  }


  async cancelarTurno(t: Turno) { const txt = this.comentario()[t.id!]; if (!txt) return; await this.db.cancelarTurno(t.id!, txt); await this.cargarDatos(); }
  async rechazarTurno(t: Turno) { const txt = this.comentario()[t.id!]; if (!txt) return; await this.db.rechazarTurno(t.id!, txt); await this.cargarDatos(); }
  async aceptarTurno(t: Turno) { await this.db.aceptarTurno(t.id!); await this.cargarDatos(); }

  mostrarModalFinalizar(t: Turno) {
    console.log('Abriendo modal...');
    this.turnoSeleccionado = t; this.modalVisible.set(true); this.historiaForm.reset(); this.mensajeModal.set('');
  }


  cerrarModal() { this.modalVisible.set(false); this.turnoSeleccionado = null; }

  async guardarHistoria() {
    if (!this.turnoSeleccionado) return;
    if (this.historiaForm.invalid) { this.mensajeModal.set('Complete todos los campos.'); return; }
    const f = this.historiaForm.value;
    const datosExtra: any = {
      [f.clave1]: f.valor1,
      [f.clave2]: f.valor2,
      [f.clave3]: f.valor3,

      nivel_dolor: f.rangoControl,
    glucosa: f.numeroControl,
    fuma: f.switchControl ? 'Sí' : 'No'

    };
    const historia = {
      paciente_id: this.turnoSeleccionado.paciente_id,
      altura: f.altura,
      peso: f.peso,
      temperatura: f.temperatura,
      presion: f.presion,
      datos_extra: datosExtra
    };
    try {
      await this.db.guardarHistoriaClinica(historia);
      const txt = this.comentario()[this.turnoSeleccionado.id!] || '';
      await this.db.finalizarTurno(this.turnoSeleccionado.id!, txt);
      this.cerrarModal();
      await this.cargarDatos();
    } catch { this.mensajeModal.set('Error al guardar la historia clínica.'); }
  }

  actualizarComentario(id: string, txt: string) { this.comentario.set({ ...this.comentario(), [id]: txt }); }
  actualizarFiltroEspecialidad(v: string) { this.filtro.set({ ...this.filtro(), filtroEspecialidad: v }); }
  actualizarFiltroPaciente(v: string) { this.filtro.set({ ...this.filtro(), filtroPaciente: v }); }

  async cerrarSesion() {
    await this.auth.logout();
    window.location.href = '/home';
  }


  /*   seleccionarPaciente(p: any) {
      this.pacienteSeleccionado = p;
      this.resetSelecciones(true);
      this.especialidades.set(this.especialidades().slice(0, 10));
    } */


  async seleccionarEspecialista(est: EspecialistaCard) {
    console.log("seleccionarEspecialista");

    this.especialistaSeleccionado = est;
    
//console.log(est.especialidades);
//console.log("seleccionarEspecialista GG");
//console.log(this.especialidadSeleccionada);


      this.especialidades.set(this.especialidades().slice(0, 10));
    this.nombreEspecialistaSeleccionado = `${est.nombre} ${est.apellido}`;
    this.resetHorarios();
    this.loadingFechas = true;
    console.log("antes de  obtenerFechasDisponibles");
   // console.log(est);
console.log(this.usuarioActual.id);

    const fechas = await this.db.obtenerFechasDisponibles(this.usuarioActual.id, 14);
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





  private resetSelecciones(keepPaciente = false) {
    if (!keepPaciente) this.pacienteSeleccionado = this.pacienteSeleccionado;
    this.especialistaSeleccionado = null; this.horariosDisponibles.set([]);
    this.horarioSeleccionado = null;
  }



    async seleccionarFecha(fecha: string) {
  this.fechaSeleccionada = fecha;

  console.log("SELECCIONA FECHA");
 console.log( this.especialistaSeleccionado.user_auth_id),

   //console.log( this.especialistaSeleccionado.especialidad)
     console.log("FUNCION seleccionarFecha")


  try {
    console.log(this.usuarioActual.id, fecha);

    const horarios = await this.db.obtenerHorariosDisponibles(this.usuarioActual.id, fecha);
    const horariosStrings = horarios?.map((h: { horario_disponible: string }) => h.horario_disponible) || [];
    this.horariosDisponibles.set(horariosStrings);
  } catch (error) {
    console.error("Error al obtener horarios disponibles:", error);
  }
}


horasParaFecha(): string[] {
  return this.horariosDisponibles();
}


  seleccionarHorario(h: { horario: string; fecha: string }) {
    console.log("FUNCION ANTES DE seleccionarHorario: paciente_id ", this.especialistaSeleccionado.user_auth_id);
    console.log("FUNCION ANTES DE seleccionarHorario: especialista_id ",this.usuarioActual.id );
    console.log("FUNCION ANTES DE seleccionarHorario: especialidad ",this.especialidadSeleccionada );
    
    
    //console.log(this.especialidadSeleccionada);


  

    this.horarioSeleccionado = h;
  }


  formatearHora(h: string): string {
    const [hh, mm] = h.split(':'); let hr = +hh;
    const suf = hr >= 12 ? 'pm' : 'am'; hr = hr % 12; if (hr === 0) hr = 12;
    return `${hr.toString().padStart(2, '0')}:${mm} ${suf}`;
  }



cancelarSeleccion() { 
    
  //  this.resetSelecciones(); 
  this.resetHorarios();
 
    this.especialistaSeleccionado = null;
    this.nombreEspecialistaSeleccionado = '';
  
  }



//  async confirmarTurno() {

// /* console.log ("confirmarTurno paciente_id", this.especialistaSeleccionado.user_auth_id),
// console.log ("confirmarTurno especialista_id",this.usuarioActual.id),
// console.log ("confirmarTurno paciente_id",  this.especialidadSeleccionada),
// console.log ("confirmarTurno fechaHora",  this.horarioSeleccionado) */


//     if (!this.especialistaSeleccionado || !this.usuarioActual || !this.horarioSeleccionado || !this.especialidadSeleccionada ) return;

//     const fechaHora = `${this.horarioSeleccionado.fecha}T${this.horarioSeleccionado.horario}`;
//     await this.db.solicitarTurno({
//       paciente_id:  this.especialistaSeleccionado.user_auth_id,//this.pacienteSeleccionado.user_auth_id,
//       especialista_id: this.usuarioActual.id,
//       especialidad: this.especialidadSeleccionada,//this.usuarioActual,
//       fecha_hora: fechaHora,
//       estado: 'solicitado'
//     } as Turno);
//     await this.cargarDatos(); this.mensaje.set({ texto: 'Turno creado.', tipo: 'success' }); this.cancelarSeleccion();
//   }

  
async confirmarTurno() {
  if (
    this.especialistaSeleccionado &&
    this.usuarioActual &&
    this.horarioSeleccionado &&
    this.especialidadSeleccionada
  ) {
    const fechaHora = `${this.horarioSeleccionado.fecha}T${this.horarioSeleccionado.horario}`;
    await this.db.solicitarTurno({
      paciente_id: this.especialistaSeleccionado.user_auth_id,
      especialista_id: this.usuarioActual.id,
      especialidad: this.especialidadSeleccionada,
      fecha_hora: fechaHora,
      estado: 'solicitado'
    } as Turno);

    await this.cargarDatos();
    this.mensaje.set({ texto: 'Turno creado.', tipo: 'success' });
    this.cancelarSeleccion();
  } else {
    console.warn('Faltan datos para confirmar el turno:', {
      especialistaSeleccionado: this.especialistaSeleccionado,
      usuarioActual: this.usuarioActual,
      horarioSeleccionado: this.horarioSeleccionado,
      especialidadSeleccionada: this.especialidadSeleccionada
    });

    this.mensaje.set({
      texto: 'Faltan datos para confirmar el turno. Verificá todos los campos.',
      tipo: 'warning'
    });
  }
}



seleccionarEspecialidad(e: string) { this.especialidadSeleccionada = e; this.resetSelecciones(); this.resetHorarios(); }



}
