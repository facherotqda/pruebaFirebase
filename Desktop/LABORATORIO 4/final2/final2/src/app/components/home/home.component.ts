




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
          { texto: 'HOME.BOTON_MIS_TURNOS', imagen: '../../../assets/img/botonTurnos.png', ruta: '/turnos/paciente' },
          { texto: 'HOME.BOTON_MI_PERFIL', imagen: '../../../assets/img/botonUsuarios.png', ruta: '/mi-perfil' }
        ];
        break;
      case 'especialista':
        this.botones = [
          { texto: 'HOME.BOTON_TURNOS', imagen: '../../../assets/img/botonTurnos.png', ruta: '/turnos/especialista' },
          { texto: 'HOME.BOTON_MI_PERFIL', imagen: '../../../assets/img/botonUsuarios.png', ruta: '/mi-perfil' }
        ];
        break;
      case 'admin':
        this.botones = [
          { texto: 'HOME.BOTON_ADMIN_TURNOS', imagen: '../../../assets/img/botonTurnos.png', ruta: '/turnos/admin' },
          { texto: 'HOME.BOTON_ADMIN_USUARIOS', imagen: '../../../assets/img/botonUsuarios.png', ruta: '/usuarios' },
          { texto: 'HOME.BOTON_ESTADISTICAS', imagen: '../../../assets/img/botonEstadisticas.png', ruta: '/estadisticas' }
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
