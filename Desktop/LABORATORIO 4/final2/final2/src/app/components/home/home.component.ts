




import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CredencialesService } from '../../services/credenciales.service';
import { User } from '@supabase/supabase-js';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  private credencialesService = inject(CredencialesService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  usuario: User | null = null;
  perfil: string | null = null;
  botones: { texto: string; imagen: string; ruta: string }[] = [];
  idioma: string = 'es';
  idiomasDisponibles = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' }
  ];

  ngOnInit(): void {
    this.translate.use(this.idioma);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.cargarUsuarioYBotones();
      });
    this.cargarUsuarioYBotones();
  }

  cambiarIdioma(idioma: string) {
    this.idioma = idioma;
    this.translate.use(idioma); // llama al servicio para cambiar el idioma
 // Este servicio se encarga de cargar el archivo de idioma correspondiente (por ejemplo, es.json, en.json,etc)

  }

  private async cargarUsuarioYBotones() {
    this.usuario = await this.credencialesService.getUsuarioActualAsync();
    if (this.usuario) {
      this.perfil = await this.credencialesService.getPerfilActual();
      this.cargarBotones();
    } else {
      this.perfil = null;
      this.botones = [];
    }
  }

  private cargarBotones() {
    switch (this.perfil) {
      case 'paciente':
        this.botones = [
          { texto: this.translate.instant('HOME.BOTON_MIS_TURNOS') || 'Mis turnos', imagen: '../../../assets/img/botonTurnos.png', ruta: '/turnos/paciente' },
          { texto: this.translate.instant('HOME.BOTON_MI_PERFIL') || 'Mi perfil', imagen: '../../../assets/img/botonUsuarios.png', ruta: '/mi-perfil' }
        ];
        break;
      case 'especialista':
        this.botones = [
          { texto: this.translate.instant('HOME.BOTON_TURNOS') || 'Turnos', imagen: '../../../assets/img/botonTurnos.png', ruta: '/turnos/especialista' },
          { texto: this.translate.instant('HOME.BOTON_MI_PERFIL') || 'Mi perfil', imagen: '../../../assets/img/botonUsuarios.png', ruta: '/mi-perfil' }
        ];
        break;
      case 'admin':
        this.botones = [
          { texto: this.translate.instant('HOME.BOTON_ADMIN_TURNOS') || 'Administrar Turnos', imagen: '../../../assets/img/botonTurnos.png', ruta: '/turnos/admin' },
          { texto: this.translate.instant('HOME.BOTON_ADMIN_USUARIOS') || 'Administrar Usuarios', imagen: '../../../assets/img/botonUsuarios.png', ruta: '/usuarios' },
          { texto: this.translate.instant('HOME.BOTON_ESTADISTICAS') || 'Estadísticas', imagen: '../../../assets/img/botonEstadisticas.png', ruta: '/estadisticas' }
        ];
        break;
      default:
        this.botones = [];
    }
  }

  irALogin() {
    this.router.navigate(['/login']);
  }

  irARegistro() {
    this.router.navigate(['/registro']);
  }

  async cerrarSesion() {
    await this.credencialesService.logout();
    this.usuario = null;
    this.botones = [];
    window.location.href = '/home';
  }

  showLangMenu = false;

  getIdiomaLabel(): string {
    const found = this.idiomasDisponibles.find(l => l.code === this.idioma);
    return found ? found.label : this.idioma;
  }
}
