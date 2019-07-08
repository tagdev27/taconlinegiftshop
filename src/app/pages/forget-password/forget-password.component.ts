import { Component, OnInit } from '@angular/core';
import { OverlayService } from 'src/app/overlay/overlay.module';
import { AppConfig } from 'src/app/services/global.service';
import { ProgressSpinnerComponent } from 'src/app/progress-spinner/progress-spinner.module';
import * as firebase from 'firebase';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {

  constructor(private previewProgressSpinner: OverlayService) { }
  config = new AppConfig()
  ngOnInit() {
  }

  reset() {
    const email = (<HTMLInputElement>document.getElementById("email")).value.toLowerCase()

    if (email == '') {
      this.config.displayMessage('Fill the email fields.', false)
      return
    }
    this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);

    firebase.auth().sendPasswordResetEmail(email).then(r => {
      this.previewProgressSpinner.close()
      this.config.displayMessage("Password reset instructions sent to mail.", true)
    }).catch(err => {
      this.previewProgressSpinner.close()
      this.config.displayMessage(`${err}`, false)
    })
  }

}
