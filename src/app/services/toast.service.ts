import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { checkmarkCircleOutline, closeCircleOutline, informationCircleOutline, warningOutline } from 'ionicons/icons';

@Injectable({
    providedIn: 'root'
})
export class ToastService {

    constructor(private toastController: ToastController) { }

    async success(message: string) {
        await this.presentToast(message, 'success', checkmarkCircleOutline);
    }

    async error(message: string) {
        await this.presentToast(message, 'danger', closeCircleOutline);
    }

    async info(message: string) {
        await this.presentToast(message, 'primary', informationCircleOutline);
    }

    async warning(message: string) {
        await this.presentToast(message, 'warning', warningOutline);
    }

    private async presentToast(message: string, color: string, icon: string) {
        try {
            await this.toastController.dismiss();
        } catch (e) { }

        const toast = await this.toastController.create({
            message: message,
            duration: 2500,
            color: color,
            icon: icon,
            position: 'top',
            cssClass: 'custom-toast',
            buttons: [
                {
                    icon: 'close',
                    role: 'cancel',
                    handler: () => { console.log('Toast cerrado'); }
                }
            ]
        });
        await toast.present();
    }
}