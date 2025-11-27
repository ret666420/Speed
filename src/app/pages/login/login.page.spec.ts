import { AuthService } from './../../services/auth.service';
import { ToastService } from './../../services/toast.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms'; // Necesario para ngModel
import { of, throwError } from 'rxjs';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  // Definimos los espías
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    // Creamos los mocks
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateForward']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'warning']);

    await TestBed.configureTestingModule({
      declarations: [LoginPage], // No es standalone
      imports: [
        IonicModule.forRoot(),
        FormsModule // Importante para [(ngModel)]
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NavController, useValue: navCtrlSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería alternar la visibilidad de la contraseña', () => {
    expect(component.showPassword).toBeFalse(); // Estado inicial

    component.togglePassword();
    expect(component.showPassword).toBeTrue(); // Primer click

    component.togglePassword();
    expect(component.showPassword).toBeFalse(); // Segundo click
  });

  it('debería mostrar advertencia si faltan campos al intentar loguearse', () => {
    // Caso 1: Campos vacíos
    component.username = '';
    component.password = '';

    component.login();

    expect(toastServiceSpy.warning).toHaveBeenCalledWith('Por favor completa todos los campos');
    expect(authServiceSpy.login).not.toHaveBeenCalled(); // No debe llamar a la API
  });

  it('debería realizar login exitoso y navegar', () => {
    // Datos válidos
    component.username = 'testUser';
    component.password = '123456';

    const mockResponse = {
      message: 'Exito',
      user: {
        user_id: '1',
        username: 'testUser',
        email: 'test@test.com',
        profile: { display_name: 'Test', monedas: 0 }
      }
    };

    // Simulamos respuesta exitosa
    authServiceSpy.login.and.returnValue(of(mockResponse));

    component.login();

    expect(component.isLoading).toBeTrue(); // Debería activarse al inicio (aunque es síncrono en el test, verificamos el flujo)
    expect(authServiceSpy.login).toHaveBeenCalledWith('testUser', '123456');
    expect(toastServiceSpy.success).toHaveBeenCalledWith('Inicio de sesión exitoso');
    expect(navCtrlSpy.navigateForward).toHaveBeenCalledWith('/tabs/inicio');
    expect(component.isLoading).toBeFalse(); // Debería desactivarse al final
  });

  it('debería manejar errores de login correctamente', () => {
    component.username = 'testUser';
    component.password = 'wrongPass';

    // Simulamos error del backend (ej. 401)
    const mockError = { error: { error: 'Credenciales inválidas' } };
    authServiceSpy.login.and.returnValue(throwError(() => mockError));

    component.login();

    expect(authServiceSpy.login).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('Credenciales inválidas');
    expect(toastServiceSpy.error).toHaveBeenCalledWith('Credenciales inválidas');
  });

  it('debería manejar error de conexión genérico', () => {
    component.username = 'testUser';
    component.password = '123456';

    // Simulamos error sin mensaje específico (ej. servidor caído)
    const mockError = { status: 500 }; // Sin propiedad error.error
    authServiceSpy.login.and.returnValue(throwError(() => mockError));

    component.login();

    expect(component.errorMessage).toContain('error de conexión');
    expect(toastServiceSpy.error).toHaveBeenCalled();
  });
});
