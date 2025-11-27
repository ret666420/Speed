import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InicioPage } from './inicio.page';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
// IMPORTANTE: Importamos el mismo environment que usa tu componente (prod)
// para que la URL coincida en la prueba.
import { environment } from '../../../environments/environment.prod';

describe('InicioPage', () => {
  let component: InicioPage;
  let fixture: ComponentFixture<InicioPage>;
  let httpMock: HttpTestingController;

  // Espías
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;

  // Datos simulados
  const mockProfileData = {
    user: {
      username: 'testUser',
      monedas: 6500, // Esto debería dar nivel 3 (6500 / 3000 = 2.16 -> floor + 1 = 3)
      display_name: 'Test Racer'
    }
  };

  beforeEach(async () => {
    // Mocks iniciales
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], { currentUserId: 'user-123' });
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);

    await TestBed.configureTestingModule({
      declarations: [InicioPage], // No es standalone
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NavController, useValue: navCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InicioPage);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    // NO ejecutamos detectChanges() aquí para controlar manualmente cuándo inicia el componente
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit debería cargar perfil y calcular nivel correctamente', () => {
    fixture.detectChanges(); // Dispara ngOnInit

    const req = httpMock.expectOne(`${environment.apiUrl}/profile/user-123`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProfileData);

    expect(component.profileData).toEqual(mockProfileData);
    expect(component.isLoading).toBeFalse();
    // Validación del cálculo: Math.floor(6500 / 3000) + 1 = 3
    expect(component.userLevel).toBe(3);
  });

  it('ionViewWillEnter debería recargar los datos', () => {
    // Simulamos que el usuario entra a la vista
    component.ionViewWillEnter();

    const req = httpMock.expectOne(`${environment.apiUrl}/profile/user-123`);
    req.flush(mockProfileData);

    expect(component.profileData).toBeDefined();
  });

  it('loadProfile debería redirigir al login si no hay usuario (currentUserId es null)', () => {
    // Sobrescribimos el getter del espía para que devuelva null.
    // CORRECCIÓN: Hacemos cast a jasmine.Spy para que TypeScript no marque error.
    (Object.getOwnPropertyDescriptor(authServiceSpy, 'currentUserId')?.get as jasmine.Spy).and.returnValue(null);

    component.loadProfile();

    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/login');
    // Verificamos que NO se hizo ninguna petición HTTP
    httpMock.expectNone(`${environment.apiUrl}/profile/null`);
  });

  it('loadProfile debería manejar error de la API', () => {
    spyOn(console, 'error'); // Espiamos la consola para que no ensucie el reporte

    component.loadProfile();

    const req = httpMock.expectOne(`${environment.apiUrl}/profile/user-123`);
    req.error(new ErrorEvent('Network error'));

    expect(component.isLoading).toBeFalse();
    expect(console.error).toHaveBeenCalledWith('Error cargando perfil', jasmine.any(Object));
  });

  it('getInitials debería devolver las iniciales en mayúscula', () => {
    const result = component.getInitials('juan perez');
    expect(result).toBe('JU');
  });

  it('getInitials debería devolver SP si el nombre es vacío o nulo', () => {
    expect(component.getInitials('')).toBe('SP');
    expect(component.getInitials(null as any)).toBe('SP');
    expect(component.getInitials(undefined as any)).toBe('SP');
  });

  it('logout debería llamar al servicio y redirigir', () => {
    component.logout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/login');
  });
});
