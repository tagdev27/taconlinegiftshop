import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

declare var gapi:any

@Component({
  selector: 'app-social-tree',
  templateUrl: './social-tree.component.html',
  styleUrls: ['./social-tree.component.less']
})
export class SocialTreeComponent implements OnInit {

  constructor() { }

  calendarItems:any[] = []

  ngOnInit() {
  	$(document).ready(function(e){

  		setInterval(function() {
			$('#l_a').addClass('infinite'); 

			setTimeout(function() {
				$('#l_a').removeClass('infinite'); 
				$('#l_a:before').css({
					color: '#e4d03c', 
				});
			}, 500);

		}, 10000);
	  });
	  this.getEvents()
  }

  async getEvents() {
	const events = await gapi.client.calendar.events.list({
	  calendarId: 'primary'
	})
  
	console.log(events)
  
	this.calendarItems = events.result.items;
  
  }

}
