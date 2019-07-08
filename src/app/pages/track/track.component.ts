import { Component, OnInit } from '@angular/core';
import { OverlayService } from 'src/app/overlay/overlay.module';
import { AppConfig } from 'src/app/services/global.service';
import { ProgressSpinnerComponent } from 'src/app/progress-spinner/progress-spinner.module';
import * as firebase from 'firebase';
import { TacOrder } from 'src/app/models/order';
import { ProductsService } from 'src/app/shared/services/products.service';

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss']
})
export class TrackComponent implements OnInit {

  constructor(private previewProgressSpinner: OverlayService, public productsService: ProductsService) { }
  config = new AppConfig()
  error = false
  order: TacOrder

  ngOnInit() {
  }

  track() {
    this.error = false
    this.order = null
    const track_id = (<HTMLInputElement>document.getElementById("track_id")).value
    if (track_id == '') {
      this.config.displayMessage('Fill your tracking id.', false)
      return
    }
    this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
    firebase.firestore().collection('orders').where("track_id", "==", Number(track_id)).onSnapshot(r => {
      this.previewProgressSpinner.close()
      r.forEach(result => {
        this.order = <TacOrder>result.data()
      })
      if (this.order == null) {
        this.error = true
      }
    })
    // .catch(err => {
    //   this.previewProgressSpinner.close()
    //   this.config.displayMessage(`${err}`, false)
    // })
  }

}
