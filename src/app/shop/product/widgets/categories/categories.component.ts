import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import * as firebase from "firebase/app";
import 'firebase/firestore'
import { SubCategory } from 'src/app/models/sub.category';
import { Router } from '@angular/router';

// export interface Cat {
//   name:string
//   url:string
// }

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})

export class CategoriesComponent implements OnInit {

  constructor(private router:Router) { }
  sub_categories: SubCategory[] = []

  // collapse toggle
  ngOnInit() {
    this.getSubCategories()
    $('.collapse-block-title').on('click', function (e) {
      e.preventDefault;
      var speed = 300;
      var thisItem = $(this).parent(),
        nextLevel = $(this).next('.collection-collapse-block-content');
      if (thisItem.hasClass('open')) {
        thisItem.removeClass('open');
        nextLevel.slideUp(speed);
      } else {
        thisItem.addClass('open');
        nextLevel.slideDown(speed);
      }
    });
  }

  getSubCategories() {
    firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').where("deleted", "==", false).get().then(query => {
      this.sub_categories = []
      query.forEach(data => {
        const category = <SubCategory>data.data()
        // const c:Cat = {
        //   url: `/home/collection/${category.id}`,
        //   name: category.name
        // }
        this.sub_categories.push(category)
      })
    });
  }

  gotocat(link:string){
    // let re = /\ /gi;
    // const url_path_name = name.toLowerCase().replace(re, '-')
    this.router.navigate([`/home/collection/${link}`])
  }

  // For mobile view
  public mobileFilterBack() {
    $('.collection-filter').css("left", "-365px");
  }

}
