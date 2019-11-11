// Menu
export interface Menu {
	path?: string;
	title?: string;
	type?: string;
	megaMenu?: boolean;
	megaMenuType?: string; // small, medium, large
	image?: string;
	children?: Menu[];
}

export const AMENUITEMS: Menu[] = [
	{
		title: 'home', type: 'extLink', path: '/home'
	},
	{
		title: 'social tree', type: 'extLink', path: '/social-tree'
	},
	{
		title: 'about us', type: 'extLink', path: '/about-us'
	},
	
	{"title":"shop","type":"sub","megaMenu":true,"megaMenuType":"large","children":[{"title":"Anniversary","type":"link","children":[{"path":"/home/collection/happy-anniversary","title":"Happy Anniversary","type":"extLink"},{"path":"/home/collection/sliver-jubilee","title":"Sliver Jubilee","type":"extLink"},{"path":"/home/collection/golden-jubilee","title":"Golden Jubilee","type":"extLink"},{"path":"/home/collection/wedding-anniversary","title":"Wedding Anniversary","type":"extLink"}]},{"title":"Birthday","type":"link","children":[{"path":"/home/collection/happy-birthday","title":"Happy Birthday","type":"extLink"},{"path":"/home/collection/wine-birthday-gift","title":"Wine Birthday Gift","type":"extLink"},{"path":"/home/collection/gift-for-her","title":"Gift for Her","type":"extLink"},{"path":"/home/collection/gift-for-him","title":"Gift for Him","type":"extLink"},{"path":"/home/collection/happy-1st-birthday","title":"Happy 1st Birthday","type":"extLink"},{"path":"/home/collection/gift-for-mom","title":"Gift for Mom","type":"extLink"},{"path":"/home/collection/gift-for-dad","title":"Gift for Dad","type":"extLink"}]},{"title":"Wine","type":"link","children":[{"path":"/home/collection/wine-gifts","title":"Wine Gifts","type":"extLink"},{"path":"/home/collection/kind-gesture","title":"Kind Gesture","type":"extLink"},{"path":"/home/collection/i-appreciate-you","title":"I appreciate you","type":"extLink"},{"path":"/home/collection/newly-wedded","title":"Newly wedded","type":"extLink"},{"path":"/home/collection/proposal","title":"Proposal","type":"extLink"}]},{"title":"Congratulations","type":"link","children":[{"path":"/home/collection/house-warming","title":"House Warming","type":"extLink"},{"path":"/home/collection/newly-wedded","title":"Newly Wedded","type":"extLink"},{"path":"/home/collection/new-birth","title":"New Birth","type":"extLink"},{"path":"/home/collection/matriculation","title":"Matriculation","type":"extLink"},{"path":"/home/collection/convocation/graduation","title":"Convocation/Graduation","type":"extLink"},{"path":"/home/collection/promotion","title":"Promotion","type":"extLink"},{"path":"/home/collection/retirement","title":"Retirement","type":"extLink"}]},{"title":"Cooporate","type":"link","children":[{"path":"/home/collection/executive-gifts","title":"Executive gifts","type":"extLink"},{"path":"/home/collection/promotion","title":"Promotion","type":"extLink"},{"path":"/home/collection/business-gifts","title":"Business gifts","type":"extLink"},{"path":"/home/collection/appreciation","title":"Appreciation","type":"extLink"},{"path":"/home/collection/retirement","title":"Retirement","type":"extLink"},{"path":"/home/collection/happy-vacation","title":"Happy Vacation","type":"extLink"},{"path":"/home/collection/customer-client-package","title":"Customer/Client package","type":"extLink"}]},{"title":"Healthy","type":"link","children":[{"path":"/home/collection/get-well-soon","title":"Get well soon","type":"extLink"},{"path":"/home/collection/breakfast-basket","title":"Breakfast Basket","type":"extLink"},{"path":"/home/collection/fruit-and-gourmet","title":"Fruit and Gourmet","type":"extLink"},{"path":"/home/collection/tea-gifts","title":"Tea Gifts","type":"extLink"},{"path":"/home/collection/stay-healthy","title":"Stay healthy","type":"extLink"}]},{"title":"Specials","type":"link","children":[{"path":"/home/collection/i-love-you","title":"I Love You","type":"extLink"},{"path":"/home/collection/thank-you","title":"Thank You","type":"extLink"},{"path":"/home/collection/you're-loved","title":"You're loved","type":"extLink"},{"path":"/home/collection/welcome-the-new-baby","title":"Welcome the new baby","type":"extLink"},{"path":"/home/collection/i-miss-you","title":"I Miss You","type":"extLink"},{"path":"/home/collection/see-you-soon","title":"See You Soon","type":"extLink"},{"path":"/home/collection/bachelor's-eve","title":"Bachelor's eve","type":"extLink"},{"path":"/home/collection/bridal-shower","title":"Bridal shower","type":"extLink"},{"path":"/home/collection/proposal","title":"Proposal","type":"extLink"},{"path":"/home/collection/toast","title":"Toast","type":"extLink"}]}]},

	
	// {
	// 	title: 'shop', type: 'sub', megaMenu: true, megaMenuType: 'large', children: [
	// 		{
	// 			title: 'Anniversary', type: 'link', children: [
	// 				{ path: '/home/collection/-LnPWWJdF6D_jMzZBn4B', title: 'Happy Anniversary', type: 'extLink' },
	// 				{ path: '/home/collection/-LnPWchpIrs7LlqHFVYF', title: 'Silver Jubilee', type: 'extLink' },
	// 				{ path: '/home/collection/-LnPWiG-SF0sEkckc6oj', title: 'Golden Jubilee', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS1VsDZwFfoVSPH3Yd', title: 'Diamond', type: 'extLink' }
	// 			]
	// 		},
	// 		{
	// 			title: 'Wedding Gifts', type: 'link', children: [
	// 				{ path: '/home/collection/-LnS1dCLLqWTRa95u7jY', title: 'Bridal Shower', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS1mIfiUIRQ0l1TRxw', title: 'Wine Birthday Gift', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS1rzU3dfWf8lnCXm5', title: 'Brides Gift', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS24Sq-cqY8yK3EQ2X', title: 'Groom Gift', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS2eIg2rRhej31nTgx', title: 'Maid of Honor', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS2NatrMRJCfhT25WL', title: 'Happy 1st Birthday', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS2RxIh85gUSN_UfEZ', title: 'Proposal', type: 'extLink' }
	// 			]
	// 		},
	// 		{
	// 			title: 'Birthday', type: 'link', children: [
	// 				{ path: '/home/collection/-LnS30DdLNsl_jDBI2_z', title: 'Gift For Her', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS37hJd5I9sgIAK360', title: 'Gift For Him', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS3GP8fEsNROrggMpx', title: 'Gift For Mom', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS3M98tklomVP_qkZ5', title: 'Gift For Dad', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS3ZCLecmu4cMb52-e', title: 'Happy Birthday', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS3hCtQ7SEd7abi9KB', title: 'Healthy Birthday Gift', type: 'extLink' },
	// 				// { path: '/home/collection/-LnS3mSMiXfQ9vh4ULy4', title: 'Spa Gift', type: 'extLink' },
	// 				// { path: '/home/collection/-LnS3uAf879hMZTFbmmy', title: 'Tea Gift', type: 'extLink' },
	// 				// { path: '/home/collection/-LnS3zCTqI06y4z85S7M', title: 'Wine Gift', type: 'extLink' }
	// 			]
	// 		},
	// 		// {
	// 		// 	title: 'Baby Gift', type: 'link', children: [
	// 		// 		{ path: '/home/collection/-LnS4FePA5JLLo04eMuE', title: 'Newly Born', type: 'extLink' },
	// 		// 		{ path: '/home/collection/-LnS4RM-F7Pf8p0eafCH', title: 'Happy 1 year', type: 'extLink' },
	// 		// 		{ path: '/home/collection/-LnS4Xj_rIXJ5ZIC3ss7', title: 'First Tooth', type: 'extLink' },
	// 		// 		{ path: '/home/collection/-LnS4ekzuZt9gKz7Nsq-', title: 'First Step', type: 'extLink' }
	// 		// 	]
	// 		// },
	// 		{
	// 			title: 'Congratulations', type: 'link', children: [
	// 				// { path: '/home/collection/-LnS4p91Ugwl3RqyW_i7', title: 'House Warming', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS51b1xexbVgI4g8xv', title: 'Newly Wed', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS58YpMXKrOXLmVtTy', title: 'New Birth', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS5DVeKDo43eh4tTii', title: 'Promotion', type: 'extLink' },
	// 				// { path: '/home/collection/-LnS5U2qHwQkM8JrYCv_', title: 'Graduation', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS5_62r84idERDqnFQ', title: 'Convocation', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS5gIqBUUGhSwN6MW2', title: 'Matriculation', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS5mkpn2vPiDcV-Zi5', title: 'Retirement', type: 'extLink' }
	// 			]
	// 		},
	// 		{
	// 			title: 'Cooporate', type: 'link', children: [
	// 				{ path: '/home/collection/-LnS6vOXyF7vkGyCShrB', title: 'Promotion', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS7-QuhkOJ-43t9V9_', title: 'Thank You', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS77dIkJGHDmNHPKi8', title: 'Retirements', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS7D3EnRlrc1zGtH9I', title: 'Happy Vacation', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS7NQhwsPlvUhBTA6W', title: 'Customer/Client', type: 'extLink' }
	// 			]
	// 		},
	// 		{
	// 			title: 'Get well', type: 'link', children: [
	// 				{ path: '/home/collection/-LnS7VMNvExE7Beq86y2', title: 'Healthy Basket', type: 'extLink' },
	// 				{ path: '/home/collection/-LnT3zV7qNcBk8IVGX9l', title: 'Bath and Body', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS8ugtr9CWWus9GqmA', title: 'Breakfast Basket', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS92SFP8il4rLXnOtX', title: 'Fruit and Gourmet', type: 'extLink' },
	// 				// { path: '/home/collection/-LnS99rHLBiFBJvIujpN', title: 'Spa Gift', type: 'extLink' },
	// 				// { path: '/home/collection/-LnS9KZ7OkHf22QxRBkE', title: 'Tea Gift', type: 'extLink' }
	// 			]
	// 		},
	// 		{
	// 			title: 'Specials', type: 'link', children: [
	// 				{ path: '/home/collection/-LnS9Rut5GgFoiHp2RFe', title: 'I Love You', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS9ZEEcle-0CkuxEmb', title: 'Wine Basket', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS9fR2rPlIKp78l_qz', title: 'Business Gift', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS9n6DFm3nHSQQ2s65', title: 'Thank You', type: 'extLink' },
	// 				{ path: '/home/collection/-LnS9tCKc7I1GLlCzoSw', title: 'I Miss You', type: 'extLink' },
	// 				{ path: '/home/collection/-LnSA0_50i33QdRfYBl9', title: 'See You Soon', type: 'extLink' }
	// 			]
	// 		},
	// 	]
	// },
]

// export const AMENUITEMS: Menu[] = [
// 	{
// 		title: 'home', type: 'sub', children: [
// 	      { path: 'home/one', title: 'Fashion-01', type: 'extTabLink' },          
// 	      { path: 'home/two', title: 'Fashion-02', type: 'extTabLink'},         
// 	      { path: 'home', title: 'Fashion-03', type: 'extTabLink' },         
// 	      { path: 'home/four', title: 'vegetable', type: 'extTabLink' },        
// 	      { path: 'home/five', title: 'watch', type: 'extTabLink' },        
// 	      { path: 'home/six', title: 'furniture', type: 'extTabLink' },        
// 	      { path: 'home/seven', title: 'flower', type: 'extTabLink' },    
// 	      { path: 'home/eight', title: 'beauty', type: 'extTabLink' },   
// 	      { path: 'home/nine', title: 'electronics', type: 'extTabLink' },   
// 	      { path: 'home/ten', title: 'pets', type: 'extTabLink' },   
// 	      { path: 'home/eleven', title: 'metro', type: 'extTabLink' },   
// 	      { path: 'home/twelve', title: 'gym', type: 'extTabLink' },   
// 	      { path: 'home/thirteen', title: 'tools', type: 'extTabLink' },   
// 	      { path: 'home/fourteen', title: 'marijuana', type: 'extTabLink' }  
// 	    ]
// 	},
// 	{
// 		title: 'features', type: 'sub', megaMenu: true, megaMenuType: 'small', children: [
// 	      { path: '/blog/left-sidebar', title: 'blog-left-sidebar', image: 'assets/images/feature/blog-page.jpg', type: 'link' },
// 	      { path: '/blog/right-sidebar', title: 'blog-right-sidebar', image: 'assets/images/feature/blog(right-sidebar).jpg', type: 'link' },
// 	      { path: '/blog/details', title: 'blog-detail',  image: 'assets/images/feature/blog-detail.jpg', type: 'link' },
// 	      { path: '/home/collection/all', title: 'category-left-sidebar', image: 'assets/images/feature/category-page.jpg', type: 'link' },
// 	      { path: '/home/right-sidebar/collection/all', title: 'category-right-sidebar', image: 'assets/images/feature/category-page(right).jpg', type: 'link' },
// 	      { path: '/home/no-sidebar/collection/all', title: 'category-no-sidebar', image: 'assets/images/feature/category-page(no-sidebar).jpg', type: 'link' }
// 	    ]
// 	},
// 	{
// 		title: 'products', type: 'sub', megaMenu: true, megaMenuType: 'medium', children: [
// 	      { path: '/home/product/1', title: 'left-sidebar', image: 'assets/images/feature/product-page(left-sidebar).jpg', type: 'link' },
// 	      { path: '/home/right-sidebar/product/1', title: 'right-sidebar', image: 'assets/images/feature/product-page(right-sidebar).jpg', type: 'link' },
// 	      { path: '/home/no-sidebar/product/1', title: 'no-sidebar',  image: 'assets/images/feature/product-page(no-sidebar).jpg', type: 'link' },
// 	      { path: '/home/col-left/product/1', title: '3-col-thumbnail-left', image: 'assets/images/feature/product-page(3-col-left).jpg', type: 'link' },
// 	      { path: '/home/col-right/product/1', title: '3-col-thumbnail-right', image: 'assets/images/feature/product-page(3-col-right).jpg', type: 'link' },
// 	      { path: '/home/column/product/1', title: 'thumbnail-below', image: 'assets/images/feature/product-page(3-column).jpg', type: 'link' },
// 	      { path: '/home/accordian/product/1', title: 'accordian-details', image: 'assets/images/feature/product-page(accordian).jpg', type: 'link' },
// 	      { path: '/home/left-image/product/1', title: 'thumbnail-left', image: 'assets/images/feature/product-page(left-image).jpg', type: 'link' },
// 	      { path: '/home/right-image/product/1', title: 'thumbnail-right', image: 'assets/images/feature/product-page(right-image).jpg', type: 'link' },
// 	      { path: '/home/vertical/product/1', title: 'vertical-tab', image: 'assets/images/feature/product-page(vertical-tab).jpg', type: 'link' }
// 	    ]
// 	},
// 	{
// 		title: 'pages', type: 'sub', children: [
// 	      { path: '/about-us', title: 'about-us', type: 'link' },          
// 	      { path: '/lookbook', title: 'lookbook', type: 'link' },         
// 	      { path: '/typography', title: 'Typography', type: 'link' }, 
// 	      { 
// 	      	title: 'Portfolio',  type: 'sub', children: [
// 		      	{ path: '/grid/two/column', title: 'Portfolio-2-Grid',  type: 'link' },
// 		      	{ path: '/grid/three/column', title: 'Portfolio-3-Grid',  type: 'link' },
// 		      	{ path: '/grid/four/column', title: 'Portfolio-4-Grid',  type: 'link' },
// 		      	{ path: '/grid/two/masonary', title: 'Masonary-2-Grid',  type: 'link' },
// 		      	{ path: '/grid/three/masonary', title: 'Masonary-3-Grid',  type: 'link' },
// 		      	{ path: '/grid/four/masonary', title: 'Masonary-4-Grid',  type: 'link' },
// 		      	{ path: '/fullwidth/masonary', title: 'Masonary-Fullwidth',  type: 'link' }
// 	      	]
// 	      },         
// 	      { path: '/dashboard', title: 'dashboard', type: 'link' },  
// 	      { path: '/cart', title: 'cart', type: 'link' },  
// 	      { path: '/wishlist', title: 'wishlist', type: 'link' },    
// 	      { path: '/compare', title: 'compare', type: 'link' },  
// 	      { path: '/checkout', title: 'checkout', type: 'link' },  
// 	      { path: '/login', title: 'login', type: 'link' },        
// 	      { path: '/register', title: 'register', type: 'link' },        
// 	      { path: '/forgetpassword', title: 'forget-password', type: 'link' },  
// 	      { path: '/search', title: 'search', type: 'link' },        
// 	      { path: '/collection', title: 'collection', type: 'link' },  
// 	      { path: '/order-success', title: 'order-success', type: 'link' },  
// 	      { path: '/contact', title: 'contact', type: 'link' },  
// 	      { path: '/faq', title: 'FAQ', type: 'link' },  
// 	      { path: '/404', title: '404', type: 'link'}        
// 	    ]
// 	},
// 	{
// 		title: 'shop', type: 'sub', megaMenu: true, megaMenuType: 'large', children: [
// 	      { 
// 	      	title: 'mens-fashion',  type: 'link', children: [
// 		      	{ path: '/home/collection/all', title: 'sports-wear',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'top',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'bottom',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'ethic-wear',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'sports-wear',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'shirts',  type: 'link' }
// 	      	]
// 	      },
// 	      { 
// 	      	title: 'women-fashion',  type: 'link', children: [
// 		      	{ path: '/home/collection/all', title: 'dresses',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'skirts',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'westarn-wear',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'ethic-wear',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'sports-wear',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'bottom-wear',  type: 'link' }
// 	      	]
// 	      },
// 	      { 
// 	      	title: 'kids-fashion',  type: 'link', children: [
// 		      	{ path: '/home/collection/all', title: 'sports-wear',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'ethic-wear',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'sports-wear',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'top',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'bottom-wear',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'ethic-wear',  type: 'link' }
// 	      	]
// 	      },
// 	      { 
// 	      	title: 'accessories',  type: 'link', children: [
// 		      	{ path: '/home/collection/all', title: 'fashion-jewellery',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'caps-and-hats',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'precious-jewellery',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'necklaces',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'earrings',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'rings-wrist-wear',  type: 'link' }
// 	      	]
// 	      },
// 	      { 
// 	      	title: 'men-accessories',  type: 'link', children: [
// 		      	{ path: '/home/collection/all', title: 'ties',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'cufflinks',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'pockets-squares',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'helmets',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'scarves',  type: 'link' },
// 		      	{ path: '/home/collection/all', title: 'phone-cases',  type: 'link' }
// 	      	]
// 	      },
// 	    ]
// 	},
// ]