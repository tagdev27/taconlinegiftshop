import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as firebase from "firebase"
import "firebase/performance";
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
      const perf = firebase.performance();

      const cart_id = localStorage.getItem('unique-id-for-cart')
      if (cart_id == null) {
         const id = firebase.database().ref().push().key
         localStorage.setItem('unique-id-for-cart', id)
      }

      this.checkLoggedInAccess()
      this.checkblockeduser()
      this.recordWebsiteVisits()
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
            //this.router.navigate(['/home/three'])
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
         //this.router.navigate(['/pages/login'])
      }
   }

   recordWebsiteVisits() {
      const date = new Date()
      const months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

      const year = date.getUTCFullYear()
      const month = months[date.getUTCMonth()]
      const day = date.getUTCDate()

      const firebase_ref = firebase.database().ref("website-views").child(`${year}`).child(month).child(`${day}`)
      firebase_ref.child("metric").once('value', snap => {
         if (snap.exists()) {
            const current_metric: number = snap.val()
            firebase_ref.update({ 'metric': current_metric + 1 })
         } else {
            firebase_ref.update({ 'metric': 1 })
         }
      })

      // firebase.database().ref("website-views").child(`${year}`).child(month).transaction((views) => {
      //    console.log(`views ==== ${views}`)
      //    console.log('tayo')
      //    views.metric++;
      //    return views;
      //    // if (views) {

      //    // }else {
      //    //    console.log('derin')
      //    //    firebase.database().ref("website-views").child(`${year}`).child(month).set({'metric':1})
      //    // }
      // })
   }

}
