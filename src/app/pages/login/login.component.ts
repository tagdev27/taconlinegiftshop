import { Component, OnInit } from '@angular/core';
import * as firebase from "firebase/app";
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';
import { AppConfig } from 'src/app/services/global.service';
import { OverlayService } from 'src/app/overlay/overlay.module';
import { ProgressSpinnerComponent } from 'src/app/progress-spinner/progress-spinner.module';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  config = new AppConfig()

  next_url = ''

  constructor(private previewProgressSpinner: OverlayService, private router: Router, private route: ActivatedRoute) { }


  ngOnInit() {
    // if (location.search != '') {
    //   const url = location.search.substring(11).replace('%2F', '/')
    //   this.next_url = url
    // }
  }

  signinWithGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    provider.addScope('https://www.googleapis.com/auth/calendar.events.readonly')
    firebase.auth().signInWithPopup(provider).then(result => {
      //console.log(result)
      const user_email = result.user.email
      this.checkFirestoreAndRedirect('google', user_email, result)
    }).catch(err => {
      //this.previewProgressSpinner.close()
      //this.config.displayMessage(`${err}`, false)
    })
  }

  signinWithFacebook() {
    var provider = new firebase.auth.FacebookAuthProvider();
    // provider.addScope('user_events');
    provider.addScope('email');
    // provider.addScope('user_birthday');
    // provider.addScope('user_friends');
    // provider.addScope('user_gender')
    firebase.auth().signInWithPopup(provider).then(result => {
      //console.log(result)
      const user_email = result.user.email
      if(user_email == null){
        firebase.auth().signOut()
        this.config.displayMessage(`Your facebook account doesn't have an email address. Please try with another account`, false)
        return;
      }
      this.checkFirestoreAndRedirect('facebook', user_email, result)
    }).catch(err => {
      //this.previewProgressSpinner.close()
      //this.config.displayMessage(`${err}`, false)
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
      this.checkFirestoreAndRedirect('email', email, null)
    }).catch(err => {
      this.previewProgressSpinner.close()
      this.config.displayMessage(`${err}`, false)
    })
  }

  checkFirestoreAndRedirect(method: string, email: string, social_result: firebase.auth.UserCredential) {
    this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
    firebase.firestore().collection('users').doc(email.toLowerCase()).get().then(async result => {
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
      firebase.analytics().logEvent('login', { email: `${email}`, user_data: user, platform : 'web'});
      if (social_result != null) {
        if (method == 'google') {
          await firebase.firestore().collection('users').doc(email.toLowerCase()).update({
            'Tokens': social_result.credential.toJSON(),
            // 'picture': social_result.additionalUserInfo.profile['picture']
          })
        }
        if (method == 'facebook') {
          const pic = social_result.additionalUserInfo.profile['picture']
          const pic_data = pic['data']
          await firebase.firestore().collection('users').doc(email.toLowerCase()).update({
            'Facebook': social_result.credential.toJSON(),
            // 'picture': pic_data['url'],
            'birthday': (social_result.additionalUserInfo.profile['birthday'] == undefined) ? '' : social_result.additionalUserInfo.profile['birthday'],
            'gender': (social_result.additionalUserInfo.profile['gender'] == undefined) ? '' : social_result.additionalUserInfo.profile['gender'],
            'facebook_id': social_result.additionalUserInfo.profile['id'],
          })
        }
      }
      localStorage.setItem('email', email)
      localStorage.setItem('fn', user['firstname'])
      localStorage.setItem('ln', user['lastname'])
      localStorage.removeItem("signInAnonymously")
      if (location.search != '') {
        const url = location.search.substring(11).replace('%2F', '/')
        location.href = url
      } else {
        location.href = '/home'
      }
      //this.router.navigate(['/home'])
    }).catch(err => {
      this.previewProgressSpinner.close()
      this.config.displayMessage(`${err}`, false)
    })
  }

}
