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
    LogIngresosComponent,
    TurnosEspecialidadComponent,
    TurnosDiaComponent,
    TurnosSolicitadosMedicoComponent,
    TurnosFinalizadosMedicoComponent
  ],
  templateUrl: './estadisticas2.component.html',
  styleUrls: ['./estadisticas2.component.css']
})
export class Estadisticas2Component implements OnInit {
  encuestas: any[] = [];
  chartEncuestas: Chart | null = null;
  private auth = inject(CredencialesService);

  readonly desde = signal<string>('');
  readonly hasta = signal<string>('');

  @ViewChild('grafDia') grafDia!: TurnosDiaComponent;
  @ViewChild('grafEsp') grafEsp!: TurnosEspecialidadComponent;
  @ViewChild('grafSol') grafSol!: TurnosSolicitadosMedicoComponent;
  @ViewChild('grafFin') grafFin!: TurnosFinalizadosMedicoComponent;

  ngOnInit(): void { }

  async ngAfterViewInit() {
    await this.cargarEncuestas();
    this.graficarEncuestas();
  }

  async cargarEncuestas() {
    // Consulta a la tabla encuestas
    const db = inject(SupabaseDbService);
    try {
      this.encuestas = await db.getEncuestas();
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
          backgroundColor: '#007bff'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
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
