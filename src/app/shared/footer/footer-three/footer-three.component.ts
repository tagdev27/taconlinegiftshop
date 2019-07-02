import { Component, OnInit } from '@angular/core';
import { StoreService } from 'src/app/services/store.settings';
import { StoreSettings } from 'src/app/models/store';
declare var $: any;

@Component({
  selector: 'app-footer-three',
  templateUrl: './footer-three.component.html',
  styleUrls: ['./footer-three.component.scss']
})
export class FooterThreeComponent implements OnInit {

  constructor() { }

  service = new StoreService()
  store:StoreSettings
  address = ''
  number = ''
  fax = ''
  email = ''

  async ngOnInit() {
    $('footer').footerReveal();
    const st = await this.service.getSettings()
    this.store = st
    this.address = st.address
    this.number = st.number
    this.fax = st.fax
    this.email = st.email
  }

}
