import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterPage } from './register.page';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { of, throwError } from 'rxjs';

describe('RegisterPage', () => {
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;

  // Espías
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateBack']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'warning']);

    await TestBed.configureTestingModule({
      declarations: [RegisterPage],
      imports: [
        IonicModule.forRoot(),
        FormsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NavController, useValue: navCtrlSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- UI Interactions ---

  it('debería alternar la visibilidad de la contraseña', () => {
    expect(component.showPassword).toBeFalse();
    component.togglePassword();
    expect(component.showPassword).toBeTrue();
    component.togglePassword();
    expect(component.showPassword).toBeFalse();
  });

  it('debería alternar la visibilidad de confirmar contraseña', () => {
    expect(component.showConfirmPassword).toBeFalse();
    component.toggleConfirmPassword();
    expect(component.showConfirmPassword).toBeTrue();
    component.toggleConfirmPassword();
    expect(component.showConfirmPassword).toBeFalse();
  });

  // --- Validaciones ---

  it('debería mostrar advertencia si faltan campos', () => {
    component.username = '';
    component.email = '';
    component.password = '';
    component.confirmPassword = '';

    component.register();

    expect(toastServiceSpy.warning).toHaveBeenCalledWith('Por favor completa todos los campos');
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('debería mostrar advertencia si las contraseñas no coinciden', () => {
    component.username = 'user';
    component.email = 'test@test.com';
    component.password = '123';
    component.confirmPassword = '456'; // Diferente

    component.register();

    expect(toastServiceSpy.warning).toHaveBeenCalledWith('Las contraseñas no coinciden');
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  // --- Registro Exitoso ---

  it('debería registrar exitosamente y navegar al login', () => {
    component.username = 'newUser';
    component.email = 'new@test.com';
    component.password = '123456';
    component.confirmPassword = '123456';

    const mockResponse = {
      message: 'Usuario creado',
      user: {
        user_id: '999',
        username: 'newUser',
        created_at: 'date'
      }
    };

    // Configuramos el espía para devolver un observable inmediato (Síncrono)
    authServiceSpy.register.and.returnValue(of(mockResponse));

    component.register();

    // CORRECCIÓN 1: Quitamos expect(isLoading).toBeTrue() porque al ser síncrono,
    // pasa a true y luego a false antes de llegar a esta línea.
    expect(component.isLoading).toBeFalse();

    expect(authServiceSpy.register).toHaveBeenCalledWith('newUser', 'new@test.com', '123456');

    // CORRECCIÓN 2: Texto ajustado a lo que realmente envía tu componente (según el log de error)
    expect(toastServiceSpy.success).toHaveBeenCalledWith('Registro exitoso, ahora inicia sesión');

    expect(navCtrlSpy.navigateBack).toHaveBeenCalledWith('/login');
  });

  // --- Manejo de Errores ---

  it('debería manejar errores del registro (ej. usuario ya existe)', () => {
    component.username = 'existingUser';
    component.email = 'exist@test.com';
    component.password = '123456';
    component.confirmPassword = '123456';

    const mockError = { error: { error: 'El usuario ya existe' } };
    authServiceSpy.register.and.returnValue(throwError(() => mockError));

    component.register();

    expect(authServiceSpy.register).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('El usuario ya existe');
    // Nota: Tu código llama a errorMessage Y a toast.error
    // Si falla aquí, revisa si en tu componente tienes this.toast.error(msg)
  });

  it('debería manejar error genérico si no hay mensaje del backend', () => {
    component.username = 'user';
    component.email = 'test@test.com';
    component.password = '123';
    component.confirmPassword = '123';

    const mockError = { status: 500 }; // Sin propiedad error.error
    authServiceSpy.register.and.returnValue(throwError(() => mockError));

    component.register();

    expect(component.errorMessage).toContain('Ocurrió un error al crear la cuenta');
  });
});
