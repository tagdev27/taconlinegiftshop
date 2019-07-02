import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as firebase from "firebase"
import { Users } from './models/users';
import { Router } from '@angular/router';

@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

   constructor(translate: TranslateService, private router: Router) {
      translate.setDefaultLang('en');
      translate.addLangs(['en', 'fr']);
   }

   isLoggedIn: boolean = false;
   email: string = '';
   isLogout = true

   ngOnInit() {
      const firebaseConfig = {
         apiKey: "AIzaSyAu77RE_S5__DnrmaR1LKJvqtNNyR0mSzo",
         authDomain: "taconlinegiftshop.firebaseapp.com",
         databaseURL: "https://taconlinegiftshop.firebaseio.com",
         projectId: "taconlinegiftshop",
         storageBucket: "taconlinegiftshop.appspot.com",
         messagingSenderId: "640531224553",
         appId: "1:640531224553:web:a573170a7ba2a22a"
      };
      firebase.initializeApp(firebaseConfig)      

      const cart_id = localStorage.getItem('unique-id-for-cart')
      if(cart_id == null){
         const id = firebase.database().ref().push().key
         localStorage.setItem('unique-id-for-cart', id)
      }

      this.checkLoggedInAccess()
      this.checkblockeduser()
   }

   checkLoggedInAccess() {
      this.email = localStorage.getItem('email');
      if (this.email == null) {
         this.email = '';
      }
      firebase.auth().onAuthStateChanged(userData => {
         if (userData) {
            this.isLoggedIn = true;
            localStorage.setItem('logged', 'true');
         } else {
            localStorage.setItem('logged', 'false');
            if (this.isLogout) {
               this.logUserOut(true)
            } else {
               this.logUserOut(false)
            }
         }
      });
   }

   checkblockeduser() {
      this.email = localStorage.getItem('email');
      if (this.email == null) {
         return
      }
      firebase.firestore().collection('users').doc(this.email).onSnapshot(user => {
         const m = <Users>user.data()
         if (m != null) {
            const blocked: boolean = m.blocked
            if (blocked) {
               this.logUserOut(true)
            }
         }
      })
   }

   logUserOut(clearAll: boolean) {
      if (clearAll) {
         this.isLoggedIn = false;
         firebase.auth().signOut();
         //localStorage.clear();
         this.router.navigate(['/home/three'])
      }
   }

}
