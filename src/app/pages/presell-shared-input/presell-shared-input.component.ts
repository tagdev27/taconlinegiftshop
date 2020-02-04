import { Component, OnInit, Input } from '@angular/core';
import * as firebase from 'firebase/app'
import 'firebase/firestore'

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

    constructor() { }

    ngOnInit() {
    }

    submitForm() {
        if (this.your_name == '' || this.your_email == '') {
            this.errorShown = true
            return
        }
        this.errorShown = false
        this.loading = true

        const det = {
            name: this.your_name,
            email: this.your_email
        }

        firebase.firestore().collection('presell').doc(this.presellCategory).update({ 'data': firebase.firestore.FieldValue.arrayUnion(det) }).then(async d => {
            if (this.presellCategory == 'birthday') {
                await firebase.firestore().collection('settings').doc('presell').update({ 'number_of_birthday_users': firebase.firestore.FieldValue.increment(1) })
            }
            if (this.presellCategory == 'valentine') {
                await firebase.firestore().collection('settings').doc('presell').update({ 'number_of_valentine_users': firebase.firestore.FieldValue.increment(1) })
            }
            this.reset()
        })
    }

    reset() {
        this.your_email = ''
        this.your_name = ''
        this.loading = false
        if (this.presellCategory == 'birthday') {
            location.href = '/collections/birthday'
            return
        }
        if (this.presellCategory == 'valentine') {
            location.href = `/collections/valentine's-spree`
        }
    }
}
