import { Component, Input } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent {
  @Input() title: string = '';

  constructor(
    private authService: AuthService,
    private navCtrl: NavController,
    private alertController: AlertController,
    private toastService: ToastService
  ) { }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que quieres salir?',
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Logout cancelado');
          }
        },
        {
          text: 'Salir',
          role: 'confirm',
          cssClass: 'danger',
          handler: () => {
            this.authService.logout();
            this.toastService.success('Sesión finalizada exitosamente');
            this.navCtrl.navigateRoot('/login');
          }
        }
      ]
    });

    await alert.present();
  }
}