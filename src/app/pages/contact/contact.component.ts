import { Component, OnInit } from '@angular/core';
import { StoreSettings } from 'src/app/models/store';
import { StoreService } from 'src/app/services/store.settings';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AppConfig } from 'src/app/services/global.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  config: AppConfig
  public reviewForm: FormGroup;
  
  constructor(private fb: FormBuilder, private http:HttpClient) { 
    this.config = new AppConfig()
    this.reviewForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')]],
      email: ['', [Validators.email, Validators.required]],
      phone: ['', Validators.required],
      text: ['', Validators.required],
    })
  }
  
  service = new StoreService()
  store: StoreSettings
  address = ''
  number = ''
  fax = ''
  email = ''
  loading = false

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

  submitMessage(){
    this.loading = true
    const subject = 'Contact us message';
    const em_body = `
    Below are the information of the user--
    FULL NAME: ${this.reviewForm.value.name}--
    EMAIL ADDRESS: ${this.reviewForm.value.email}--
    PHONE NUMBER: ${this.reviewForm.value.phone}--
    MESSAGE: ${this.reviewForm.value.text}--
    `;
    //const sendBody = this.emailBody.Body(em_body, subject);
    const url = `https://avidprintsconcierge.com/emailsending/contact.php?subject=${subject}&body=${em_body}&reply=${this.reviewForm.value.email}`;
    this.http.get(url).subscribe(res => {
      this.onDoneSending()
    }, err => {
      this.onDoneSending()
    });
  }

  onDoneSending() {
    this.loading = false
    this.config.displayMessage('Message sent successfully.', true)
    this.reviewForm.reset()
  }

}
