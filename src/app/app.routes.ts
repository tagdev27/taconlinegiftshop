import { Routes } from '@angular/router';

import { MainComponent } from './main/main.component';
// import { DemoComponent } from './demo/demo.component';
//import { HomeThreeComponent } from "./shop/home-3/home-three.component";

export const rootRouterConfig: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/home'
  },
  // {
  //   path: 'demo',
  //   component: DemoComponent
  // },
  // {
  //   path: '',
  //   loadChildren: () => import('./home-3/home-three.module').then(m => m.HomeThreeModule)
  // },
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'home',
        loadChildren: () => import('./shop/shop.module').then(m => m.ShopModule)
      },
      {
        path: '',//pages
        loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule)
      },
      // {
      //   path: 'blog',
      //   loadChildren: () => import('./blog/blog.module').then(m => m.BlogModule)
      // }
    ]
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];

