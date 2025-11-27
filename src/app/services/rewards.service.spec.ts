import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RewardsService } from './rewards.service';
import { environment } from '../../environments/environment'; // Importamos environment para la URL dinámica
import { RewardItem, ClaimResponse } from '../models/reward.models';

describe('RewardsService', () => {
  let service: RewardsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RewardsService]
    });
    service = TestBed.inject(RewardsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya solicitudes pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRewards', () => {
    it('debería hacer una petición GET para obtener las recompensas', () => {
      const userId = 'user-123';
      const mockRewards: RewardItem[] = [
        {
          achievement_id: '1',
          name: 'Logro 1',
          description: 'Desc',
          reward_monedas: 100,
          achieved: true
        },
        {
          achievement_id: '2',
          name: 'Logro 2',
          description: 'Desc',
          reward_monedas: 200,
          achieved: false
        }
      ];

      service.getRewards(userId).subscribe((rewards) => {
        expect(rewards.length).toBe(2);
        expect(rewards).toEqual(mockRewards);
      });

      // Verificamos la URL dinámica
      const req = httpMock.expectOne(`${environment.apiUrl}/rewards/${userId}`);
      expect(req.request.method).toBe('GET');

      req.flush(mockRewards);
    });
  });

  describe('claimReward', () => {
    it('debería hacer una petición POST con los datos correctos para reclamar', () => {
      const userId = 'user-123';
      const achievementId = 'ach-999';

      const mockResponse: ClaimResponse = {
        success: true,
        message: 'Recompensa reclamada',
        new_balance: 1500
      };

      service.claimReward(userId, achievementId).subscribe((res) => {
        expect(res).toEqual(mockResponse);
        expect(res.success).toBeTrue();
        expect(res.new_balance).toBe(1500);
      });

      // Verificamos URL y Método
      const req = httpMock.expectOne(`${environment.apiUrl}/rewards/claim`);
      expect(req.request.method).toBe('POST');

      // Verificamos que el cuerpo de la petición sea correcto
      expect(req.request.body).toEqual({
        userId,
        achievementId
      });

      req.flush(mockResponse);
    });
  });
});
