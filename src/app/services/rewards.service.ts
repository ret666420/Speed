import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { RewardItem, ClaimResponse } from '../models/reward.models';

@Injectable({
  providedIn: 'root'
})
export class RewardsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las recompensas (logros) del usuario, indicando
   * cuáles están desbloqueadas y cuáles ya fueron reclamadas.
   * @param userId ID del usuario
   */
  getRewards(userId: string): Observable<RewardItem[]> {
    return this.http.get<RewardItem[]>(`${this.apiUrl}/rewards/${userId}`);
  }

  /**
   * Reclama la recompensa de un logro específico.
   * @param userId ID del usuario
   * @param achievementId ID del logro a reclamar
   */
  claimReward(userId: string, achievementId: string): Observable<ClaimResponse> {
    return this.http.post<ClaimResponse>(`${this.apiUrl}/rewards/claim`, {
      userId,
      achievementId
    });
  }
}