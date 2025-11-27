import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgresoPage } from './progreso.page';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { ComponentsModule } from '../../components/components.module';
import { AuthService } from '../../services/auth.service';
// Importamos el de producción para que coincida con tu componente actual
import { environment } from '../../../environments/environment.prod';
import { ProfileResponse } from '../../models/profile.models';

describe('ProgresoPage', () => {
  let component: ProgresoPage;
  let fixture: ComponentFixture<ProgresoPage>;
  let httpMock: HttpTestingController;

  // Espías
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;

  // Datos Mock (Simulados)
  const mockProfileData: ProfileResponse = {
    user: {
        username: 'test',
        created_at: '2023-01-01',
        display_name: 'Test User',
        monedas: 3500, // Generará Nivel 2 (3000 + 500)
        races_played: 10,
        level: 1,
        garage_value: 1000,
        total_cars: 2,
        total_cars_available: 10,
        maps_completed: 1
    },
    garage: [],
    trophies: [
        { achievement_id: '1', name: 'T1', description: 'D1', reward_monedas: 100, achieved: true },
        { achievement_id: '2', name: 'T2', description: 'D2', reward_monedas: 200, achieved: false }
    ],
    records: []
  };

  beforeEach(async () => {
    // 1. Configurar Mocks
    authServiceSpy = jasmine.createSpyObj('AuthService', [], { currentUserId: 'user-123' });
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);

    await TestBed.configureTestingModule({
      declarations: [ProgresoPage],
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule, // Para simular peticiones HTTP
        ComponentsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NavController, useValue: navCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProgresoPage);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    // No llamamos a detectChanges() aquí para controlar manualmente el ciclo de vida en cada test
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no queden peticiones pendientes
  });

  it('should create', () => {
    fixture.detectChanges(); // Dispara ngOnInit
    const req = httpMock.expectOne(`${environment.apiUrl}/profile/user-123`);
    req.flush(mockProfileData);
    expect(component).toBeTruthy();
  });

  it('debería cargar datos, calcular nivel y filtrar trofeos (Happy Path)', () => {
    // Ejecutar ngOnInit
    fixture.detectChanges();

    // Interceptar petición
    const req = httpMock.expectOne(`${environment.apiUrl}/profile/user-123`);
    expect(req.request.method).toBe('GET');

    // Simular respuesta exitosa
    req.flush(mockProfileData);

    // VERIFICACIONES (Aumentan cobertura de calculateLevelProgress y organizeTrophies)
    expect(component.profileData).toEqual(mockProfileData);
    expect(component.isLoading).toBeFalse();

    // Lógica de Nivel: 3500 monedas / 3000 = 1.16 -> Nivel 2
    expect(component.currentLevel).toBe(2);
    expect(component.currentXp).toBe(500);
    expect(component.levelProgress).toBeCloseTo(0.166, 2);

    // Lógica de Trofeos
    expect(component.unlockedTrophies.length).toBe(1); // T1 es true
    expect(component.lockedTrophies.length).toBe(1);   // T2 es false
  });

  it('debería redirigir al login si no hay usuario logueado', () => {
    // Simulamos que el getter devuelve null
    Object.defineProperty(authServiceSpy, 'currentUserId', { get: () => null });

    component.ngOnInit();

    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/login');
    // Aseguramos que NO se hizo petición
    httpMock.expectNone(`${environment.apiUrl}/profile/null`);
  });

  it('debería manejar error del servidor correctamente', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiUrl}/profile/user-123`);

    // Simular error 500
    req.flush('Error interno', { status: 500, statusText: 'Server Error' });

    // Verificar que isLoading se apaga y se maneja el error (se imprime en consola en tu código)
    expect(component.isLoading).toBeFalse();
    expect(component.profileData).toBeNull();
  });

  it('ionViewWillEnter debería recargar los datos', () => {
    // Primera carga (ngOnInit)
    fixture.detectChanges();
    let req = httpMock.expectOne(`${environment.apiUrl}/profile/user-123`);
    req.flush(mockProfileData);

    // Simular re-entrada a la página
    component.ionViewWillEnter();

    // Debería hacer una SEGUNDA petición
    req = httpMock.expectOne(`${environment.apiUrl}/profile/user-123`);
    req.flush(mockProfileData);

    expect(component.profileData).toBeDefined();
  });
});
