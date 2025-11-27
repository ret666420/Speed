import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PremiosPage } from './premios.page';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { ComponentsModule } from '../../components/components.module';
import { AuthService } from '../../services/auth.service';
import { RewardsService } from '../../services/rewards.service';
import { ToastService } from '../../services/toast.service';
import { of, throwError } from 'rxjs';
import { RewardItem } from '../../models/reward.models';

describe('PremiosPage', () => {
  let component: PremiosPage;
  let fixture: ComponentFixture<PremiosPage>;

  // Definimos los tipos explícitamente como jasmine.SpyObj<Clase>
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let rewardsServiceSpy: jasmine.SpyObj<RewardsService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;

  const mockRewards: RewardItem[] = [
    {
      achievement_id: '1',
      name: 'Logro 1',
      description: 'Desc',
      reward_monedas: 100,
      achieved: true,
      claimed_at: '2023-01-01',
      unlocked_at: '2023-01-01'
    },
    {
      achievement_id: '2',
      name: 'Logro Pendiente',
      description: 'Desc',
      reward_monedas: 500,
      achieved: true,
      unlocked_at: new Date().toISOString() // Reciente
    }
  ];

  beforeEach(async () => {
    // Creamos los espías
    authServiceSpy = jasmine.createSpyObj('AuthService', [], { currentUserId: 'user-123' });
    rewardsServiceSpy = jasmine.createSpyObj('RewardsService', ['getRewards', 'claimReward']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'warning']); // Agregué 'warning' por si acaso
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);

    // Configuración por defecto: Devolver datos exitosos
    // Al tipar rewardsServiceSpy correctamente arriba, TypeScript ya sabe que getRewards es un espía
    rewardsServiceSpy.getRewards.and.returnValue(of(mockRewards));

    await TestBed.configureTestingModule({
      declarations: [PremiosPage],
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule,
        ComponentsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: RewardsService, useValue: rewardsServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: NavController, useValue: navCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PremiosPage);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Esto dispara ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar recompensas al iniciar (ngOnInit)', () => {
    expect(rewardsServiceSpy.getRewards).toHaveBeenCalledWith('user-123');
    expect(component.rewards.length).toBe(2);
    expect(component.pendingRewards.length).toBe(1); // Solo el que no tiene claimed_at
    expect(component.isLoading).toBeFalse();
  });

  it('debería redirigir al login si no hay usuario', () => {
    // Forzamos que no haya usuario redefiniendo la propiedad
    Object.defineProperty(authServiceSpy, 'currentUserId', { get: () => null });

    component.loadRewards();

    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/login');
  });

  it('debería reclamar una recompensa exitosamente', () => {
    const rewardToClaim = mockRewards[1];
    const mockClaimResponse = { success: true, message: 'Ok', new_balance: 1000 };

    // Simulamos respuesta exitosa del claim
    rewardsServiceSpy.claimReward.and.returnValue(of(mockClaimResponse));

    // Simulamos la recarga de datos posterior (array vacío para simplificar)
    rewardsServiceSpy.getRewards.and.returnValue(of([]));

    component.claim(rewardToClaim);

    expect(rewardsServiceSpy.claimReward).toHaveBeenCalledWith('user-123', rewardToClaim.achievement_id);
    expect(toastServiceSpy.success).toHaveBeenCalled();
    // Se llama 1 vez en ngOnInit y 1 vez en claim -> total 2
    expect(rewardsServiceSpy.getRewards).toHaveBeenCalledTimes(2);
  });

  it('debería manejar error al reclamar recompensa', () => {
    const rewardToClaim = mockRewards[1];
    // Simulamos error
    rewardsServiceSpy.claimReward.and.returnValue(throwError(() => new Error('Error API')));

    component.claim(rewardToClaim);

    expect(toastServiceSpy.error).toHaveBeenCalled();
  });

  it('debería calcular "Hace X tiempo" correctamente (getTimeAgo)', () => {
    const now = new Date();

    // Caso: Segundos
    expect(component.getTimeAgo(now.toISOString())).toContain('segundos');

    // Caso: Minutos (Hace 5 min)
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(component.getTimeAgo(fiveMinAgo.toISOString())).toBe('Hace 5m');

    // Caso: Horas (Hace 2 horas)
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    expect(component.getTimeAgo(twoHoursAgo.toISOString())).toBe('Hace 2h');
  });
});
