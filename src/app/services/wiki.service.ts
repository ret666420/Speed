import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

export interface CarWikiItem {
    car_id: string;
    name: string;
    cost_to_unlock: number;
    base_motor: number;
    base_durabilidad: number;
    base_aceleracion: number;
    description: string;
    image?: string;
    class?: string;
}

@Injectable({
    providedIn: 'root'
})
export class WikiService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getCars(): Observable<CarWikiItem[]> {
        return this.http.get<CarWikiItem[]>(`${this.apiUrl}/cars`);
    }
    getMaps(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/maps/public`);
    }
}