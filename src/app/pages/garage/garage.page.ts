import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { WikiService, CarWikiItem } from '../../services/wiki.service';

import { CarDetailsModalComponent } from './car-details-modal/car-details-modal.component';

@Component({
  selector: 'app-garage',
  templateUrl: './garage.page.html',
  styleUrls: ['./garage.page.scss'],
  standalone: false
})
export class GaragePage implements OnInit {
  cars: CarWikiItem[] = [];
  isLoading = true;

  carVisuals: Record<string, string> = {
    'Street Tuner Rojo': 'assets/cars/car1_red.webp',
    'Street Tuner Verde': 'assets/cars/car1_green.webp',
    'Street Tuner Púrpura': 'assets/cars/car1_purple.webp',
    'Street Tuner Amarillo': 'assets/cars/car1_yellow.webp',
    'Terra SUV Rojo': 'assets/cars/car2_red.webp',
    'Terra SUV Verde': 'assets/cars/car2_green.webp',
    'Terra SUV Púrpura': 'assets/cars/car2_purple.webp',
    'Terra SUV Amarillo': 'assets/cars/car2_yellow.webp',
    'Phantom GT Rojo': 'assets/cars/car3_red.webp',
    'Phantom GT Verde': 'assets/cars/car3_green.webp',
    'Phantom GT Púrpura': 'assets/cars/car3_purple.webp',
    'Phantom GT Amarillo': 'assets/cars/car3_yellow.webp',
    'Solaris Supercar Rojo': 'assets/cars/car4_red.webp',
    'Solaris Supercar Verde': 'assets/cars/car4_green.webp',
    'Solaris Supercar Púrpura': 'assets/cars/car4_purple.webp',
    'Solaris Supercar Amarillo': 'assets/cars/car4_yellow.webp',
  };

  constructor(
    private wikiService: WikiService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.loadCars();
  }

  loadCars() {
    this.wikiService.getCars().subscribe({
      next: (data) => {
        this.cars = data.map(car => ({
          ...car,
          image: this.carVisuals[car.name] || 'assets/cars/car1_red.webp', // Fallback
          class: this.getCarClass(car.cost_to_unlock)
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading cars', err);
        this.isLoading = false;
      }
    });
  }

  async openDetails(car: CarWikiItem) {
    const modal = await this.modalCtrl.create({
      component: CarDetailsModalComponent,
      componentProps: { car },
      cssClass: 'car-details-modal'
    });
    return await modal.present();
  }

  // Helper para determinar la clase
  getCarClass(cost: number): string {
    if (cost === 0) return 'D-Class';
    if (cost < 3000) return 'C-Class';
    if (cost < 6000) return 'B-Class';
    if (cost < 9000) return 'A-Class';
    return 'S-Class';
  }
}