import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GaragePage } from './garage.page';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { ComponentsModule } from '../../components/components.module';
import { AuthService } from '../../services/auth.service';
import { WikiService, CarWikiItem } from '../../services/wiki.service';
import { of, throwError } from 'rxjs';

describe('GaragePage', () => {
  let component: GaragePage;
  let fixture: ComponentFixture<GaragePage>;

  // Definimos los espías con tipos estrictos
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let wikiServiceSpy: jasmine.SpyObj<WikiService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;

  // Datos de prueba (Mock Data)
  const mockCars: CarWikiItem[] = [
    {
      car_id: '1',
      name: 'Street Tuner Rojo',
      cost_to_unlock: 0, // Gratis -> D-Class
      base_motor: 1.0,
      base_durabilidad: 1.0,
      base_aceleracion: 1.0,
      description: 'Coche inicial',
      image: 'assets/cars/car1.png'
    },
    {
      car_id: '2',
      name: 'Solaris Supercar Amarillo',
      cost_to_unlock: 10000, // Caro -> S-Class
      base_motor: 2.2,
      base_durabilidad: 0.5,
      base_aceleracion: 2.0,
      description: 'Coche rápido',
      image: 'assets/cars/car4.png'
    }
  ];

  beforeEach(async () => {
    // Configuración de los espías
    authServiceSpy = jasmine.createSpyObj('AuthService', [], { currentUserId: 'user-123' });
    wikiServiceSpy = jasmine.createSpyObj('WikiService', ['getCars']);
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);

    // El mock del ModalController es especial: create() devuelve una promesa que resuelve un objeto con present()
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['create']);
    modalCtrlSpy.create.and.returnValue(Promise.resolve({
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
    } as any));

    // Configuración por defecto: devolver lista de coches exitosa
    wikiServiceSpy.getCars.and.returnValue(of(mockCars));

    await TestBed.configureTestingModule({
      declarations: [GaragePage],
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule,
        ComponentsModule // Para <app-header>
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: WikiService, useValue: wikiServiceSpy },
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: NavController, useValue: navCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GaragePage);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Dispara ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar los coches al iniciar (ngOnInit)', () => {
    expect(wikiServiceSpy.getCars).toHaveBeenCalled();
    expect(component.cars.length).toBe(2);
    expect(component.isLoading).toBeFalse();

    // Verificamos que se asignó una clase CSS (D-Class) correctamente al primer coche
    expect(component.cars[0].class).toBe('D-Class');
  });

  it('debería redirigir al login si no hay usuario', () => {
    // Simulamos que no hay usuario logueado
    Object.defineProperty(authServiceSpy, 'currentUserId', { get: () => null });

    component.loadCars();

    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/login');
  });

  it('debería manejar error al cargar coches', () => {
    // Simulamos error en la API
    wikiServiceSpy.getCars.and.returnValue(throwError(() => new Error('Error API')));

    component.loadCars();

    expect(component.isLoading).toBeFalse();
    // Aquí podríamos verificar si se muestra un mensaje de error si tu componente lo tuviera
  });

  it('debería abrir el modal de detalles al hacer clic', async () => {
    const carToOpen = mockCars[0];

    await component.openDetails(carToOpen);

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    // Verificamos que se pasó el coche correcto al modal
    const callArgs = modalCtrlSpy.create.calls.mostRecent().args[0];
    expect(callArgs.componentProps).toEqual({ car: carToOpen });
  });

  // --- Pruebas de lógica visual (getCarClass) ---

  it('debería asignar D-Class a coches gratis (costo 0)', () => {
    expect(component.getCarClass(0)).toBe('D-Class');
  });

  it('debería asignar C-Class a coches baratos (< 3000)', () => {
    expect(component.getCarClass(2500)).toBe('C-Class');
  });

  it('debería asignar B-Class a coches medios (< 6000)', () => {
    expect(component.getCarClass(5000)).toBe('B-Class');
  });

  it('debería asignar A-Class a coches caros (< 9000)', () => {
    expect(component.getCarClass(8000)).toBe('A-Class');
  });

  it('debería asignar S-Class a coches muy caros (>= 9000)', () => {
    expect(component.getCarClass(10000)).toBe('S-Class');
  });
});
