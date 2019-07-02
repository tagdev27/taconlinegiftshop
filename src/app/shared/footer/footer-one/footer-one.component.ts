import { Component, OnInit } from '@angular/core';
import { StoreService } from 'src/app/services/store.settings';
import { StoreSettings } from 'src/app/models/store';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Http } from '@angular/http';
import { AppConfig } from "src/app/services/global.service";
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-footer-one',
  templateUrl: './footer-one.component.html',
  styleUrls: ['./footer-one.component.scss']
})
export class FooterOneComponent implements OnInit {

  constructor(private http:Http, private mHttp:HttpClient, private productService:ProductsService) { }

  service = new StoreService()
  store:StoreSettings
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
      'Access-Control-Allow-Origin':'https://taconlinegiftshop.firebaseapp.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    'Access-Control-Allow-Headers': 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization',
    
    }

    this.mHttp.post("https://us3.api.mailchimp.com/3.0/lists/12de55fae0/members", {
      'email_address': this.newsletter_email,
      'email_type': 'html',
      'status': 'subscribed',
      'location': this.productService.user_country
    }, {
      headers: new HttpHeaders(headerDict)
    }).subscribe(res => {
      this.loading = false
      this.newsletter_email = ''
      this.config.displayMessage("Thank you for subscribing", true)
    }, err => {
      this.loading = false
      this.config.displayMessage(`${err}`, false)//"An error occurred, please try again"
    })

  }
}