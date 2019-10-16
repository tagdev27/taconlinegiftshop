import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  // Testimonial Carousel
  public testimonial = [{
     image: 'assets/images/mission.png',
     name: 'Mission Statement',
     designation: '',
     description: 'To leverage technology to deliver an online messenger gift service to cut across all age brackets, occasions and geography. To ensure an endearing customer experience while conveying their heartfelt well wishes and thoughts using the TAC app.',
   }, {
     image: 'assets/images/vision.png',
     name: 'Vision Statement',
     designation: '',
     description: 'To constantly connect our diaspora and local customers to their loved ones regardless of geography and giving the user an endearing customer experience with a wide range of gifts within the online ecosystem to choose from, while doing so with a great sense of security and peace of mind.',
   }, 
  //  {
  //    image: 'assets/images/avtar.jpg',
  //    name: 'John Shipmen',
  //    designation: 'Lead Developer',
  //    description: 'you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings.',
  // }
]

  // Teastimonial Slick slider config
  public testimonialSliderConfig = {
    infinite: true,
    slidesToShow: 2,
    slidesToScroll: 2,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
        {
            breakpoint: 991,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }
    ]
  };

  // Team 
  public team = [{
     image: 'assets/images/team/1.jpg',
     name: 'Customer First',
     designation: 'Our customers are the singular reason for our existence. We take decisions and measure every outcome based on how well it serves them.'
   }, {
     image: 'assets/images/team/2.jpg',
     name: 'Integrity & Ethics',
     designation: 'We serve our customers in an honest, transparent, fair and responsive manner.'
   }, {
     image: 'assets/images/team/3.jpg',
     name: 'Innovation',
     designation: 'Think different, Act Smart. We are innovative and curate problem solving ideas with the use of apt technology.'
   }, {
     image: 'assets/images/team/4.jpg',
     name: 'Efficiency & Reliability',
     designation: 'Act Smart, Focus and deliver results. We keep our promises of providing the best curated services.'
   }, {
     image: 'assets/images/team/3.jpg',
     name: 'Accountability',
     designation: 'We take responsibility for our actions.'
  }, {
    image: 'assets/images/team/3.jpg',
    name: 'Commitment',
    designation: 'Zero disappointments brings smiles to the faces of our customers.'
 }, {
  image: 'assets/images/team/3.jpg',
  name: 'Flexibility',
  designation: 'We follow new trends that aims to suit customers preferences.'
}, {
  image: 'assets/images/team/3.jpg',
  name: 'Ownership',
  designation: 'We have the owner’s mindset, we take ownership of the entire company, we do not limit ourselves to our team, rather work hand in hand.'
}
]

  // Team Slick slider config
  public teamSliderConfig = {
      infinite: true,
      speed: 300,
      slidesToShow: 4,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3000,
      responsive: [
        {
            breakpoint: 1200,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3
            }
        },
        {
            breakpoint: 991,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2
            }
        },
        {
            breakpoint: 586,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1
            }
        }
     ]
  };

}
