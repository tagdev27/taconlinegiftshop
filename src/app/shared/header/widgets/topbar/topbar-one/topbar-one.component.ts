import { Component, OnInit } from '@angular/core';
import { Product } from '../../../../classes/product';
import { WishlistService } from '../../../../services/wishlist.service';
import { ProductsService } from '../../../../../shared/services/products.service';
import { Observable, of } from 'rxjs';
import { StoreService } from "../../../../../services/store.settings";
import { Router } from '@angular/router';
import * as firebase from "firebase/app";
import 'firebase/firestore'

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar-one.component.html',
  styleUrls: ['./topbar-one.component.scss']
})
export class TopbarOneComponent implements OnInit {

  constructor(public productsService: ProductsService, private router: Router) { }

  service = new StoreService()
  number = ''
  facebook_url = '#'
  twitter_url = '#'
  instagram_url = '#'
  logged = (localStorage.getItem('logged') == null || localStorage.getItem('email') == null) ? 'false' : localStorage.getItem('logged')

  ngOnInit() {
    this.service.getSettings().then(store => {
      this.number = store.number
      this.facebook_url = store.facebook_url
      this.twitter_url = store.twitter_url
      this.instagram_url = store.instagram_url
    })
  }

  logout() {
    firebase.auth().signOut().then(r => {
      this.logged = 'false'
      //this.router.navigate(['/home'])
    })
  }

}
