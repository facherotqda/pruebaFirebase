import Chart from 'chart.js/auto';
import { Component, OnInit, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupByFechaPipe } from '../../pipes/group-by-fecha.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import jsPDF from 'jspdf';

import { SupabaseDbService } from '../../services/supabase-db.service';
import { CredencialesService } from '../../services/credenciales.service';

import { LogIngresosComponent } from '../log-ingresos/log-ingresos.component';
import { TurnosEspecialidadComponent } from '../turnos-especialidad/turnos-especialidad.component';
import { TurnosDiaComponent } from '../turnos-dia/turnos-dia.component';
import { TurnosSolicitadosMedicoComponent } from '../turnos-solicitados-medico/turnos-solicitados-medico.component';
import { TurnosFinalizadosMedicoComponent } from '../turnos-finalizados-medico/turnos-finalizados-medico.component';

@Component({
  selector: 'app-estadisticas2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    
    TurnosEspecialidadComponent,
    TurnosDiaComponent,
    TurnosSolicitadosMedicoComponent,
    TurnosFinalizadosMedicoComponent
    , GroupByFechaPipe
  ],
  templateUrl: './estadisticas2.component.html',
  styleUrls: ['./estadisticas2.component.css']
})
export class Estadisticas2Component implements OnInit {
  async descargarReporteVisitas() {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1000, 400] });
    // Logo
    const logo = await this.base64Image('assets/img/logoClinica.png');
    doc.addImage(logo, 'PNG', 450, 10, 100, 100);
    doc.setFontSize(18);
    doc.text('Cantidad de visitas por fecha', 500, 130, { align: 'center' });
    // Gráfico en la primera hoja
    const canvas = document.getElementById('grafVisitas') as HTMLCanvasElement;
    if (canvas) {
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 100, 150, 800, 180);
    }
    // Tabla en las siguientes hojas
    doc.addPage();
    let y = 40;
    doc.setFontSize(16);
    // Encabezado de tabla alineado
    doc.text('Fecha', 100, y);
    doc.text('Cantidad', 300, y);
    y += 24;
    // Agrupar visitas por fecha
    const visitasPorFecha: { [fecha: string]: number } = {};
    for (const v of this.visitas) {
      visitasPorFecha[v.fecha] = (visitasPorFecha[v.fecha] || 0) + 1;
    }
    const fechas = Object.keys(visitasPorFecha).sort();
    for (const fecha of fechas) {
      doc.text(fecha, 100, y);
      doc.text(String(visitasPorFecha[fecha]), 300, y);
      y += 20;
      if (y > 380) {
        doc.addPage();
        y = 40;
      }
    }
    doc.save('reporte-visitas.pdf');
  }
  // --- VISITAS: nombre, apellido, email, fecha, hora ---
  visitas: Array<{ nombre: string, apellido: string, email: string, fecha: string, hora: string }> = [];
  chartVisitas: Chart | null = null;

  async cargarVisitas() {
    // 1. Obtener logs con user_auth_id, email, fecha_login
    const logsRaw = await this.db.getCliente()
      .from('logins')
      .select('user_auth_id, email, fecha_login')
      .order('fecha_login', { ascending: false })
      .limit(200);
    const logs = logsRaw.data || [];
    // 2. Obtener usuarios únicos
    const userIds = [...new Set(logs.map((l: any) => l.user_auth_id))];
    let usuarios: Array<{ user_auth_id: string, nombre: string, apellido: string }> = [];
    if (userIds.length) {
      const usuariosRaw = await this.db.getCliente()
        .from('usuarios')
        .select('user_auth_id, nombre, apellido')
        .in('user_auth_id', userIds);
      usuarios = usuariosRaw.data || [];
    }
    // 3. Unir datos
    this.visitas = logs.map((l: any) => {
      const u = usuarios.find(u => u.user_auth_id === l.user_auth_id);
      const d = new Date(l.fecha_login);
      // Usar solo YYYY-MM-DD para agrupar por día
      const fechaDia = d.toISOString().substring(0, 10);
      return {
        nombre: u?.nombre || '',
        apellido: u?.apellido || '',
        email: l.email,
        fecha: fechaDia,
        hora: d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };
    });
  }

  graficarVisitas() {
  const ctx = document.getElementById('grafVisitas') as HTMLCanvasElement;
  if (!ctx) return;
  // Aumentar el ancho y el padding inferior del canvas para más espacio
  ctx.width = 1200;
  ctx.height = 400;
  ctx.style.width = '1200px';
  ctx.style.height = '400px';
  if (this.chartVisitas) this.chartVisitas.destroy();
    // Agrupar visitas por fecha
    const visitasPorFecha: { [fecha: string]: Array<{ nombre: string, apellido: string, email: string }> } = {};
    for (const v of this.visitas) {
      if (!visitasPorFecha[v.fecha]) visitasPorFecha[v.fecha] = [];
      visitasPorFecha[v.fecha].push({ nombre: v.nombre, apellido: v.apellido, email: v.email });
    }
    const fechas = Object.keys(visitasPorFecha).sort();
    const cantidades = fechas.map(f => visitasPorFecha[f].length);
    // Etiquetas personalizadas para tooltip: lista de nombres/email por fecha
    this.chartVisitas = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: fechas,
        datasets: [{
          label: 'Cantidad de visitas',
          data: cantidades,
          backgroundColor: '#007bff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => `Fecha: ${items[0].label}`,
              label: (item) => {
                const fecha = item.label;
                const usuarios = visitasPorFecha[fecha] || [];
                if (!usuarios.length) return 'Sin visitas';
                return usuarios.map(u => {
                  let nombre = (u.nombre && u.apellido) ? `${u.nombre} ${u.apellido}` : '';
                  if (!nombre) {
                    // Acortar email si es largo
                    nombre = u.email.length > 18 ? u.email.slice(0, 15) + '...' : u.email;
                  }
                  return nombre;
                }).join(', ');
              }
            },
            bodyFont: { size: 16 },
            titleFont: { size: 16 }
          }
        },
        scales: {
          x: {
            ticks: {
              font: { size: 20, weight: 'bold' },
              color: '#212529',
              padding: 20,
              maxRotation: 60,
              minRotation: 45,
              autoSkip: false
            },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { font: { size: 14 }, color: '#212529', stepSize: 1 },
            grid: { color: '#e9ecef' }
          }
        }
      }
    });
  }
  onPacienteSelectEvent(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select ? select.value : '';
    this.onPacienteSeleccionado(value);
  }
  async descargarReportePacientes() {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1000, 400] });
    // Logo
    const logo = await this.base64Image('assets/img/logoClinica.png');
    doc.addImage(logo, 'PNG', 450, 10, 100, 100);
    doc.setFontSize(18);
    doc.text('Pacientes por especialidad', 500, 130, { align: 'center' });
    // Gráfico en la primera hoja
    const canvas = document.getElementById('grafPacientesEspecialidad') as HTMLCanvasElement;
    if (canvas) {
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 100, 150, 800, 180);
    }
    // Lista en las siguientes hojas
    doc.addPage();
    let y = 40;
    doc.setFontSize(14);
    // Encabezado de tabla alineado
    doc.text('Especialidad', 100, y);
    doc.text('Nombre', 250, y);
    doc.text('Apellido', 400, y);
    doc.text('Edad', 550, y);
    y += 24;
    for (const esp of Object.keys(this.pacientesPorEspecialidad)) {
      for (const paciente of this.pacientesPorEspecialidad[esp]) {
        doc.text(esp, 100, y);
        doc.text(paciente.nombre, 250, y);
        doc.text(paciente.apellido, 400, y);
        doc.text(String(paciente.edad), 550, y);
        y += 20;
        if (y > 380) {
          doc.addPage();
          y = 40;
        }
      }
    }
    doc.save('reporte-pacientes-especialidad.pdf');
  }
  pacientesPorEspecialidad: { [key: string]: Array<{nombre: string, apellido: string, edad: number}> } = {};
  chartPacientes: Chart | null = null;

    // --- NUEVO: Turnos por paciente seleccionado ---
    pacientes: Array<{ paciente_id: string, nombre: string, apellido: string }> = [];
    turnos: Array<{ paciente_id: string, estado: string, especialidad: string, fecha_hora: string, nombre_paciente: string, apellido_paciente: string }> = [];
    pacienteSeleccionado: string = '';
    turnosFiltrados: Array<{ estado: string, especialidad: string, fecha_hora: string }> = [];
    chartTurnosPaciente: Chart | null = null;

  async cargarPacientesPorEspecialidad() {
    try {
      this.pacientesPorEspecialidad = await this.db.obtenerPacientesPorEspecialidad();
      console.log('Pacientes por especialidad:', this.pacientesPorEspecialidad);
      this.graficarPacientesPorEspecialidad();
    } catch (error) {
      this.pacientesPorEspecialidad = {};
      console.error('Error al cargar pacientes por especialidad:', error);
    }
  }

  graficarPacientesPorEspecialidad() {
    const ctx = document.getElementById('grafPacientesEspecialidad') as HTMLCanvasElement;
    if (!ctx) return;
    const especialidades = Object.keys(this.pacientesPorEspecialidad);
    const cantidades = especialidades.map(e => this.pacientesPorEspecialidad[e].length);
    if (this.chartPacientes) this.chartPacientes.destroy();
    // Colores alternos para barras
    const colores = [
      '#007bff', '#28a745', '#ffc107', '#17a2b8', '#6610f2', '#fd7e14', '#dc3545', '#20c997', '#6f42c1', '#343a40'
    ];
    this.chartPacientes = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: especialidades,
        datasets: [{
          label: 'Cantidad de pacientes',
          data: cantidades,
          backgroundColor: especialidades.map((_, i) => colores[i % colores.length]),
          borderWidth: 4,
          barPercentage: 0.85,
          categoryPercentage: 0.7
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: false },
          tooltip: { bodyFont: { size: 22, weight: 'bold' }, titleFont: { size: 22, weight: 'bold' } }
        },
        scales: {
          x: {
            ticks: {
              font: { size: 28, weight: 'bold' },
              color: '#212529',
              padding: 24,
              maxRotation: 0,
              minRotation: 0,
              autoSkip: false
            },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { font: { size: 24, weight: 'bold' }, color: '#212529', stepSize: 1 },
            grid: { color: '#e9ecef' }
          }
        }
      }
    });
  }
  async descargarReporteMedicos() {
    const canvas = document.getElementById('grafMedicosEspecialidad') as HTMLCanvasElement;
    if (!canvas) return;
    const imgData = canvas.toDataURL('image/png');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1000, 400] });
    // Logo
    const logo = await this.base64Image('assets/img/logoClinica.png');
    doc.addImage(logo, 'PNG', 450, 10, 100, 100);
    doc.setFontSize(18);
    doc.text('Médicos por especialidad', 500, 130, { align: 'center' });
    doc.addImage(imgData, 'PNG', 100, 150, 800, 180);
    // Lista en las siguientes hojas
    doc.addPage();
    let y = 40;
    doc.setFontSize(14);
    // Encabezado de tabla alineado
    doc.text('Especialidad', 100, y);
    doc.text('Nombre', 250, y);
    doc.text('Apellido', 400, y);
    doc.text('Edad', 550, y);
    y += 24;
    for (const esp of Object.keys(this.medicosPorEspecialidad)) {
      for (const medico of this.medicosPorEspecialidad[esp]) {
        doc.text(esp, 100, y);
        doc.text(medico.nombre, 250, y);
        doc.text(medico.apellido, 400, y);
        doc.text(String(medico.edad), 550, y);
        y += 20;
        if (y > 380) {
          doc.addPage();
          y = 40;
        }
      }
    }
    doc.save('reporte-medicos-especialidad.pdf');
  }
  medicosPorEspecialidad: { [key: string]: Array<{nombre: string, apellido: string, edad: number}> } = {};
  chartMedicos: Chart | null = null;

  async cargarMedicosPorEspecialidad() {
    try {
      this.medicosPorEspecialidad = await this.db.obtenerMedicosPorEspecialidad();
      this.graficarMedicosPorEspecialidad();
    } catch (error) {
      this.medicosPorEspecialidad = {};
      console.error('Error al cargar médicos por especialidad:', error);
    }
  }

  graficarMedicosPorEspecialidad() {
    const ctx = document.getElementById('grafMedicosEspecialidad') as HTMLCanvasElement;
    if (!ctx) return;
    const especialidades = Object.keys(this.medicosPorEspecialidad);
    const cantidades = especialidades.map(e => this.medicosPorEspecialidad[e].length);
    if (this.chartMedicos) this.chartMedicos.destroy();
    // Colores alternos para barras
    const colores = [
      '#007bff', '#28a745', '#ffc107', '#17a2b8', '#6610f2', '#fd7e14', '#dc3545', '#20c997', '#6f42c1', '#343a40'
    ];
    this.chartMedicos = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: especialidades,
        datasets: [{
          label: 'Cantidad de médicos',
          data: cantidades,
          backgroundColor: especialidades.map((_, i) => colores[i % colores.length]),
          borderWidth: 4,
          barPercentage: 0.85,
          categoryPercentage: 0.7
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: false },
          tooltip: { bodyFont: { size: 22, weight: 'bold' }, titleFont: { size: 22, weight: 'bold' } }
        },
        scales: {
          x: {
            ticks: {
              font: { size: 28, weight: 'bold' },
              color: '#212529',
              padding: 24,
              maxRotation: 0,
              minRotation: 0,
              autoSkip: false
            },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { font: { size: 24, weight: 'bold' }, color: '#212529', stepSize: 1 },
            grid: { color: '#e9ecef' }
          }
        }
      }
    });
  }

  async descargarReporteEncuestas() {
    const canvas = document.getElementById('grafEncuestas') as HTMLCanvasElement;
    if (!canvas) return;
    const imgData = canvas.toDataURL('image/png');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1200, 400] });
    // Cargar logo
    const logo = await this.base64Image('assets/img/logoClinica.png');
    doc.addImage(logo, 'PNG', 350, 10, 100, 100);
    doc.setFontSize(18);
    doc.text('Resultados de encuestas a clientes', 400, 130, { align: 'center' });
    doc.addImage(imgData, 'PNG', 50, 150, 700, 220);
    // Tabla única: Comentario, Estrellas, Volvería, Aspectos, Satisfacción (mismo orden y campos que la vista)
    doc.addPage();
    let y = 40;
    doc.setFontSize(14);
  doc.text('Comentario', 100, y);
  doc.text('Estrellas', 350, y);
  doc.text('Volvería', 550, y);
  doc.text('Aspectos', 750, y);
  doc.text('Satisfacción', 1000, y);
    y += 24;
    for (const encuesta of this.encuestas) {
  doc.text(encuesta.comentario || '', 100, y);
  doc.text(String(encuesta.estrellas), 350, y);
  doc.text(encuesta.volveria || '', 550, y);
  let aspectos = Array.isArray(encuesta.aspectos) ? encuesta.aspectos.join(', ') : (encuesta.aspectos || '');
  doc.text(aspectos, 750, y);
  doc.text(String(encuesta.satisfaccion || ''), 1000, y);
      y += 20;
      if (y > 380) {
        doc.addPage();
        y = 40;
      }
    }
    doc.save('reporte-encuestas-clientes.pdf');
  }
  encuestas: any[] = [];
  chartEncuestas: Chart | null = null;
  private auth = inject(CredencialesService);
  private db: SupabaseDbService;

  readonly desde = signal<string>('');
  readonly hasta = signal<string>('');

  @ViewChild('grafDia') grafDia!: TurnosDiaComponent;
  @ViewChild('grafEsp') grafEsp!: TurnosEspecialidadComponent;
  @ViewChild('grafSol') grafSol!: TurnosSolicitadosMedicoComponent;
  @ViewChild('grafFin') grafFin!: TurnosFinalizadosMedicoComponent;

  constructor(db: SupabaseDbService) {
    this.db = db;
  }
  ngOnInit(): void { }

  async ngAfterViewInit() {
    await this.cargarVisitas();
    this.graficarVisitas();
    await this.cargarEncuestas();
    this.graficarEncuestas();
    await this.cargarMedicosPorEspecialidad();
    await this.cargarPacientesPorEspecialidad();
    await this.cargarTurnosPorPaciente();
  }

  // --- NUEVO: Cargar turnos y pacientes ---
  async cargarTurnosPorPaciente() {
    // Usar el método existente para obtener todos los turnos
    this.turnos = await this.db.obtenerTodosLosTurnos();
    // Extraer pacientes únicos
    const pacientesMap: { [id: string]: { paciente_id: string, nombre: string, apellido: string } } = {};
    for (const t of this.turnos) {
      pacientesMap[t.paciente_id] = {
        paciente_id: t.paciente_id,
        nombre: t.nombre_paciente,
        apellido: t.apellido_paciente
      };
    }
    this.pacientes = Object.values(pacientesMap);
  }

  onPacienteSeleccionado(id: string) {
    this.pacienteSeleccionado = id;
    this.turnosFiltrados = this.turnos.filter(t => t.paciente_id === id);
    this.graficarTurnosPorPaciente();
  }

  graficarTurnosPorPaciente() {
    const ctx = document.getElementById('grafTurnosPaciente') as HTMLCanvasElement;
    if (!ctx) return;
    if (this.chartTurnosPaciente) this.chartTurnosPaciente.destroy();
    // Etiquetas: especialidad + estado + fecha/hora
    const labels = this.turnosFiltrados.map(t => `${t.especialidad} | ${t.estado} | ${t.fecha_hora}`);
    const data = this.turnosFiltrados.map(() => 1); // Solo para mostrar barras
    this.chartTurnosPaciente = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Turnos',
          data,
          backgroundColor: '#17a2b8',
          borderWidth: 2
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: false },
          tooltip: { bodyFont: { size: 16 }, titleFont: { size: 16 } }
        },
        scales: {
          x: {
            ticks: { font: { size: 12 }, color: '#212529', autoSkip: false },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { font: { size: 14 }, color: '#212529', stepSize: 1 },
            grid: { color: '#e9ecef' }
          }
        }
      }
    });
  }


  async cargarEncuestas() {
    // Consulta a la tabla encuestas
    try {
      this.encuestas = await this.db.getEncuestas();
      console.log('Encuestas cargadas:', this.encuestas);
    } catch (error) {
      this.encuestas = [];
      console.error('Error al cargar encuestas:', error);
    }
  }

  graficarEncuestas() {
    // Ejemplo: gráfico de distribución de estrellas
    const ctx = document.getElementById('grafEncuestas') as HTMLCanvasElement;
    if (!ctx) return;
    // Renderizar en alta resolución para máxima nitidez
    const dpr = window.devicePixelRatio || 1;
    ctx.width = 800 * dpr;
    ctx.height = 400 * dpr;
    ctx.style.width = '800px';
    ctx.style.height = '400px';
    const estrellas = [1,2,3,4,5];
    const counts = estrellas.map(e => this.encuestas.filter(enc => enc.estrellas === e).length);
    if (this.chartEncuestas) this.chartEncuestas.destroy();
    this.chartEncuestas = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: estrellas.map(e => `${e} estrellas`),
        datasets: [{
          label: 'Cantidad',
          data: counts,
          backgroundColor: '#007bff',
          borderWidth: 2,
          barPercentage: 0.7,
          categoryPercentage: 0.6
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: false },
          tooltip: { bodyFont: { size: 22, weight: 'bold' }, titleFont: { size: 22, weight: 'bold' } }
        },
        scales: {
          x: {
            ticks: {
              font: { size: 14, weight: 'bold' },
              color: '#212529',
              padding: 10,
              maxRotation: 0,
              minRotation: 0,
              autoSkip: false
            },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: {
              font: { size: 24, weight: 'bold' }, color: '#212529', stepSize: 1,
              precision: 0
            }
          }
        }
      }
    });
  }

  actualizarRango(): void {
    const d = this.desde();
    const h = this.hasta();
    if (d && h) {
      const params = { desde: d, hasta: h };
      document.dispatchEvent(new CustomEvent('rango-medico-cambiado', { detail: params }));
    }
  }

  async descargarReportes(): Promise<void> {
    const doc = new jsPDF();
    const logo = await this.base64Image('assets/img/logoClinica.png');
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.addImage(logo, 'PNG', (pageWidth - 40) / 2, 10, 40, 40);
    doc.setFontSize(18);
    doc.text('Estadísticas del sistema', pageWidth / 2, 60, { align: 'center' });

    const imgs = [
      await this.grafEsp.getImage(),
      await this.grafDia.getImage(),
      await this.grafSol.getImage(),
      await this.grafFin.getImage()
    ];

    let y = 70;
    for (const img of imgs) {
      doc.addImage(img, 'PNG', 15, y, pageWidth - 30, 70);
      y += 80;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    }

    doc.save('estadisticas2.pdf');
  }

  private async base64Image(url: string): Promise<string> {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise(r => {
      const fr = new FileReader();
      fr.onloadend = () => r(fr.result as string);
      fr.readAsDataURL(blob);
    });
  }

  async cerrarSesion() {
    await this.auth.logout();
    window.location.href = '/home';
  }
}
