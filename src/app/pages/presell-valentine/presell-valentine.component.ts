import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery'

@Component({
  selector: 'app-presell-valentine',
  templateUrl: './presell-valentine.component.html',
  styleUrls: ['./presell-valentine.component.scss']
})
export class PresellValentine implements OnInit {

  constructor() { }

  ngOnInit() {
    // this.addEvent(document, 'mouseout', function (evt) {
    //   if (evt.toElement == null && evt.relatedTarget == null) {
    //     $('.lightbox').slideDown();
    //   };
    // });
  }

  addEvent(obj, evt, fn) {
    if (obj.addEventListener) {
      obj.addEventListener(evt, fn, false);
    } else if (obj.attachEvent) {
      obj.attachEvent("on" + evt, fn);
    }
  }

  closePopup() {
    $('.lightbox').slideUp();
  }
}
