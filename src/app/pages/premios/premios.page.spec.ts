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

  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let rewardsServiceSpy: jasmine.SpyObj<RewardsService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;

  // Datos Mock
  const mockRewards: RewardItem[] = [
    {
      achievement_id: '1',
      name: 'Logro Viejo',
      description: 'Desc',
      reward_monedas: 100,
      achieved: true,
      claimed_at: '2023-01-01',
      unlocked_at: '2023-01-01T10:00:00Z' // Fecha antigua
    },
    {
      achievement_id: '2',
      name: 'Logro Nuevo',
      description: 'Desc',
      reward_monedas: 500,
      achieved: true,
      unlocked_at: '2025-01-01T10:00:00Z' // Fecha futura/reciente para probar sort
    }
  ];

  beforeEach(async () => {
    // Configurar espías
    authServiceSpy = jasmine.createSpyObj('AuthService', [], { currentUserId: 'user-123' });
    rewardsServiceSpy = jasmine.createSpyObj('RewardsService', ['getRewards', 'claimReward']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);

    // Default: éxito
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
    // NO detectamos cambios automáticamente para controlar ngOnInit
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // --- LOAD REWARDS ---

  it('debería cargar recompensas, filtrar pendientes y ORDENAR actividad reciente', () => {
    fixture.detectChanges(); // ngOnInit

    expect(rewardsServiceSpy.getRewards).toHaveBeenCalledWith('user-123');
    expect(component.rewards).toEqual(mockRewards);

    // Verificar Filtro Pendientes
    // El Logro 2 no tiene claimed_at, debe estar pendiente
    expect(component.pendingRewards.length).toBe(1);
    expect(component.pendingRewards[0].achievement_id).toBe('2');

    // Verificar ORDENAMIENTO (Recent Activity)
    // Debe estar primero el Logro Nuevo (2) y luego el Viejo (1)
    expect(component.recentActivity.length).toBe(2);
    expect(component.recentActivity[0].achievement_id).toBe('2');
    expect(component.recentActivity[1].achievement_id).toBe('1');
  });

  it('debería redirigir al login si no hay usuario en loadRewards', () => {
    // Sobrescribir getter para devolver null
    Object.defineProperty(authServiceSpy, 'currentUserId', { get: () => null });

    component.ngOnInit();

    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/login');
    expect(rewardsServiceSpy.getRewards).not.toHaveBeenCalled();
  });

  it('debería manejar error al cargar recompensas', () => {
    spyOn(console, 'error');
    rewardsServiceSpy.getRewards.and.returnValue(throwError(() => new Error('API Error')));

    component.loadRewards();

    expect(console.error).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
  });

  // --- CLAIM REWARD ---

  it('debería reclamar recompensa exitosamente y recargar', () => {
    const reward = mockRewards[1];
    // Respuesta success: true
    rewardsServiceSpy.claimReward.and.returnValue(of({ success: true, message: 'Ok', new_balance: 100 }));
    // Mock para la recarga posterior
    rewardsServiceSpy.getRewards.and.returnValue(of([]));

    component.claim(reward);

    expect(rewardsServiceSpy.claimReward).toHaveBeenCalledWith('user-123', '2');
    expect(toastServiceSpy.success).toHaveBeenCalled();
    // Debe llamar getRewards una vez más para actualizar
    expect(rewardsServiceSpy.getRewards).toHaveBeenCalled();
  });

  it('debería NO hacer nada si claimReward devuelve success: false', () => {
    const reward = mockRewards[1];
    // Respuesta success: false
    rewardsServiceSpy.claimReward.and.returnValue(of({ success: false, message: 'Fail', new_balance: 0 }));

    component.claim(reward);

    expect(rewardsServiceSpy.claimReward).toHaveBeenCalled();
    expect(toastServiceSpy.success).not.toHaveBeenCalled(); // No debe mostrar éxito
    // No debería recargar datos (según la lógica actual de tu componente, solo recarga si success es true)
  });

  it('debería manejar error del servidor en claimReward', () => {
    spyOn(console, 'error');
    const reward = mockRewards[1];
    rewardsServiceSpy.claimReward.and.returnValue(throwError(() => new Error('Fail')));

    component.claim(reward);

    expect(console.error).toHaveBeenCalled();
    expect(toastServiceSpy.error).toHaveBeenCalledWith('Error al reclamar recompensa');
  });

  it('debería salir temprano de claim si no hay usuario (branch coverage)', () => {
    Object.defineProperty(authServiceSpy, 'currentUserId', { get: () => null });
    const reward = mockRewards[1];

    component.claim(reward);

    expect(rewardsServiceSpy.claimReward).not.toHaveBeenCalled();
  });

  // --- GET TIME AGO ---

  it('debería formatear fechas correctamente (Segundos, Minutos, Horas, Días)', () => {
    const now = new Date();

    // Segundos
    expect(component.getTimeAgo(now.toISOString())).toContain('segundos');

    // Minutos
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(component.getTimeAgo(fiveMinAgo.toISOString())).toBe('Hace 5m');

    // Horas
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    expect(component.getTimeAgo(twoHoursAgo.toISOString())).toBe('Hace 2h');

    // Días (Cubrimos la rama 'else' o final de la función)
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    expect(component.getTimeAgo(threeDaysAgo.toISOString())).toBe('Hace 3d');
  });
});
