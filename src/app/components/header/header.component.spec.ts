import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { IonicModule, NavController, AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  // Espías
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let alertCtrlSpy: jasmine.SpyObj<AlertController>;
  let alertElementSpy: jasmine.SpyObj<HTMLIonAlertElement>;

  beforeEach(async () => {
    // 1. Crear Mocks
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['success']);

    // Mock complejo para AlertController
    alertCtrlSpy = jasmine.createSpyObj('AlertController', ['create']);
    alertElementSpy = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);

    // Configurar que create() devuelva nuestro elemento falso
    alertCtrlSpy.create.and.returnValue(Promise.resolve(alertElementSpy));

    await TestBed.configureTestingModule({
      declarations: [HeaderComponent], // No es standalone
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NavController, useValue: navCtrlSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: AlertController, useValue: alertCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar la alerta de confirmación al intentar salir', async () => {
    await component.logout();

    expect(alertCtrlSpy.create).toHaveBeenCalled();
    expect(alertElementSpy.present).toHaveBeenCalled();
  });

  it('debería cerrar sesión y navegar al login al confirmar (handler: confirm)', async () => {
    await component.logout();

    // 1. Capturamos los argumentos. Usamos '!' para asegurar que existe.
    const alertConfig = alertCtrlSpy.create.calls.mostRecent().args[0]!;

    // 2. Buscamos el botón de 'confirmar'
    // Forzamos el tipo 'any' para acceder a las propiedades internas sin lío de tipos
    const confirmButton = (alertConfig.buttons as any[]).find((b: any) => b.role === 'confirm');

    expect(confirmButton).toBeDefined();

    // 3. Ejecutamos manualmente su handler
    confirmButton.handler();

    // 4. Verificamos que se ejecutó la lógica de logout
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(toastServiceSpy.success).toHaveBeenCalledWith('Sesión finalizada exitosamente');
    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/login');
  });

  it('no debería hacer nada al cancelar (handler: cancel)', async () => {
    // Espiamos el console.log para verificar que entró al cancel
    spyOn(console, 'log');

    await component.logout();

    // Usamos '!' aquí también
    const alertConfig = alertCtrlSpy.create.calls.mostRecent().args[0]!;
    const cancelButton = (alertConfig.buttons as any[]).find((b: any) => b.role === 'cancel');

    expect(cancelButton).toBeDefined();

    // Ejecutamos handler de cancelar
    cancelButton.handler();

    // Verificamos que NO se cerró sesión
    expect(authServiceSpy.logout).not.toHaveBeenCalled();
    expect(navCtrlSpy.navigateRoot).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('Logout cancelado');
  });
});
