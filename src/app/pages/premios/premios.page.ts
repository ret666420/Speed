import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { RewardsService } from '../../services/rewards.service';
import { ToastService } from '../../services/toast.service';
import { RewardItem } from '../../models/reward.models';

@Component({
  selector: 'app-premios',
  templateUrl: './premios.page.html',
  styleUrls: ['./premios.page.scss'],
  standalone: false
})
export class PremiosPage implements OnInit {
  rewards: RewardItem[] = [];
  pendingRewards: RewardItem[] = [];
  recentActivity: any[] = [];
  isLoading = true;

  constructor(
    private authService: AuthService,
    private rewardsService: RewardsService,
    private toast: ToastService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.loadRewards();
  }

  ionViewWillEnter() {
    this.loadRewards();
  }

  loadRewards() {
    const userId = this.authService.currentUserId;
    if (!userId) {
      this.navCtrl.navigateRoot('/login');
      return;
    }

    this.isLoading = true;

    this.rewardsService.getRewards(userId).subscribe({
      next: (data) => {
        this.rewards = data;

        this.pendingRewards = data.filter(r => r.achieved && !r.claimed_at);

        this.recentActivity = data
          .filter(r => r.achieved)
          .sort((a, b) => new Date(b.unlocked_at!).getTime() - new Date(a.unlocked_at!).getTime())
          .slice(0, 3);

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando premios', err);
        this.isLoading = false;
      }
    });
  }

  claim(reward: RewardItem) {
    const userId = this.authService.currentUserId;
    if (!userId) return;

    this.rewardsService.claimReward(userId, reward.achievement_id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.success(`¡Has recibido ${reward.reward_monedas} monedas! 💰`);

          this.loadRewards();
        }
      },
      error: (err) => {
        console.error('Error al reclamar', err);
        this.toast.error('Error al reclamar recompensa');
      }
    });
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Hace unos segundos';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Hace ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
  }
}