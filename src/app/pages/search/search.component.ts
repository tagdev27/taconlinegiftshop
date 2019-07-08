import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SubCategory } from 'src/app/models/sub.category';
import * as firebase from 'firebase';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  constructor(private router: Router) { }

  categories: SubCategory[] = []
  query = ''

  ngOnInit() {
    //this.getAllSubCategories()
  }

  getAllSubCategories() {
    firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').where("deleted", "==", false).onSnapshot(query => {
      this.categories = []
      var index = 0
      query.forEach(async data => {
        const category = <SubCategory>data.data()
        this.categories.push(category)
        index = index + 1
      })
    });
  }

  onSearchPressed() {
      this.categories.forEach(subcat => {
        if(subcat.meta.toLowerCase().search(this.query.toLowerCase()) > 0 || subcat.name.toLowerCase().search(this.query.toLowerCase()) > 0 || subcat.description.toLowerCase().search(this.query.toLowerCase()) > 0){
          this.router.navigate([`/home/left-sidebar/collection/${subcat.id}`])
        }
      })
  }

}
