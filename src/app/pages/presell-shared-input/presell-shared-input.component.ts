import { Component, OnInit, Input } from '@angular/core';
// import * as firebase from 'firebase/app'
// import 'firebase/firestore'
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ProductsService } from 'src/app/shared/services/products.service';

@Component({
    selector: 'app-presell-shared-input',
    templateUrl: './presell-shared-input.component.html',
    styleUrls: ['./presell-shared-input.component.scss']
})
export class PresellSharedInput implements OnInit {

    @Input() presellCategory: string

    loading = false
    errorShown = false
    your_name = ''
    your_email = ''

    constructor(private mHttp: HttpClient, private router:Router, private productService: ProductsService) { }

    ngOnInit() {
    }

    submitForm() {
        if (this.your_name == '' || this.your_email == '') {
            this.errorShown = true
            return
        }
        this.errorShown = false
        this.loading = true
        const uc = this.productService.user_country
        const det = {
            name: this.your_name,
            email: this.your_email
        }

        this.mHttp.get(`https://us-central1-taconlinegiftshop.cloudfunctions.net/mailChimpRegistration?email_address=${this.your_email}&tag=presell-${this.presellCategory}&fn=${this.your_name}&ln=''&lat=${uc['latitude']}&lng=${uc['longitude']}`).toPromise().then(d => {
            //console.log(d)
            this.reset()
        }).catch(err => {
            this.reset()
            //console.log(err)
        })

        // firebase.firestore().collection('presell').doc(this.presellCategory).update({ 'data': firebase.firestore.FieldValue.arrayUnion(det) }).then(async d => {
        //     if (this.presellCategory == 'birthday') {
        //         await firebase.firestore().collection('settings').doc('presell').update({ 'number_of_birthday_users': firebase.firestore.FieldValue.increment(1) })
        //     }
        //     if (this.presellCategory == 'valentine') {
        //         await firebase.firestore().collection('settings').doc('presell').update({ 'number_of_valentine_users': firebase.firestore.FieldValue.increment(1) })
        //     }
        //     this.reset()
        // })
    }

    reset() {
        this.your_email = ''
        this.your_name = ''
        this.loading = false
        if (this.presellCategory == 'birthday') {
            location.href = '/collections/birthday'
            //this.router.navigate(['/collections/birthday'])
            return
        }
        if (this.presellCategory == 'valentine') {
            location.href = `/collections/valentine's-spree`
            //this.router.navigate([`/collections/valentine's-spree`])
        }
    }
}
