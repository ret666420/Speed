import { AuthService } from 'src/app/services/auth.service';
import { environment } from './../../../environments/environment.prod';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: false
})
export class InicioPage implements OnInit {
  profileData: any = null;
  isLoading = true;
  userLevel = 1;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.loadProfile();
  }

  ionViewWillEnter() {
    this.loadProfile();
  }

  loadProfile() {
    const userId = this.authService.currentUserId;

    if (!userId) {
      this.navCtrl.navigateRoot('/login');
      return;
    }

    const apiUrl = `${environment.apiUrl}/profile/${userId}`;

    this.http.get(apiUrl).subscribe({
      next: (data: any) => {
        this.profileData = data;
        this.userLevel = Math.floor(data.user.monedas / 3000) + 1;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando perfil', err);
        this.isLoading = false;
      }
    });
  }

  getInitials(name: string): string {
    return name ? name.substring(0, 2).toUpperCase() : 'SP';
  }

  logout() {
    this.authService.logout();
    this.navCtrl.navigateRoot('/login');
  }
}