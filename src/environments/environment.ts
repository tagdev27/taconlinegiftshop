// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

const firebaseConfig = {
  apiKey: "AIzaSyAu77RE_S5__DnrmaR1LKJvqtNNyR0mSzo",
  authDomain: "taconlinegiftshop.firebaseapp.com",
  databaseURL: "https://taconlinegiftshop.firebaseio.com",
  projectId: "taconlinegiftshop",
  storageBucket: "taconlinegiftshop.appspot.com",
  messagingSenderId: "640531224553",
  appId: "1:640531224553:web:a573170a7ba2a22a",
  measurementId: "G-JL5RFRMVSF"
};

export const environment = {
  production: false,
  paystack_key: 'pk_test_8be8b3b21803dcb62514b6e55f3c6f90f4a74483',
  fireConfig: firebaseConfig,
  flutter_wave_public_key: 'FLWPUBK_TEST-7009c2baf4176e75795b55a8eb3c74c3-X',
  flutter_wave_secret_key: 'FLWSECK_TEST-ee6997928d4342262fdda896ee3266d7-X'
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
