import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { NavController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  nombre = '';
  email = '';
  password = '';
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private navCtrl: NavController) {}

  register() {
    if (!this.email || !this.password || !this.nombre) {
      this.errorMessage = 'Por favor llena todos los campos';
      return;
    }

this.authService.register(this.nombre, this.email, this.password)
    .subscribe({
      next: (res) => {
        console.log('Registro exitoso:', res);
        this.successMessage = 'Usuario registrado correctamente';
        this.errorMessage = '';

        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          this.navCtrl.navigateBack('/login');
        }, 2000);
      },
      error: (err) => {
        console.error('Error en registro:', err);
        this.errorMessage = 'No se pudo registrar el usuario';
        this.successMessage = '';
      }
    });
  }
}
