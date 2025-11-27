import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { ToastController } from '@ionic/angular';
import { checkmarkCircleOutline, closeCircleOutline, informationCircleOutline, warningOutline } from 'ionicons/icons';

describe('ToastService', () => {
  let service: ToastService;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  // Este espía simula el "objeto toast" que devuelve el controlador al crearse
  let toastElementSpy: jasmine.SpyObj<HTMLIonToastElement>;

  beforeEach(() => {
    // 1. Creamos el mock del elemento Toast (lo único que hace es presentarse)
    toastElementSpy = jasmine.createSpyObj('HTMLIonToastElement', ['present']);

    // 2. Creamos el mock del Controlador
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create', 'dismiss']);

    // Configuramos que 'create' devuelva nuestro elemento falso
    toastControllerSpy.create.and.returnValue(Promise.resolve(toastElementSpy));
    // Configuramos que 'dismiss' resuelva bien (simulando que cerró el anterior)
    toastControllerSpy.dismiss.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        ToastService,
        { provide: ToastController, useValue: toastControllerSpy }
      ]
    });
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('debería mostrar un toast de ÉXITO con el icono y color correctos', async () => {
    const msg = 'Operación exitosa';
    await service.success(msg);

    // Verificamos que primero intenta cerrar anteriores
    expect(toastControllerSpy.dismiss).toHaveBeenCalled();

    // Verificamos los parámetros de creación
    expect(toastControllerSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      message: msg,
      color: 'success',
      icon: checkmarkCircleOutline,
      position: 'top'
    }));

    // Verificamos que se muestre
    expect(toastElementSpy.present).toHaveBeenCalled();
  });

  it('debería mostrar un toast de ERROR con el icono y color correctos', async () => {
    const msg = 'Fallo crítico';
    await service.error(msg);

    expect(toastControllerSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      message: msg,
      color: 'danger',
      icon: closeCircleOutline
    }));
    expect(toastElementSpy.present).toHaveBeenCalled();
  });

  it('debería mostrar un toast de INFORMACIÓN', async () => {
    const msg = 'Sabías que...';
    await service.info(msg);

    expect(toastControllerSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      message: msg,
      color: 'primary',
      icon: informationCircleOutline
    }));
  });

  it('debería mostrar un toast de ADVERTENCIA', async () => {
    const msg = 'Cuidado';
    await service.warning(msg);

    expect(toastControllerSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      message: msg,
      color: 'warning',
      icon: warningOutline
    }));
  });

  it('debería manejar errores al intentar cerrar un toast previo (catch block)', async () => {
    // Simulamos que no hay toast previo para cerrar (esto lanzaría error en Ionic real)
    toastControllerSpy.dismiss.and.returnValue(Promise.reject('No toast to dismiss'));

    // Ejecutamos una acción cualquiera
    await service.success('Test');

    // La prueba pasa si no explota, demostrando que el try/catch del servicio funciona
    expect(toastControllerSpy.create).toHaveBeenCalled();
    expect(toastElementSpy.present).toHaveBeenCalled();
  });
});
