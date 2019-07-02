import { Component, OnInit } from '@angular/core';
import { StoreSettings } from "src/app/models/store";
import { StoreService } from "src/app/services/store.settings";

@Component({
  selector: 'app-social',
  templateUrl: './social.component.html',
  styleUrls: ['./social.component.scss']
})
export class SocialComponent implements OnInit {

  constructor() { }

  service = new StoreService()
  store:StoreSettings
  facebook_url = '#'
  twitter_url = '#'
  instagram_url = '#'

  async ngOnInit() {
    const st = await this.service.getSettings()
    this.store = st
    this.facebook_url = st.facebook_url
    this.twitter_url = st.twitter_url
    this.instagram_url = this.instagram_url
  }

}
