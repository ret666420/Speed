import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CarWikiItem } from '../../../services/wiki.service';

@Component({
  selector: 'app-car-details-modal',
  templateUrl: './car-details-modal.component.html',
  styleUrls: ['./car-details-modal.component.scss'],
  standalone: false
})
export class CarDetailsModalComponent {

  @Input() car!: CarWikiItem;


  isLoading = false; 

  constructor(private modalCtrl: ModalController) { }

  dismiss() {
    this.modalCtrl.dismiss();
  }
  

  openDetails(car: any) {
    console.warn('openDetails llamado dentro del modal, verificar HTML');
  }
}