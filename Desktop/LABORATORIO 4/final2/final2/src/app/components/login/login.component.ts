/* import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CredencialesService } from '../../services/credenciales.service';
import { SupabaseDbService } from '../../services/supabase-db.service';
import { MensajeComponent } from '../mensaje/mensaje.component';
import { BotonesRedondosDirective } from '../../directivas/botones-redondos.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MensajeComponent, BotonesRedondosDirective],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  usuario: string = '';
  contrasena: string = '';
  mensajeVisible = false;
  mensajeTexto = '';
  mensajeTipo: 'success' | 'error' | 'warning' | 'info' = 'info';
  cargando: string | null = null;

  @Output() onLoginSuccess = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  constructor(
    private credencialesService: CredencialesService,
    private supabaseDb: SupabaseDbService,
    private router: Router
  ) { }

  async login() {
    try {
      if (!this.usuario || !this.contrasena) {
        this.mostrarMensaje('Debe ingresar el correo y la contraseña.', 'warning');
        return;
      }

      const usuarioAutenticado = await this.credencialesService.login(this.usuario, this.contrasena);

      if (!usuarioAutenticado.email) {
        throw new Error('El usuario no tiene un email válido');
      }
      await this.supabaseDb.registrarLoginUsuario(usuarioAutenticado.id, usuarioAutenticado.email);

      this.mostrarMensaje('Inicio de sesión exitoso', 'success');
      this.onLoginSuccess.emit(usuarioAutenticado);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error(error);
      const texto =
        error instanceof Error && error.message
          ? error.message
          : 'Credenciales inválidas.';
      this.mostrarMensaje(texto, 'error');
    }
  }

  async loginRapido(email: string, imagenKey: string) {
    this.cargando = imagenKey;
    this.usuario = email;
    this.contrasena = '123456';

    try {
      await this.login();
    } finally {
      this.cargando = null;
    }
  }

  cancelar() {
    this.onCancel.emit();
  }

  irARegistro() {
    this.router.navigate(['/registro']);
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error' | 'warning' | 'info' = 'info') {
    this.mensajeTexto = texto;
    this.mensajeTipo = tipo;
    this.mensajeVisible = true;
    setTimeout(() => (this.mensajeVisible = false), 4000);
  }

  logout() {
    this.credencialesService.logout();
    this.router.navigate(['/home']);
  }
}
 */


import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CredencialesService } from '../../services/credenciales.service';
import { SupabaseDbService } from '../../services/supabase-db.service';
import { MensajeComponent } from '../mensaje/mensaje.component';
import { BotonesRedondosDirective } from '../../directivas/botones-redondos.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MensajeComponent, BotonesRedondosDirective, TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  mensajeVisible = false;
  mensajeTexto = '';
  mensajeTipo: 'success' | 'error' | 'warning' | 'info' = 'info';
  cargando: string | null = null;

  @Output() onLoginSuccess = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private credencialesService: CredencialesService,
    private supabaseDb: SupabaseDbService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required]
    });
  }

  async login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.mostrarMensaje('Debe ingresar un correo válido y la contraseña.', 'warning');
      return;
    }

    const { usuario, contrasena } = this.loginForm.value;

    try {
      const usuarioAutenticado = await this.credencialesService.login(usuario, contrasena);

      if (!usuarioAutenticado.email) {
        throw new Error('El usuario no tiene un email válido');
      }

      await this.supabaseDb.registrarLoginUsuario(usuarioAutenticado.id, usuarioAutenticado.email);

      this.mostrarMensaje('Inicio de sesión exitoso', 'success');
      this.onLoginSuccess.emit(usuarioAutenticado);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error(error);
      const texto =
        error instanceof Error && error.message
          ? error.message
          : 'Credenciales inválidas.';
      this.mostrarMensaje(texto, 'error');
    }
  }

  async loginRapido(email: string, imagenKey: string) {
    this.cargando = imagenKey;
    this.loginForm.setValue({ usuario: email, contrasena: '123456' });

    try {
      await this.login();
    } finally {
      this.cargando = null;
    }
  }

  cancelar() {
    this.onCancel.emit();
  }

  irARegistro() {
    this.router.navigate(['/registro']);
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error' | 'warning' | 'info' = 'info') {
    this.mensajeTexto = texto;
    this.mensajeTipo = tipo;
    this.mensajeVisible = true;
    setTimeout(() => (this.mensajeVisible = false), 4000);
  }

  logout() {
    this.credencialesService.logout();
    this.router.navigate(['/home']);
  }

  volverHome() {
    this.router.navigate(['/home']);
  }

}
