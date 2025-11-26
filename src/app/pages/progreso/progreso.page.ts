import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment.prod';
import { ProfileResponse, TrophyItem } from '../../models/profile.models';

@Component({
  selector: 'app-progreso',
  templateUrl: './progreso.page.html',
  styleUrls: ['./progreso.page.scss'],
  standalone: false
})
export class ProgresoPage implements OnInit {
  profileData: ProfileResponse | null = null;
  isLoading = true;

  currentLevel = 1;
  nextLevelXp = 3000; // Cada 3000 monedas subes de nivel
  currentXp = 0;
  levelProgress = 0;

  unlockedTrophies: TrophyItem[] = [];
  lockedTrophies: TrophyItem[] = [];

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.loadData();
  }

  ionViewWillEnter() {
    this.loadData();
  }

  loadData() {
    const userId = this.authService.currentUserId;
    if (!userId) {
      this.navCtrl.navigateRoot('/login');
      return;
    }

    const apiUrl = `${environment.apiUrl}/profile/${userId}`;

    this.http.get<ProfileResponse>(apiUrl).subscribe({
      next: (data) => {
        this.profileData = data;
        this.calculateLevelProgress(data.user.monedas);
        this.organizeTrophies(data.trophies);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando progreso', err);
        this.isLoading = false;
      }
    });
  }

  calculateLevelProgress(monedas: number) {
    // Lógica simple: Nivel = Monedas / 3000
    this.currentLevel = Math.floor(monedas / this.nextLevelXp) + 1;

    // XP actual dentro del nivel (el residuo)
    this.currentXp = monedas % this.nextLevelXp;

    // Porcentaje (0 a 1)
    this.levelProgress = this.currentXp / this.nextLevelXp;
  }

  organizeTrophies(trophies: TrophyItem[]) {
    this.unlockedTrophies = trophies.filter(t => t.achieved);
    this.lockedTrophies = trophies.filter(t => !t.achieved);
  }
}