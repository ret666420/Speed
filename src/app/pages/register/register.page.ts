import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from './../../services/toast.service';
import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';

  errorMessage = '';
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private navCtrl: NavController,
    private toast: ToastService
  ) { }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  register() {
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      this.toast.warning('Por favor completa todos los campos');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.toast.warning('Las contraseñas no coinciden');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.username, this.email, this.password).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('Registro exitoso:', res);

        this.toast.success('Registro exitoso, ahora inicia sesión');

        this.navCtrl.navigateBack('/login');
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error en registro:', err);

        const msg = err.error?.error || 'Ocurrió un error al crear la cuenta';
        this.errorMessage = msg;
        this.toast.error(msg);
      }
    });
  }
}