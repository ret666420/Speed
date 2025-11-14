import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: false,
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {

 constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get('http://localhost:3000/api/test')
      .subscribe(data => {
        console.log("Respuesta del backend:", data);
      });
  }
}