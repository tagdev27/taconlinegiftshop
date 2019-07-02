import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-social-tree',
  templateUrl: './social-tree.component.html',
  styleUrls: ['./social-tree.component.less']
})
export class SocialTreeComponent implements OnInit {

  constructor() { }

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
  }

}
