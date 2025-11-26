import { AuthService } from 'src/app/services/auth.service';
import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private navCtrl: NavController,
    private toast: ToastService
  ) { }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    if (!this.username || !this.password) {
      this.toast.warning('Por favor completa todos los campos');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('Login exitoso:', res);

        this.toast.success('Inicio de sesión exitoso');

        this.navCtrl.navigateForward('/tabs/inicio');
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error en login:', err);

        const msg = err.error?.error || 'Credenciales incorrectas o error de conexión';
        this.errorMessage = msg;
        this.toast.error(msg);
      }
    });
  }
}