// ...existing code...
// (eliminado: definición fuera de clase)
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Turno, Encuesta, Disponibilidad, Especialidad, EspecialistaCard } from '../models/interfaces-turnos';

@Injectable({
  providedIn: 'root'
})
export class SupabaseDbService {
  /**
   * Devuelve un objeto: { [especialidad]: [{nombre, apellido, edad} ...] } solo para pacientes
   */
  async obtenerPacientesPorEspecialidad() {
    // 1. Obtener todos los turnos realizados y sus especialidades y paciente_id
    const { data: turnos, error: errorTurnos } = await this.supabase
      .from('vista_turnos_con_nombres')
      .select('paciente_id, especialidad');
    if (errorTurnos) throw errorTurnos;

    // 2. Filtrar turnos con paciente_id válido (no null, no undefined, no empty string)
    const validTurnos = turnos.filter(t => t.paciente_id && typeof t.paciente_id === 'string' && t.paciente_id.length === 36);
    const pacienteIds = [...new Set(validTurnos.map(t => t.paciente_id))];
    let pacientes: Array<{user_auth_id: string, nombre: string, apellido: string, edad: number}> = [];
    if (pacienteIds.length) {
      const { data: usuarios, error: errorUsuarios } = await this.supabase
        .from('usuarios')
        .select('user_auth_id, nombre, apellido, edad')
        .in('user_auth_id', pacienteIds);
      if (errorUsuarios) throw errorUsuarios;
      pacientes = usuarios;
    }

    // 3. Agrupar por especialidad
    const resultado: { [key: string]: Array<{nombre: string, apellido: string, edad: number}> } = {};
    for (const turno of validTurnos) {
      const paciente = pacientes.find(p => p.user_auth_id === turno.paciente_id);
      if (!paciente) continue;
      const esp = turno.especialidad;
      if (!resultado[esp]) resultado[esp] = [];
      // Evitar duplicados
      if (!resultado[esp].some(p => p.nombre === paciente.nombre && p.apellido === paciente.apellido && p.edad === paciente.edad)) {
        resultado[esp].push({ nombre: paciente.nombre, apellido: paciente.apellido, edad: paciente.edad });
      }
    }
    return resultado;
  }
  /**
   * Devuelve un objeto: { [especialidad]: [{nombre, apellido, edad} ...] }
   */
  async obtenerMedicosPorEspecialidad() {
    const { data: usuarios, error } = await this.supabase
      .from('usuarios')
      .select('nombre, apellido, edad, especialidades')
      .eq('perfil', 'especialista');
    if (error) throw error;
    // Mapear especialistas por especialidad
    const resultado: { [key: string]: Array<{nombre: string, apellido: string, edad: number}> } = {};
    for (const usuario of usuarios) {
      if (Array.isArray(usuario.especialidades)) {
        for (const esp of usuario.especialidades) {
          if (!resultado[esp]) resultado[esp] = [];
          resultado[esp].push({ nombre: usuario.nombre, apellido: usuario.apellido, edad: usuario.edad });
        }
      }
    }
    return resultado;
  }

  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
  }

  /**
   * Alias para compatibilidad con componentes existentes
   */
  async getEncuestas() {
    return await this.obtenerTodasLasEncuestas();
  }

  async obtenerTodasLasEncuestas() {
    const { data, error } = await this.supabase.from('encuestas').select('*');
    if (error) throw error;
    return data;
  }





  async obtenerUsuarioActual(userAuthId: string) {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('*')
      .eq('user_auth_id', userAuthId)
      .single();
    if (error) throw error;
    return data;
  }

  async obtenerTodosLosUsuarios() {
    const { data, error } = await this.supabase.from('usuarios').select('*');
    if (error) throw error;
    return data;
  }

  async actualizarEstadoEspecialista(userAuthId: string, habilitado: boolean) {
    const { error } = await this.supabase
      .from('usuarios')
      .update({ habilitado })
      .eq('user_auth_id', userAuthId);
    if (error) throw error;
  }

  async registrarLoginUsuario(userAuthId: string, email: string) {
    const { error } = await this.supabase
      .from('logins')
      .insert([{ user_auth_id: userAuthId, email, fecha_login: new Date().toISOString() }]);
    if (error) throw error;
  }

  async agregarEspecialidad(nombre: string) {
    const { error } = await this.supabase.from('especialidades').insert([{ nombre }]);
    if (error) throw error;
  }

  async obtenerEspecialidades() {
    const { data, error } = await this.supabase
      .from('especialidades')
      .select('nombre')
      .order('nombre', { ascending: true });
    if (error) throw error;
    return data.map((esp: { nombre: string }) => esp.nombre);
  }

  async obtenerEspecialidadesConImagen(): Promise<Especialidad[]> {
    const { data, error } = await this.supabase
      .from('especialidades')
      .select('nombre, imagen_url')
      .order('nombre', { ascending: true });
    if (error) throw error;
    return data as Especialidad[];
  }

  getCliente() {
    return this.supabase;
  }

  async solicitarTurno(turno: Turno) {
    const { error } = await this.supabase.from('turnos').insert(turno);
    if (error) throw error;
  }

  async cancelarTurno(turnoId: string, motivo: string) {
    const { error } = await this.supabase
      .from('turnos')
      .update({ estado: 'cancelado', motivo_cancelacion: motivo })
      .eq('id', turnoId);
    if (error) throw error;
  }

  async rechazarTurno(turnoId: string, motivo: string) {
    const { error } = await this.supabase
      .from('turnos')
      .update({ estado: 'rechazado', motivo_rechazo: motivo })
      .eq('id', turnoId);
    if (error) throw error;
  }

  async aceptarTurno(turnoId: string) {
    const { error } = await this.supabase
      .from('turnos')
      .update({ estado: 'aceptado' })
      .eq('id', turnoId);
    if (error) throw error;
  }

  async finalizarTurno(turnoId: string, comentario: string) {
    const { error } = await this.supabase
      .from('turnos')
      .update({ estado: 'realizado', comentario_especialista: comentario })
      .eq('id', turnoId);
    if (error) throw error;
  }

  async guardarCalificacion(turnoId: string, comentario: string) {
    const { error } = await this.supabase
      .from('turnos')
      .update({ calificacion_paciente: comentario })
      .eq('id', turnoId);
    if (error) throw error;
  }

  async obtenerTurnosPorUsuario(usuarioId: string, tipo: 'paciente' | 'especialista') {
    const columna = tipo === 'paciente' ? 'paciente_id' : 'especialista_id';
    const { data, error } = await this.supabase
      .from('vista_turnos_con_nombres')
      .select('*')
      .eq(columna, usuarioId);
    if (error) throw error;
    return data;
  }

  async crearEncuesta(encuesta: Encuesta) {
    const { data, error } = await this.supabase.from('encuestas').insert(encuesta).select().single();
    if (error) throw error;
    return data;
  }

  async obtenerEncuestaPorTurno(turnoId: string) {
    const { data, error } = await this.supabase
      .from('encuestas')
      .select('*')
      .eq('turno_id', turnoId)
      .single();
    if (error) throw error;
    return data;
  }

  async guardarDisponibilidad(disponibilidad: Disponibilidad) {
    const { error } = await this.supabase.from('disponibilidades').insert(disponibilidad);
    if (error) throw error;
  }

  async obtenerDisponibilidadPorEspecialista(especialistaId: string) {
    const { data, error } = await this.supabase
      .from('disponibilidades')
      .select('*')
      .eq('especialista_id', especialistaId);
    if (error) throw error;
    return data;
  }

  async obtenerHorariosDisponibles(especialistaId: string, fecha: string) {
    const { data, error } = await this.supabase.rpc('buscar_horarios_disponibles', {
      especialista_id_input: especialistaId,
      fecha_input: fecha
    });
    if (error) throw error;
    return data;
  }

  async obtenerTodosLosTurnos() {
    const { data, error } = await this.supabase.from('vista_turnos_con_nombres').select('*');
    if (error) throw error;
    return data;
  }

  async obtenerPacientesAtendidos(especialistaAuthId: string) {
    const { data: turnos, error: errTurnos } = await this.supabase
      .from('vista_turnos_con_nombres')
      .select('paciente_id')
      .eq('especialista_id', especialistaAuthId)
      .eq('estado', 'realizado');
    if (errTurnos) throw errTurnos;
    const ids = [...new Set(turnos.map(t => t.paciente_id))];
    if (!ids.length) return [];
    const { data: pacientes, error: errPac } = await this.supabase
      .from('usuarios')
      .select('user_auth_id, nombre, apellido, avatar_url')
      .in('user_auth_id', ids);
    if (errPac) throw errPac;
    return pacientes;
  }

  async obtenerTurnosPacienteEspecialista(pacienteAuthId: string, especialistaAuthId?: string) {
    let query = this.supabase
      .from('vista_turnos_con_nombres')
      .select('*')
      .eq('paciente_id', pacienteAuthId);
    if (especialistaAuthId) query = query.eq('especialista_id', especialistaAuthId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

/*   async guardarHistoriaClinica(historia: any) {
    console.log(historia);
    const { error } = await this.supabase.from('historias_clinicas').insert(historia);
    if (error) throw error;
  }
 */


async guardarHistoriaClinica(historia: any) {
  const historiaFormateada = {
    paciente_id: historia.paciente_id,
    detalle: {
      altura: parseFloat(historia.altura),
      peso: parseFloat(historia.peso),
      temperatura: parseFloat(historia.temperatura),
      presion: historia.presion,
      datos_extra: historia.datos_extra // esto ya es un objeto, está bien así
    },
    fecha_creacion: new Date().toISOString() // opcional, solo si querés controlar la fecha manualmente
  };

  console.log(historiaFormateada);

  const { error } = await this.supabase.from('historias_clinicas').insert(historiaFormateada);
  if (error) throw error;
}



  async obtenerHistoriaClinica(pacienteAuthId: string) {
    const { data, error } = await this.supabase
      .from('historias_clinicas')
      .select('*')
      .eq('paciente_id', pacienteAuthId)
      .order('fecha_creacion', { ascending: false })
      .limit(1)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async obtenerLogIngresos() {
    const { data, error } = await this.supabase
      .from('logins')
      .select('email, fecha_login')
      .limit(20)
      .order('fecha_login', { ascending: false });
    if (error) throw error;
    return data;
  }

  async obtenerTurnosPorEspecialidad() {
    const { data, error } = await this.supabase
      .from('vista_turnos_con_nombres')
      .select('especialidad')
    //   .eq('estado', 'realizado');

    if (error) throw error;
    const mapa: Record<string, number> = {};
    data.forEach(({ especialidad }) => {
      mapa[especialidad] = (mapa[especialidad] ?? 0) + 1;
    });

    return Object.entries(mapa).map(([nombre, total]) => ({ nombre, total }));
  }

  async obtenerTurnosPorDia() {
    const { data, error } = await this.supabase
      .from('vista_turnos_con_nombres')
      .select('fecha_hora');

    if (error) throw error;

    const mapa: Record<string, number> = {};
    data.forEach(({ fecha_hora }) => {
      const dia = new Date(fecha_hora).toISOString().substring(0, 10); // yyyy-mm-dd
      mapa[dia] = (mapa[dia] ?? 0) + 1;
    });

    return Object.entries(mapa)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, total]) => ({ fecha, total }));
  }

  async obtenerTurnosPorMedico(desdeIso: string, hastaIso: string) {
    const { data, error } = await this.supabase
      .from('vista_turnos_con_nombres')
      .select('nombre_especialista')
      .gte('fecha_hora', desdeIso)
      .lte('fecha_hora', hastaIso);

    if (error) throw error;

    const mapa: Record<string, number> = {};
    data.forEach(({ nombre_especialista }) => {
      mapa[nombre_especialista] = (mapa[nombre_especialista] ?? 0) + 1;
    });

    return Object.entries(mapa).map(([nombre, total]) => ({ nombre, total }));
  }

  async obtenerTurnosFinalizadosPorMedico(desdeIso: string, hastaIso: string) {
    const { data, error } = await this.supabase
      .from('vista_turnos_con_nombres')
      .select('nombre_especialista')
      .eq('estado', 'realizado')
      .gte('fecha_hora', desdeIso)
      .lte('fecha_hora', hastaIso);

    if (error) throw error;

    const mapa: Record<string, number> = {};
    data.forEach(({ nombre_especialista }) => {
      mapa[nombre_especialista] = (mapa[nombre_especialista] ?? 0) + 1;
    });

    return Object.entries(mapa).map(([nombre, total]) => ({ nombre, total }));
  }

  async obtenerTurnosSolicitadosMedico(
    desdeIso: string,
    hastaIso: string
  ): Promise<{ nombre_especialista: string; total: number }[]> {
    const { data, error } = await this.supabase
      .from('vista_turnos_con_nombres')
      .select('nombre_especialista')
      .eq('estado', 'solicitado')
      .gte('fecha_hora', desdeIso)
      .lte('fecha_hora', hastaIso);

    if (error) throw error;

    const conteo: Record<string, number> = {};
    data.forEach(({ nombre_especialista }) => {
      conteo[nombre_especialista] = (conteo[nombre_especialista] ?? 0) + 1;
    });

    return Object.entries(conteo).map(([nombre_especialista, total]) => ({
      nombre_especialista,
      total
    }));
  }

  async obtenerEspecialistasPorEspecialidad(nombreEsp: string): Promise<EspecialistaCard[]> {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('user_auth_id, nombre, apellido, avatar_url, especialidades')
      .contains('especialidades', [nombreEsp])
      .eq('perfil', 'especialista')
      .eq('habilitado', true);
    if (error) throw error;
    return data as EspecialistaCard[];
  }

  async obtenerFechasDisponibles(
    especialistaId: string,
    diasFuturos: number = 14
  ): Promise<string[]> {
    const hoy = new Date();
    const fechas: string[] = [];

    for (let i = 0; i <= diasFuturos; i++) {
      const date = new Date(hoy);
      date.setDate(hoy.getDate() + i);
      const iso = date.toISOString().substring(0, 10); // YYYY-MM-DD

      const { data, error } = await this.supabase.rpc('buscar_horarios_disponibles', {
        especialista_id_input: especialistaId,
        fecha_input: iso
      });

      if (error) throw error;
      if (Array.isArray(data) && data.length) {
        fechas.push(iso);
      }
    }

    return fechas;
  }


  async obtenerTurnosDePaciente(pacienteAuthId: string): Promise<Turno[]> {
    const { data, error } = await this.supabase
      .from('vista_turnos_con_nombres')
      .select('*')
      .eq('paciente_id', pacienteAuthId);

    if (error) throw error;
    return data as Turno[];
  }
}
