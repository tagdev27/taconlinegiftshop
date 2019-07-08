import { Component, OnInit } from '@angular/core';
import { AppConfig } from 'src/app/services/global.service';
import { OverlayService } from 'src/app/overlay/overlay.module';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { ProgressSpinnerComponent } from 'src/app/progress-spinner/progress-spinner.module';
import { ProductsService } from 'src/app/shared/services/products.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  config = new AppConfig()

  constructor(private previewProgressSpinner: OverlayService, private router: Router, private productService: ProductsService) { }

  ngOnInit() {
  }

  signupWithGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    provider.addScope('https://www.googleapis.com/auth/calendar.events.readonly')
    firebase.auth().signInWithPopup(provider).then(result => {
      console.log(result)
      const user_email = result.user.email
      this.uploadFirestoreAndRedirect(user_email, result, null)
    }).catch(err => {
      this.previewProgressSpinner.close()
      this.config.displayMessage(`${err}`, false)
    })
  }

  signupWithFacebook() {
    var provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('user_events');
    provider.addScope('email');
    provider.addScope('user_birthday');
    provider.addScope('user_friends');
    firebase.auth().signInWithPopup(provider).then(result => {
      console.log(result)
      const user_email = result.user.email
      this.uploadFirestoreAndRedirect(user_email, result, null)
    }).catch(err => {
      this.previewProgressSpinner.close()
      this.config.displayMessage(`${err}`, false)
    })
  }

  signupWithEmailAndPassword() {
    const fname = (<HTMLInputElement>document.getElementById("fname")).value
    const lname = (<HTMLInputElement>document.getElementById("lname")).value
    const email = (<HTMLInputElement>document.getElementById("email")).value.toLowerCase()
    const password = (<HTMLInputElement>document.getElementById("review")).value

    if (email == '' && password == '' && fname == '' && lname == '') {
      this.config.displayMessage('Fill all fields.', false)
      return
    }
    this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
    firebase.auth().createUserWithEmailAndPassword(email, password).then(result => {
      this.previewProgressSpinner.close()
      const data = {
        fn: fname,
        ln: lname
      }
      this.uploadFirestoreAndRedirect(email, null, data)
    }).catch(err => {
      this.previewProgressSpinner.close()
      this.config.displayMessage(`${err}`, false)
    })
  }

  uploadFirestoreAndRedirect(email: string, google_result: firebase.auth.UserCredential, other_result: {}) {
    this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);

    var user_data: {}
    const id = firebase.database().ref().push().key

    if (other_result != null) {
      user_data = {
        'id': id,
        'blocked': false,
        'country': this.productService.country,
        'email': email,
        'created_date': `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        'firstname': other_result['fn'],
        'lastname': other_result['ln']
      }
    }else {
      user_data = {
        'id': id,
        'blocked': false,
        'country': this.productService.country,
        'email': email,
        'created_date': `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        'firstname': google_result.additionalUserInfo.profile['given_name'],
        'lastname': google_result.additionalUserInfo.profile['family_name'],
        'picture': google_result.additionalUserInfo.profile['picture'],
        'Tokens': google_result.credential.toJSON()
      }
    }

    firebase.firestore().collection('users').doc(email.toLowerCase()).set(user_data).then(result => {
      this.previewProgressSpinner.close()
      localStorage.setItem('email', email)
      this.router.navigate(['/home/three'])
    }).catch(err => {
      this.previewProgressSpinner.close()
      this.config.displayMessage(`${err}`, false)
    })
  }

}
