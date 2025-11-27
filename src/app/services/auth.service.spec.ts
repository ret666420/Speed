import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { LoginResponse, RegisterResponse } from '../models/auth.models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  // Datos simulados
  const mockUser = {
    user_id: '123-abc',
    username: 'testUser',
    email: 'test@speed.com',
    profile: { display_name: 'Tester', monedas: 100 }
  };

  const mockLoginResponse: LoginResponse = {
    message: 'Login exitoso',
    user: mockUser
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Limpiamos el localStorage antes de cada prueba para asegurar un estado limpio
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('debería enviar POST, retornar datos y guardar usuario en localStorage', () => {
      const credentials = { username: 'user', password: 'pass' };

      // Espiamos el localStorage
      spyOn(localStorage, 'setItem');

      service.login(credentials.username, credentials.password).subscribe((res) => {
        expect(res).toEqual(mockLoginResponse);
        // Verificamos que se llamó a setItem con la clave correcta y el usuario stringificado
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'speed_mobile_user',
          JSON.stringify(mockUser)
        );
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockLoginResponse);
    });

    it('no debería guardar en localStorage si la respuesta no tiene usuario', () => {
      const credentials = { username: 'user', password: 'pass' };
      const emptyResponse = { message: 'Error' } as LoginResponse;

      spyOn(localStorage, 'setItem');

      service.login(credentials.username, credentials.password).subscribe(() => {
        expect(localStorage.setItem).not.toHaveBeenCalled();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/login`);
      req.flush(emptyResponse);
    });
  });

  describe('register', () => {
    it('debería enviar POST con los datos correctos', () => {
      const registerData = { username: 'new', email: 'new@mail.com', password: '123' };
      const mockRegisterResponse: RegisterResponse = {
        message: 'Creado',
        user: { user_id: '1', username: 'new', created_at: 'date' }
      };

      service.register(registerData.username, registerData.email, registerData.password).subscribe((res) => {
        expect(res).toEqual(mockRegisterResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/register`);
      expect(req.request.method).toBe('POST');
      // Verificamos que añade el display_name automáticamente
      expect(req.request.body).toEqual({
        ...registerData,
        display_name: registerData.username
      });
      req.flush(mockRegisterResponse);
    });
  });

  describe('Gestión de Sesión (Getters & Logout)', () => {
    it('currentUser debería retornar null si no hay datos en localStorage', () => {
      localStorage.clear();
      expect(service.currentUser).toBeNull();
    });

    it('currentUser debería retornar el objeto usuario si existe en localStorage', () => {
      localStorage.setItem('speed_mobile_user', JSON.stringify(mockUser));
      expect(service.currentUser).toEqual(mockUser);
    });

    it('currentUser debería manejar errores de JSON inválido (catch block)', () => {
      // Simulamos basura en el storage que no es JSON válido
      localStorage.setItem('speed_mobile_user', '{usuario: invalido,,,');

      // Espiamos console.error para que no ensucie el output de la prueba
      spyOn(console, 'error');

      expect(service.currentUser).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('currentUserId debería retornar el ID si hay usuario', () => {
      localStorage.setItem('speed_mobile_user', JSON.stringify(mockUser));
      expect(service.currentUserId).toBe('123-abc');
    });

    it('currentUserId debería retornar null si no hay usuario', () => {
      localStorage.clear();
      expect(service.currentUserId).toBeNull();
    });

    it('logout debería limpiar el localStorage', () => {
      localStorage.setItem('speed_mobile_user', 'algo');
      spyOn(localStorage, 'removeItem').and.callThrough();

      service.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('speed_mobile_user');
      expect(localStorage.getItem('speed_mobile_user')).toBeNull();
    });
  });
});
