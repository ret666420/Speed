import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { CarDetailsModalComponent } from './car-details-modal.component';
import { CarWikiItem } from '../../../services/wiki.service';

describe('CarDetailsModalComponent', () => {
  let component: CarDetailsModalComponent;
  let fixture: ComponentFixture<CarDetailsModalComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  beforeEach(async () => {
    // Creamos el espía para el ModalController
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);

    await TestBed.configureTestingModule({
      declarations: [CarDetailsModalComponent], // No es standalone
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CarDetailsModalComponent);
    component = fixture.componentInstance;

    // --- SOLUCIÓN: Mock Data Correcta ---
    const mockCar: CarWikiItem = {
      car_id: '123',
      name: 'Test Car',
      cost_to_unlock: 1000,
      base_motor: 1.0,
      base_durabilidad: 1.0,
      base_aceleracion: 1.0,
      description: 'Test description',
      image: 'assets/test.png',
      class: 'D-Class'
    };

    component.car = mockCar;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería cerrar el modal al llamar a dismiss()', () => {
    // Ejecutamos el método del componente
    component.dismiss();

    // Verificamos que se haya llamado al método dismiss del controlador de Ionic
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
  });
});
