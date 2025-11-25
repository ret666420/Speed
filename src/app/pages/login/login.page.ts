import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'; //es desde donde se hace el login(el metodo)
import { NavController } from '@ionic/angular';//para navegar entre paginas
@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
//lo que se va a usar en el html
  email = '';
  password = '';
  errorMessage = '';
//pues el nNavCtrl para navegar entre paginas y el authService para hacer el login
//el AuthService para llamar al login
  constructor(private authService: AuthService, private navCtrl: NavController) {}

  login() {
    
    this.authService.login(this.email, this.password).subscribe({
     
      next: (res) => {
        console.log('Login exitoso:', res);
        this.navCtrl.navigateForward('/tabs/inicio'); 
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.errorMessage = 'Credenciales incorrectas';
      }
    });
  }
}
