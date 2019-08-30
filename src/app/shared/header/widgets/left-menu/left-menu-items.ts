// Menu
export interface Menu {
  path?: string;
  title?: string;
  type?: string;
  megaMenu?: boolean;
  children?: Menu[];
}

export const MENUITEMS: Menu[] = [
	{
		title: 'Anniversary', type: 'sub', megaMenu: true, children: [
	      { 
	      	title: 'Anniversary',  type: 'link', children: [
				{ path: '/home/left-sidebar/collection/-LnPWWJdF6D_jMzZBn4B', title: 'Happy Anniversary',  type: 'extLink' },
				{ path: '/home/left-sidebar/collection/-LnPWchpIrs7LlqHFVYF', title: 'Silver',  type: 'extLink' },
				{ path: '/home/left-sidebar/collection/-LnPWiG-SF0sEkckc6oj', title: 'Golden',  type: 'extLink' },
				{ path: '/home/left-sidebar/collection/-LnS1VsDZwFfoVSPH3Yd', title: 'Diamond',  type: 'extLink' }
	      	]
	      },
	    ]
	},
	{
		title: 'Wedding Gifts', type: 'sub', megaMenu: true, children: [
	      { 
	      	title: 'Wedding Gifts',  type: 'link', children: [
				{ path: '/home/left-sidebar/collection/-LnS1dCLLqWTRa95u7jY', title: 'Bridal Shower',  type: 'extLink' },
		      	{ path: '/home/left-sidebar/collection/-LnS1mIfiUIRQ0l1TRxw', title: 'Bachelors Eve',  type: 'extLink' },
		      	{ path: '/home/left-sidebar/collection/-LnS1rzU3dfWf8lnCXm5', title: 'Brides Gift',  type: 'extLink' },
		      	{ path: '/home/left-sidebar/collection/-LnS24Sq-cqY8yK3EQ2X', title: 'Groom Gift',  type: 'extLink' },
		      	{ path: '/home/left-sidebar/collection/-LnS2eIg2rRhej31nTgx', title: 'Maid of Honor',  type: 'extLink' },
				  { path: '/home/left-sidebar/collection/-LnS2NatrMRJCfhT25WL', title: 'Newly Weds',  type: 'extLink' },
				  { path: '/home/left-sidebar/collection/-LnS2RxIh85gUSN_UfEZ', title: 'Proposal',  type: 'extLink' }
	      	]
	      },
	    ]
	},
	{
		title: 'Baby Gifts', type: 'sub', megaMenu: true, children: [
	      { 
	      	title: 'Baby Gifts',  type: 'link', children: [
				{ path: '/home/left-sidebar/collection/-LnS4FePA5JLLo04eMuE', title: 'Newly Born',  type: 'extLink' },
		      	{ path: '/home/left-sidebar/collection/-LnS4RM-F7Pf8p0eafCH', title: 'Happy 1 year',  type: 'extLink' },
		      	{ path: '/home/left-sidebar/collection/-LnS4Xj_rIXJ5ZIC3ss7', title: 'First Tooth',  type: 'extLink' },
		      	{ path: '/home/left-sidebar/collection/-LnS4ekzuZt9gKz7Nsq-', title: 'First Step',  type: 'extLink' }
	      	]
	      },
	    ]
	},
	{
		title: 'Congratulations', type: 'sub', megaMenu: true, children: [
	      { 
	      	title: 'Congratulations',  type: 'link', children: [
				{ path: '/home/left-sidebar/collection/-LnS4p91Ugwl3RqyW_i7', title: 'House Warming',  type: 'extLink' },
		      	{ path: '/home/left-sidebar/collection/-LnS51b1xexbVgI4g8xv', title: 'Newly Wed',  type: 'extLink' },
		      	{ path: '/home/left-sidebar/collection/-LnS58YpMXKrOXLmVtTy', title: 'New Birth',  type: 'extLink' },
		      	{ path: '/home/left-sidebar/collection/-LnS5DVeKDo43eh4tTii', title: 'Promotion',  type: 'extLink' },
		      	{ path: '/home/left-sidebar/collection/-LnS5U2qHwQkM8JrYCv_', title: 'Graduation',  type: 'extLink' },
				  { path: '/home/left-sidebar/collection/-LnS5_62r84idERDqnFQ', title: 'Convocation',  type: 'extLink' },
				  { path: '/home/left-sidebar/collection/-LnS5gIqBUUGhSwN6MW2', title: 'Matriculation',  type: 'extLink' },
				  { path: '/home/left-sidebar/collection/-LnS5mkpn2vPiDcV-Zi5', title: 'Retirement',  type: 'extLink' }
	      	]
	      },
	    ]
	},
	{
		title: 'Cooporate', type: 'sub', megaMenu: true, children: [
	      { 
	      	title: 'Cooporate',  type: 'link', children: [
				{ path: '/home/left-sidebar/collection/-LnS6vOXyF7vkGyCShrB', title: 'Promotion',  type: 'extLink' },
				{ path: '/home/left-sidebar/collection/-LnS7-QuhkOJ-43t9V9_', title: 'Thank You',  type: 'extLink' },
				{ path: '/home/left-sidebar/collection/-LnS77dIkJGHDmNHPKi8', title: 'Retirements',  type: 'extLink' },
				{ path: '/home/left-sidebar/collection/-LnS7D3EnRlrc1zGtH9I', title: 'Happy Vacation',  type: 'extLink' },
				{ path: '/home/left-sidebar/collection/-LnS7NQhwsPlvUhBTA6W', title: 'Customer/Client',  type: 'extLink' }
	      	]
	      },
	    ]
	},
	{
		title: 'Get Well', type: 'sub', megaMenu: true, children: [
	      { 
	      	title: 'Get Well',  type: 'link', children: [
				{ path: '/home/left-sidebar/collection/-LnS7VMNvExE7Beq86y2', title: 'Healthy Basket',  type: 'extLink' },
				{ path: '/home/left-sidebar/collection/-LnT3zV7qNcBk8IVGX9l', title: 'Bath and Body',  type: 'extLink' },
				{ path: '/home/left-sidebar/collection/-LnS8ugtr9CWWus9GqmA', title: 'Breakfast Basket',  type: 'extLink' },
				{ path: '/home/left-sidebar/collection/-LnS92SFP8il4rLXnOtX', title: 'Fruit and Gourmet',  type: 'extLink' },
				{ path: '/home/left-sidebar/collection/-LnS99rHLBiFBJvIujpN', title: 'Spa Gift',  type: 'extLink' },
				{ path: '/home/left-sidebar/collection/-LnS9KZ7OkHf22QxRBkE', title: 'Tea Gift',  type: 'extLink' }
	      	]
	      },
	    ]
	},
	{
		title: 'Specials', type: 'sub', megaMenu: true, children: [
	      { 
	      	title: 'Specials',  type: 'link', children: [
				{ path: '/home/left-sidebar/collection/-LnS9Rut5GgFoiHp2RFe', title: 'I Love You',  type: 'extLink' },
				{ path: '/home/left-sidebar/collection/-LnS9ZEEcle-0CkuxEmb', title: 'Wine Basket',  type: 'extLink' },
				{ path: '/home/left-sidebar/collection/-LnS9fR2rPlIKp78l_qz', title: 'Business Gift',  type: 'extLink' },
				{ path: '/home/left-sidebar/collection/-LnS9n6DFm3nHSQQ2s65', title: 'Thank You',  type: 'extLink' },
				{ path: '/home/left-sidebar/collection/-LnS9tCKc7I1GLlCzoSw', title: 'I Miss You',  type: 'extLink' },
				{ path: '/home/left-sidebar/collection/-LnSA0_50i33QdRfYBl9', title: 'See You Soon',  type: 'extLink' }
	      	]
	      },
	    ]
	},
	
]

// export const MENUITEMS: Menu[] = [
// 	{
// 		title: 'clothing', type: 'sub', megaMenu: true, children: [
// 	      { 
// 	      	title: 'mens fashion',  type: 'link', children: [
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'sports wear',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'top',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'bottom',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'ethic wear',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'sports wear',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'shirts',  type: 'link' },
// 		        { path: '/home/left-sidebar/collection/all', title: 'bottom',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'ethic wear',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'sports wear',  type: 'link' }
// 	      	]
// 	      },
// 	      { 
// 	      	title: 'women fashion',  type: 'link', children: [
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'dresses',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'skirts',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'westarn wear',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'ethic wear',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'bottom',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'ethic wear',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'sports wear',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'sports wear',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'bottom wear',  type: 'link' }
// 	      	]
// 	      },
// 	    ]
// 	},
// 	{
// 		title: 'bags', type: 'sub', children: [
// 		  { path: '/home/left-sidebar/collection/all', title: 'shopper bags', type: 'link' },
// 		  { path: '/home/left-sidebar/collection/all', title: 'laptop bags', type: 'link' },
// 		  { path: '/home/left-sidebar/collection/all', title: 'clutches', type: 'link' },
// 		  { 
// 		  	path: '/home/left-sidebar/collection/all', title: 'purses', type: 'link', children: [
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'purses',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'wallets',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'leathers',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'satchels',  type: 'link' }
// 	      	]
// 		  },
// 	    ]
// 	},
// 	{
// 		title: 'footwear', type: 'sub', children: [
// 		  { path: '/home/left-sidebar/collection/all', title: 'sport shoes', type: 'link' },
// 		  { path: '/home/left-sidebar/collection/all', title: 'formal shoes', type: 'link' },
// 		  { path: '/home/left-sidebar/collection/all', title: 'casual shoes', type: 'link' }
// 		]
// 	},
// 	{
// 		path: '/home/left-sidebar/collection/all', title: 'watches', type: 'link'
// 	},
// 	{
// 		title: 'Accessories', type: 'sub', children: [
// 		  { path: '/home/left-sidebar/collection/all', title: 'fashion jewellery', type: 'link' },
// 		  { path: '/home/left-sidebar/collection/all', title: 'caps and hats', type: 'link' },
// 		  { path: '/home/left-sidebar/collection/all', title: 'precious jewellery', type: 'link' },
// 		  { 
// 		  	path: '/home/left-sidebar/collection/all', title: 'more..', type: 'link', children: [
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'necklaces',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'earrings',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'rings & wrist wear',  type: 'link' },
// 		      	{ 
// 		      		path: '/home/left-sidebar/collection/all', title: 'more...',  type: 'link', children: [
// 				      	{ path: '/home/left-sidebar/collection/all', title: 'ties',  type: 'link' },
// 				      	{ path: '/home/left-sidebar/collection/all', title: 'cufflinks',  type: 'link' },
// 				      	{ path: '/home/left-sidebar/collection/all', title: 'pockets squares',  type: 'link' },
// 				      	{ path: '/home/left-sidebar/collection/all', title: 'helmets',  type: 'link' },
// 				      	{ path: '/home/left-sidebar/collection/all', title: 'scarves',  type: 'link' },
// 				      	{ 
// 				      		path: '/home/left-sidebar/collection/all', title: 'more...',  type: 'link', children: [
// 						      	{ path: '/home/left-sidebar/collection/all', title: 'accessory gift sets',  type: 'link' },
// 						      	{ path: '/home/left-sidebar/collection/all', title: 'travel accessories',  type: 'link' },
// 						      	{ path: '/home/left-sidebar/collection/all', title: 'phone cases',  type: 'link' }
// 				      		]
// 				      	},
// 				    ]
// 		      	}
// 	      	]
// 		  },
// 	    ]
// 	},
// 	{
// 		path: '/home/left-sidebar/collection/all', title: 'house of design', type: 'link'
// 	},
// 	{
// 		title: 'beauty & personal care', type: 'sub', children: [
// 		  { path: '/home/left-sidebar/collection/all', title: 'makeup', type: 'link' },
// 		  { path: '/home/left-sidebar/collection/all', title: 'skincare', type: 'link' },
// 		  { path: '/home/left-sidebar/collection/all', title: 'premium beaty', type: 'link' },
// 		  { 
// 		  	path: '/home/left-sidebar/collection/all', title: 'more..', type: 'link', children: [
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'fragrances',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'luxury beauty',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'hair care',  type: 'link' },
// 		      	{ path: '/home/left-sidebar/collection/all', title: 'tools & brushes',  type: 'link' }
// 	      	]
// 		  },
// 	    ]
// 	},
// 	{
// 		path: '/home/left-sidebar/collection/all', title: 'home & decor', type: 'link'
// 	},
// 	{
// 		path: '/home/left-sidebar/collection/all', title: 'kitchen', type: 'link'
// 	},
// ]