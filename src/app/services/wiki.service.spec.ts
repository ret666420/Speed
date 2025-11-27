import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WikiService, CarWikiItem } from './wiki.service';
// IMPORTANTE: Importamos el environment para usar la URL dinámica en la prueba
import { environment } from '../../environments/environment';

describe('WikiService', () => {
  let service: WikiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WikiService]
    });
    service = TestBed.inject(WikiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya solicitudes pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCars', () => {
    it('debería hacer una petición GET para obtener los coches', () => {
      const mockCars: CarWikiItem[] = [
        {
          car_id: '1',
          name: 'Street Tuner',
          cost_to_unlock: 0,
          base_motor: 1.0,
          base_durabilidad: 1.0,
          base_aceleracion: 1.0,
          description: 'Coche inicial'
        },
        {
          car_id: '2',
          name: 'Terra SUV',
          cost_to_unlock: 2000,
          base_motor: 0.8,
          base_durabilidad: 2.0,
          base_aceleracion: 0.7,
          description: 'Tanque'
        }
      ];

      service.getCars().subscribe((cars) => {
        expect(cars.length).toBe(2);
        expect(cars).toEqual(mockCars);
      });

      // CORRECCIÓN: Usamos la variable environment.apiUrl en lugar de localhost fijo
      const req = httpMock.expectOne(`${environment.apiUrl}/cars`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCars);
    });
  });

  describe('getMaps', () => {
    it('debería hacer una petición GET para obtener los mapas públicos', () => {
      const mockMaps = [
        {
          map_id: '1',
          name: 'Cañón Desértico',
          cost_to_unlock: 0,
          world_record: 1000,
          total_owners: 50
        },
        {
          map_id: '2',
          name: 'Ciudad Neón',
          cost_to_unlock: 5000,
          world_record: 5000,
          total_owners: 10
        }
      ];

      service.getMaps().subscribe((maps) => {
        expect(maps.length).toBe(2);
        expect(maps).toEqual(mockMaps);
      });

      // CORRECCIÓN: Usamos la variable environment.apiUrl en lugar de localhost fijo
      const req = httpMock.expectOne(`${environment.apiUrl}/maps/public`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMaps);
    });
  });
});
