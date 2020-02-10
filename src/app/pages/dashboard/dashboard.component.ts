import { Component, OnInit } from '@angular/core';
import * as firebase from "firebase/app";
import 'firebase/firestore';
import 'firebase/auth';
import { Router } from '@angular/router';
import { OverlayService } from 'src/app/overlay/overlay.module';
import { AppConfig } from 'src/app/services/global.service';
import { ProgressSpinnerComponent } from 'src/app/progress-spinner/progress-spinner.module';
import { ProductsService } from 'src/app/shared/services/products.service';
import { HttpClient } from '@angular/common/http';
import { TacOrder } from 'src/app/models/order';
// import * as $ from 'jquery'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private router: Router, private previewProgressSpinner: OverlayService, private productService: ProductsService, private mHttp: HttpClient) { }
  config = new AppConfig()
  logged = (localStorage.getItem('logged') == null) ? 'false' : localStorage.getItem('logged')
  fn = localStorage.getItem('fn')
  ln = localStorage.getItem('ln')
  email = localStorage.getItem('email')
  loading = false
  dashboard = true
  isSubscribed = (localStorage.getItem("subcribed") == "true") ? true : false
  isVerified = (localStorage.getItem("verified") == null) ? true : (localStorage.getItem("verified") == "true") ? true : false

  userOrders: TacOrder[] = []

  ngOnInit() {
    //$.get("https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css")
    //$.get("http://www.jqueryscript.net/css/jquerysctipttop.css")
    //$.get("assets/css/bootstrap-table-expandable.css")
    //$.getScript("assets/js/bootstrap-table-expandable.js")
    this.checkVerified()
    this.getUserOrders()
  }

  checkVerified() {
    if (!this.isVerified) {
      firebase.auth().onAuthStateChanged(user => {
        this.isVerified = user.emailVerified
      })
    }
  }

  sendverification() {
    this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
    firebase.auth().currentUser.sendEmailVerification().then(r => {
      this.previewProgressSpinner.close()
      this.config.displayMessage("Email verification sent to mail.", true)
    }).catch(err => {
      this.previewProgressSpinner.close()
      this.config.displayMessage(`${err}`, false)
    })
  }

  getUserOrders() {
    firebase.firestore().collection("orders").where("email", "==", this.email).get().then(_orders => {
      this.userOrders = []
      _orders.forEach(mOrder => {
        const m = <TacOrder>mOrder.data()
        this.userOrders.push(m)
      })
    })
  }

  orders() {
    this.dashboard = false
  }

  account() {
    this.dashboard = true
  }

  logout() {
    firebase.auth().signOut().then(r => {
      this.logged = 'false'
      this.router.navigate(['/home'])
    })
  }

  changepassword() {
    this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
    firebase.auth().sendPasswordResetEmail(this.email).then(r => {
      this.previewProgressSpinner.close()
      this.config.displayMessage("Password reset instructions sent to mail.", true)
    }).catch(err => {
      this.previewProgressSpinner.close()
      this.config.displayMessage(`${err}`, false)
    })
  }

  subscribe() {
    this.loading = true
    const em = localStorage.getItem('email')
    const uc = this.productService.user_country
    const dt = {
      "email_address": em,
      "email_type": "html",
      "status": "subscribed",
      "location": uc
    }

    const _fn = (localStorage.getItem('fn') != null) ? localStorage.getItem('fn') : ''
    const _ln = (localStorage.getItem('ln') != null) ? localStorage.getItem('ln') : ''
    const _num = (localStorage.getItem('phone') != null) ? localStorage.getItem('phone') : ''

    this.mHttp.get(`https://avidprintsconcierge.com/emailsending/mailchimp.php?email_address=${em}&lat=${uc['latitude']}&lng=${uc['longitude']}&fn=${_fn}&ln=${_ln}`
    ).subscribe(res => {
      this.loading = false
      this.isSubscribed = true
      localStorage.setItem("subcribed", "true")
      this.config.displayMessage("Thank you for subscribing", true)
    }, err => {
      this.loading = false
      this.isSubscribed = true
      localStorage.setItem("subcribed", "true")
      this.config.displayMessage("Thank you for subscribing", true)
    })

  }

}
