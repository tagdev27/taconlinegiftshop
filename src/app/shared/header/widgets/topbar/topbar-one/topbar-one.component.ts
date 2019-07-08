import { Component, OnInit } from '@angular/core';
import { Product } from '../../../../classes/product';
import { WishlistService } from '../../../../services/wishlist.service';
import { ProductsService } from '../../../../../shared/services/products.service';
import { Observable, of } from 'rxjs';
import { StoreService } from "../../../../../services/store.settings";
import { Router } from '@angular/router';
import * as firebase from 'firebase';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar-one.component.html',
  styleUrls: ['./topbar-one.component.scss']
})
export class TopbarOneComponent implements OnInit {

  constructor(public productsService: ProductsService, private router: Router) { }

  service = new StoreService()
  number = ''
  logged = (localStorage.getItem('logged') == null) ? 'false' : localStorage.getItem('logged')

  ngOnInit() {
    this.service.getSettings().then(store => {
      this.number = store.number
    })
  }

  logout() {
    firebase.auth().signOut().then(r => {
      this.logged = 'false'
      //this.router.navigate(['/home/three'])
    })
  }

}
