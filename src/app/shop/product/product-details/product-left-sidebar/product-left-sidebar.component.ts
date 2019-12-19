import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../../shared/classes/product';
import { ProductsService } from '../../../../shared/services/products.service';
import { WishlistService } from '../../../../shared/services/wishlist.service';
import { CartService } from '../../../../shared/services/cart.service';
import { Observable, of } from 'rxjs';
import * as $ from 'jquery';
import { AppConfig } from 'src/app/services/global.service';
import * as firebase from "firebase";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Reviews } from 'src/app/models/reviews';

@Component({
  selector: 'app-product-left-sidebar',
  templateUrl: './product-left-sidebar.component.html',
  styleUrls: ['./product-left-sidebar.component.scss']
})
export class ProductLeftSidebarComponent implements OnInit {

  public product: Product = {};
  public products: Product[] = [];
  public counter: number = 1;
  public selectedSize: any = '';
  public iStyle = "width:100%; height:100%;"
  config: AppConfig
  stock_alert = 0
  show_time_reminder = false

  public reviewForm: FormGroup;
  loading = false
  preloading = true
  productReviews: Reviews[] = []
  rating = 5

  product_image = ''
  pro_name = ''

  //Get Product By Id
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router,
    public productsService: ProductsService, private wishlistService: WishlistService,
    private cartService: CartService) {
    this.config = new AppConfig(productsService)
    this.route.params.subscribe(async params => {
      const id = params['id']; //add + sign behind params to make it a number type
      this.pro_name = id
      const sel_pro = await this.getProductDetailsByMenuLink(`${id}`)
      if(sel_pro == null){
        location.href = '/404'
        return
      }
      this.productsService.getProduct(sel_pro.id).subscribe(product => {
        this.preloading = false
        this.product = product
        this.product_image = this.product.pictures[0]
        this.getProductReviews()
        $('head').append(`<meta name="description" content="${product.description}">`)
        firebase.analytics().logEvent('product_views', { name: `${product.name}`, platform : 'web'});
      })
      //$('#metaelement').attr('content', `${this.product.description}`);
    });
    this.reviewForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')]],
      email: ['', [Validators.email]],
      title: ['', Validators.required],
      text: ['', Validators.required],
    })
  }

  async getProductDetailsByMenuLink(menu_link:string) {
    const query = await firebase.firestore().collection('db').doc('tacadmin').collection('products').where('menu_link', '==', menu_link).get()
    if(query.size > 0){
      return <Product>query.docs[0].data()
    }
    return null
  }

  submitReview() {
    // var _id = 0
    // this.route.params.subscribe(params => {
    //   _id = +params['id'];
    // });
    this.loading = true
    const id = firebase.database().ref().push().key
    const review: Reviews = {
      id: id,
      name: `${this.reviewForm.value.name}`,
      email: `${this.reviewForm.value.email}`,
      title: `${this.reviewForm.value.title}`,
      text: `${this.reviewForm.value.text}`,
      product_key: this.product.key,//this.product.key,
      rating: this.rating,
      created_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }
    firebase.firestore().collection('reviews').doc(id).set(review).then(snap => {
      this.loading = false
      this.config.displayMessage('Thank you for the review.', true)
      this.reviewForm.reset()
    }).catch(err => {
      this.loading = false
      //this.previewProgressSpinner.close()
      this.config.displayMessage(`${err}`, false);
    })
  }

  getProductReviews() {
    // var _id = 0
    // this.route.params.subscribe(params => {
    //   _id = +params['id'];
    // });
    //console.log(`pro id = ${_id}`)
    firebase.firestore().collection('reviews').where("product_key", "==", this.product.key).onSnapshot(query => {
      //if(query.empty){return}
      this.productReviews = []
      query.forEach(data => {
        const rev = <Reviews>data.data()
        this.productReviews.push(rev)
      })
      //console.log(this.productReviews)
    })
  }

  slickInit(e){}

  ngOnInit() {
    //console.log(`width = ${$(window).width()} = ${this.isMobileView()}`)
    this.productsService.getProducts().subscribe(product => this.products = product);
    this.getStockLevel()
  }

  isMobileView() {
    if ($(window).width() > 450) {
        return false;
    }
    return true;
};

  getStockLevel() {
    firebase.firestore().collection('db').doc('tacadmin').collection('settings').doc('store').get().then(snap => {
      const sett = snap.data()
      this.stock_alert = sett['stock_level']
    })
  }

  // product zoom 
  onMouseOver(): void {
    document.getElementById("p-zoom").classList.add('product-zoom');
  }

  onMouseOut(): void {
    document.getElementById("p-zoom").classList.remove('product-zoom');
  }

  public slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    fade: true,
  };

  public slideNavConfig = {
    vertical: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    asNavFor: '.product-slick',
    arrows: false,
    dots: false,
    focusOnSelect: false
  }

  public increment() {
    this.counter += 1;
  }

  public decrement() {
    if (this.counter > 1) {
      this.counter -= 1;
    }
  }

  // For mobile filter view
  public mobileSidebar() {
    $('.collection-filter').css("left", "-15px");
  }

  // Add to cart
  public addToCart(product: Product, quantity) {
    if (quantity == 0) return false;
    this.cartService.addToCart(product, parseInt(quantity));
  }

  // Add to cart
  public buyNow(product: Product, quantity) {
    if (quantity > 0)
      this.cartService.addToCart(product, parseInt(quantity));
    this.router.navigate(['/home/checkout']);
  }

  // Add to wishlist
  public addToWishlist(product: Product) {
    this.wishlistService.addToWishlist(product);
  }


  // Change size variant
  public changeSizeVariant(variant) {
    this.selectedSize = variant;
  }

}
