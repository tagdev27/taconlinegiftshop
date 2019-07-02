import { Component, OnInit } from '@angular/core';
import { StoreService } from 'src/app/services/store.settings';
import { StoreSettings } from 'src/app/models/store';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit {

  constructor() { }

  service = new StoreService()
  store:StoreSettings
  description = ''

  async ngOnInit() {
    const st = await this.service.getSettings()
    this.store = st
    this.description = st.description
  }

}
