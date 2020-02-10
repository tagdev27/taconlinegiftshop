import { Component, OnInit } from '@angular/core';
import { StoreService } from 'src/app/services/store.settings';
import { StoreSettings } from 'src/app/models/store';
// import { Http } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from "src/app/services/global.service";
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-footer-two',
  templateUrl: './footer-two.component.html',
  styleUrls: ['./footer-two.component.scss']
})
export class FooterTwoComponent implements OnInit {

  constructor(private mHttp: HttpClient, private productService: ProductsService) { }

  service = new StoreService()
  store: StoreSettings
  address = ''
  number = ''
  fax = ''
  email = ''

  async ngOnInit() {
    const st = await this.service.getSettings()
    this.store = st
    this.address = st.address
    this.number = st.number
    this.fax = st.fax
    this.email = st.email

    // this.http.get('https://ipapi.co/json').subscribe(res => {
    //   this.user_country = {latitude: res.json().lat, longitude: res.json().lon}
    // })
  }

  loading = false
  errorShown = false
  newsletter_email = ''
  //user_country = {}

  config = new AppConfig()
  subscribe() {
    if (this.newsletter_email == '') {
      this.errorShown = true
      return
    }
    this.errorShown = false
    this.loading = true

    const headerDict = {
      'Content-Type': 'application/json',
      'Authorization': 'apikey 7abc577dbf82e2c727476aa090aa07af-us3',
      'Access-Control-Allow-Origin': 'https://tacgifts.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
      'Access-Control-Allow-Headers': 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization',

    }

    const em = this.newsletter_email
    const uc = this.productService.user_country
    const dt = {
      "email_address": em,
      "email_type": "html",
      "status": "subscribed",
      "location": uc
    }

    const _fn = (localStorage.getItem('fn') != null) ? localStorage.getItem('fn') : 'Guest'
    const _ln = (localStorage.getItem('ln') != null) ? localStorage.getItem('ln') : 'Guest'
    const _num = (localStorage.getItem('phone') != null) ? localStorage.getItem('phone') : ''
//https://avidprintsconcierge.com/emailsending/mailchimp.php
    this.mHttp.get(`https://us-central1-taconlinegiftshop.cloudfunctions.net/mailChimpRegistration?email_address=${em}&fn=${_fn}&ln=${_ln}&lat=${uc['latitude']}&lng=${uc['longitude']}`).subscribe(res => {
      //console.log(res)
      this.loading = false
      this.newsletter_email = ''
      localStorage.setItem("subcribed", "true")
      this.config.displayMessage("Thank you for subscribing", true)
    },err => {
      //console.log(err)
      this.loading = false
      this.newsletter_email = ''
      localStorage.setItem("subcribed", "true")
      this.config.displayMessage("Thank you for subscribing", true)
    })

    // $.ajax({
    //   url: `https://avidprintsconcierge.com/emailsending/mailchimp.php?email_address=${em}`,
    //   type: 'post',
    //   dataType: 'json',
    //   data: {
    //     lat: uc['latitude'], 
    //     lng: uc['longitude'], 
    //     fn: _fn, 
    //     ln: _ln
    //   },
    //   success: function(data){
    //     console.log(`success == ${data}`)
    //     this.loading = false
    //   this.newsletter_email = ''
    //   localStorage.setItem("subcribed", "true")
    //   this.config.displayMessage("Thank you for subscribing", true)
    //   },
    //   error: function(err){
    //     console.log(`error == ${err}`)
    //     this.loading = false
    //   this.newsletter_email = ''
    //   localStorage.setItem("subcribed", "true")
    //   this.config.displayMessage("Thank you for subscribing", true)
    //   }
    // })

  }

}
