import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { AppConfig } from 'src/app/services/global.service';
import { OverlayService } from 'src/app/overlay/overlay.module';
import { ProgressSpinnerComponent } from 'src/app/progress-spinner/progress-spinner.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  config = new AppConfig()

  constructor(private previewProgressSpinner: OverlayService, private router: Router) { }

  ngOnInit() {
  }

  signinWithGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    firebase.auth().signInWithPopup(provider).then(result => {
      //console.log(result)
      const user_email = result.user.email
      this.checkFirestoreAndRedirect(user_email)
    }).catch(err => {
      this.previewProgressSpinner.close()
      this.config.displayMessage(`${err}`, false)
    })
  }

  signinWithFacebook() {
    var provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('user_events');
    provider.addScope('email');
    provider.addScope('user_birthday');
    provider.addScope('user_friends');
    firebase.auth().signInWithPopup(provider).then(result => {
      console.log(result)
      const user_email = result.user.email
      this.checkFirestoreAndRedirect(user_email)
    }).catch(err => {
      this.previewProgressSpinner.close()
      this.config.displayMessage(`${err}`, false)
    })
  }

  signinWithEmailAndPassword() {
    const email = (<HTMLInputElement>document.getElementById("email")).value.toLowerCase()
    const password = (<HTMLInputElement>document.getElementById("review")).value

    if (email == '' && password == '') {
      this.config.displayMessage('Fill all fields.', false)
      return
    }
    this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
    firebase.auth().signInWithEmailAndPassword(email, password).then(result => {
      this.previewProgressSpinner.close()
      this.checkFirestoreAndRedirect(email)
    }).catch(err => {
      this.previewProgressSpinner.close()
      this.config.displayMessage(`${err}`, false)
    })
  }

  checkFirestoreAndRedirect(email: string) {
    this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
    firebase.firestore().collection('users').doc(email.toLowerCase()).get().then(result => {
      this.previewProgressSpinner.close()
      if (!result.exists) {
        firebase.auth().signOut()
        this.previewProgressSpinner.close()
        this.config.displayMessage('User does not exist. Please create an account.', false)
        return
      }
      const user = result.data()
      const blocked: boolean = user['blocked']
      if (blocked) {
        this.config.displayMessage('Sorry, user has been blocked. Please contact support.', false)
        return
      }
      localStorage.setItem('email', email)
      this.router.navigate(['/home/three'])
    }).catch(err => {
      this.previewProgressSpinner.close()
      this.config.displayMessage(`${err}`, false)
    })
  }

}
