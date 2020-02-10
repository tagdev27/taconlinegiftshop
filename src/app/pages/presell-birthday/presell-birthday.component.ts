import { Component, OnInit } from '@angular/core';
// import * as $ from 'jquery'

@Component({
  selector: 'app-presell-birthday',
  templateUrl: './presell-birthday.component.html',
  styleUrls: ['./presell-birthday.component.scss']
})
export class PresellBirthday implements OnInit {

  constructor() { }

  ngOnInit() {
    // this.addEvent(document, 'mouseout', function (evt) {
    //   if (evt.toElement == null && evt.relatedTarget == null) {
    //     $('.lightbox').slideDown();
    //   };
    // });
  }

  // addEvent(obj, evt, fn) {
  //   if (obj.addEventListener) {
  //     obj.addEventListener(evt, fn, false);
  //   } else if (obj.attachEvent) {
  //     obj.attachEvent("on" + evt, fn);
  //   }
  // }

  // closePopup() {
  //   $('.lightbox').slideUp();
  // }
}
