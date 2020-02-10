import { Component, OnInit } from '@angular/core';
import { SubCategory } from 'src/app/models/sub.category';
import * as firebase from "firebase/app";
import 'firebase/firestore'
import { Router } from '@angular/router';
import { MainCategory } from 'src/app/models/main.category';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  constructor(private router:Router) { }
  sub_categories: MainCategory[] = []

  ngOnInit() {
    this.getSubCategories()
  }

  getSubCategories() {
    firebase.firestore().collection('db').doc('tacadmin').collection('main-categories').where("deleted", "==", false).limit(5).get().then(query => {
      this.sub_categories = []
      query.forEach(data => {
        const category = <MainCategory>data.data()
        // const c:Cat = {
        //   url: `/home/collection/${category.id}`,
        //   name: category.name
        // }
        this.sub_categories.push(category)
      })
    });
  }

  gotocat(id:string){
    location.href = `/collections/${id}`
  }

}
