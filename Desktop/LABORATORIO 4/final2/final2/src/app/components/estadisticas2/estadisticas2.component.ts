import Chart from 'chart.js/auto';
import { Component, OnInit, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  ],
  templateUrl: './estadisticas2.component.html',
  styleUrls: ['./estadisticas2.component.css']
})
export class Estadisticas2Component implements OnInit {
  async descargarReportePacientes() {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1000, 400] });
    // Cargar logo
    const logo = await this.base64Image('assets/img/logoClinica.png');
    doc.addImage(logo, 'PNG', 450, 10, 100, 100);
    doc.setFontSize(18);
    doc.text('Pacientes por especialidad', 500, 130, { align: 'center' });

    // Tabla de pacientes por especialidad
    let y = 180;
    doc.setFontSize(14);
    doc.text('Especialidad   Nombre   Apellido   Edad', 100, y);
    y += 24;
    for (const esp of Object.keys(this.pacientesPorEspecialidad)) {
      for (const paciente of this.pacientesPorEspecialidad[esp]) {
        const fila = `${esp.padEnd(15)} ${paciente.nombre.padEnd(15)} ${paciente.apellido.padEnd(15)} ${paciente.edad}`;
        doc.text(fila, 100, y);
        y += 20;
        if (y > 180 + 200) {
          doc.addPage();
          y = 40;
        }
      }
    }
    doc.save('reporte-pacientes-especialidad.pdf');
  }
  pacientesPorEspecialidad: { [key: string]: Array<{nombre: string, apellido: string, edad: number}> } = {};
  chartPacientes: Chart | null = null;

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
    // Cargar logo
    const logo = await this.base64Image('assets/img/logoClinica.png');
    doc.addImage(logo, 'PNG', 450, 10, 100, 100);
    doc.setFontSize(18);
    doc.text('Médicos por especialidad', 500, 130, { align: 'center' });
    doc.addImage(imgData, 'PNG', 100, 150, 800, 220);

    // Tabla de médicos por especialidad
    let y = 380;
    doc.setFontSize(14);
    doc.text('Especialidad   Nombre   Apellido   Edad', 100, y);
    y += 24;
    for (const esp of Object.keys(this.medicosPorEspecialidad)) {
      for (const medico of this.medicosPorEspecialidad[esp]) {
        const fila = `${esp.padEnd(15)} ${medico.nombre.padEnd(15)} ${medico.apellido.padEnd(15)} ${medico.edad}`;
        doc.text(fila, 100, y);
        y += 20;
        if (y > 380 + 200) {
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
    const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [800, 400] });
    // Cargar logo
    const logo = await this.base64Image('assets/img/logoClinica.png');
    doc.addImage(logo, 'PNG', 350, 10, 100, 100);
    doc.setFontSize(18);
    doc.text('Resultados de encuestas a clientes', 400, 130, { align: 'center' });
    doc.addImage(imgData, 'PNG', 50, 150, 700, 220);
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
    await this.cargarEncuestas();
    this.graficarEncuestas();
    await this.cargarMedicosPorEspecialidad();
    await this.cargarPacientesPorEspecialidad();
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
