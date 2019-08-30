import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Http } from '@angular/http';
import { ProductsService } from 'src/app/shared/services/products.service';
import { StoreService } from 'src/app/services/store.settings';
import { StoreSettings } from 'src/app/models/store';
import { AppConfig } from 'src/app/services/global.service';
declare var $: any;
import 'jquery';

@Component({
  selector: 'app-newsletter',
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.scss']
})
export class NewsletterComponent implements OnInit {

  constructor(private http: Http, private mHttp: HttpClient, private productService: ProductsService) { }

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
  	if(localStorage.getItem('entryState') != 'newsletter'){
  		$('.newsletterm').modal('show');
  		localStorage.setItem('entryState','newsletter');
  	}
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
      'Access-Control-Allow-Origin': 'https://taconlinegiftshop.firebaseapp.com',
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

    const _fn = (localStorage.getItem('fn') != null) ? localStorage.getItem('fn') : ''
    const _ln = (localStorage.getItem('ln') != null) ? localStorage.getItem('ln') : ''
    const _num = (localStorage.getItem('phone') != null) ? localStorage.getItem('phone') : ''

    this.mHttp.post(`https://avidprintsconcierge.com/emailsending/mailchimp.php?email_address=${em}`, {
      lat: uc['latitude'], lng: uc['longitude'], fn: _fn, ln: _ln
    }).subscribe(res => {
      this.loading = false
      this.newsletter_email = ''
      localStorage.setItem("subcribed", "true")
      this.config.displayMessage("Thank you for subscribing", true)
    }, err => {
      this.loading = false
      this.newsletter_email = ''
      localStorage.setItem("subcribed", "true")
      this.config.displayMessage("Thank you for subscribing", true)
    })

  }

}
