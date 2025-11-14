import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NavController } from '@ionic/angular';
@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private navCtrl: NavController) {}

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        console.log('Login exitoso:', res);
        this.navCtrl.navigateForward('/inicio'); 
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.errorMessage = 'Credenciales incorrectas';
      }
    });
  }
}
