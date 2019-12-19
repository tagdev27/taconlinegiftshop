import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as $ from 'jquery';
import * as firebase from "firebase";
import { SocialTree, SocialEvents } from 'src/app/models/social-tree';
import { AppConfig } from 'src/app/services/global.service';
import { OverlayService } from 'src/app/overlay/overlay.module';
import { ProgressSpinnerComponent } from 'src/app/progress-spinner/progress-spinner.module';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

declare var gapi: any

@Component({
	selector: 'app-social-tree',
	templateUrl: './social-tree.component.html',
	styleUrls: ['./social-tree.component.less']
})
export class SocialTreeComponent implements OnInit {

	@ViewChild('scrollMe', { static: false }) private myScrollContainer: ElementRef;
	@ViewChild('google_events', { static: false }) private googleEventsContainer: ElementRef;

	closeResult = ''

	isAddNewUser = false

	hasSocialTreeAdded = false

	login = false

	logged = (localStorage.getItem('logged') == null || localStorage.getItem('email') == null) ? 'false' : localStorage.getItem('logged')

	mySocialTree: SocialTree[] = []

	public checkoutForm: FormGroup;

	eventCount = 0

	config: AppConfig

	loading = false

	hasGoogleToken = false
	reloadToken = false
	GoogleToken = {}
	google_events_counts = 0
	google_events_list = {}
	googleEvents: SocialEvents[] = []
	google_picture = ''

	hasFacebookToken = false
	FacebookToken = {}
	facebook_id = ''
	facebook_gender = ''
	facebook_birthday = ''

	google_social_tree_key = ''

	async getTree() {
		// const query = await firebase.firestore().collection('social-tree').get()
		// // query.forEach(d => {
		// // 	const tree = <SocialTree>d.data()
		// // 	tree.events.forEach(ev => {
		// // 		const date = new Date(ev.event_timestamp)
		// // 		console.log(`${ev.event_date} ======= ${date.toDateString()}`)
		// // 	})
		// // })
		// const tree = <SocialTree>query.docs[0].data()
		// const ev = tree.events
		// const t0 = ev[0].event_timestamp
		// const t1 = ev[1].event_timestamp
		
		// const date0 = new Date() 
		// const date1 = new Date(t1)
		// const diffMs = date1.getTime() - date0.getTime()
		// console.log(date0.getUTCMonth())
		// // console.log(new Date(diff).toDateString())
		// let diffDays = Math.floor(diffMs / 86400000); // days
		// let diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
		// let diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
		// console.log(diffDays + " days, " + diffHrs + " hours, " + diffMins + " minutes");
	}

	async checkIfLoggedIn() {
		// firebase.auth().onAuthStateChanged(userData => {
		// 	if(userData){
		// 		this.logged = 'true'
		// 	}else {
		// 		this.logged = 'false'
		// 	}
		// })
		// const user = await firebase.auth().currentUser
		// this.logged = (user == null) ? 'false' : 'true'
		//console.log(`logged ==== ${this.logged}`)
	}

	constructor(private fb: FormBuilder, private previewProgressSpinner: OverlayService, private http: HttpClient, private modalService: NgbModal) {
		this.config = new AppConfig()
		this.checkoutForm = this.fb.group({
			firstname: ['', [Validators.required]],//Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')
			lastname: ['', [Validators.required]],
			phone: [''],
			email: ['', [Validators.email]],
			// age: ['', [Validators.required]],
			gender: ['', [Validators.required]],
			address: ['', [Validators.maxLength(500)]],//, [Validators.required, Validators.maxLength(250)]
			relationship: ['', Validators.required],
			occupation: [''],// Validators.required
		})
	}

	getCurrentUserSocialTree() {
		if (this.logged == 'true') {
			const email = localStorage.getItem('email')
			// firebase.firestore().collection('social-tree').where("user_id", "==", email).get().then(query => {
			// 	this.mySocialTree = []
			// 	if (query.size > 0) {
			// 		this.hasSocialTreeAdded = true
			// 	}
			// 	query.forEach(st => {
			// 		const mst = <SocialTree>st.data()
			// 		this.mySocialTree.push(mst)
			// 	})
			// })
		}
	}

	checkGoogleToken() {
		if (this.logged == 'true') {
			const email = localStorage.getItem('email')
			firebase.firestore().collection('users').doc(email).get().then(u => {
				const user = u.data()
				if (user['Tokens'] != null) {
					this.hasGoogleToken = true
					this.GoogleToken = user['Tokens']
					//console.log(this.GoogleToken)
				}
				if (user['Facebook'] != null) {
					this.hasFacebookToken = true
					this.FacebookToken = user['Facebook']
					this.facebook_id = user['facebook_id']
					this.facebook_gender = user['gender']
					this.facebook_birthday = user['birthday']
					//console.log(this.GoogleToken)
				}
				if (user['picture'] != null) {
					this.google_picture = user['picture']
				}
			})
		}
	}

	ngOnInit() {
		//this.getTree()
		this.google_social_tree_key = firebase.database().ref().push().key
		$(document).ready(function (e) {
			setInterval(function () {
				$('#l_a').addClass('infinite');
				setTimeout(function () {
					$('#l_a').removeClass('infinite');
					$('#l_a:before').css({
						color: '#e4d03c',
					});
				}, 500);
			}, 10000);
		});
		//this.checkIfLoggedIn()
		this.getCurrentUserSocialTree()
		this.checkGoogleToken()
	}

	startAdding() {
		if (this.logged == 'false') {
			this.login = true
			return
		}
		this.isAddNewUser = true
		location.href = '/social-tree#add'
		// this.scrollToBottom()
	}

	scrollToBottom(): void {
		try {
			this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
		} catch (err) { }
	}

	addEvents() {
		$('#events').append(`
	  <div class="form-group col-md-6 col-sm-6 col-xs-12" id="e_${this.eventCount}">
		<div class="field-label">Event Name<small> (e.g Birthday, Anniversary, etc.)</small></div>
		<input type="text" id="event_name_${this.eventCount}" name="en" value="" placeholder="" autocomplete="off" required="required">
	</div>
	<div class="form-group col-md-6 col-sm-6 col-xs-12" id="e_${this.eventCount}">
		<div class="field-label">Event Date</div>
		<input type="date" id="event_date_${this.eventCount}" name="ed" value="" placeholder="" autocomplete="off" required="required">
	</div>
	  `)
		this.eventCount = this.eventCount + 1
	}

	removeEvents() {
		if (this.eventCount == 0) {
			return;
		}
		$(`#e_${this.eventCount - 1}`).remove()
		$(`#e_${this.eventCount - 1}`).remove()
		this.eventCount = this.eventCount - 1
	}

	async uploadImageToStorage(imageFile: File) {
		const key = firebase.database().ref().push().key
		const upload_task = firebase.storage().ref("social-tree").child(`${key}.jpg`)
		await upload_task.put(imageFile)
		const url = await upload_task.getDownloadURL()
		return url
	}

	async submitMember() {
		if (this.eventCount <= 0) {
			this.config.displayMessage("Please add at least one event.", false)
			return
		}
		this.loading = true
		var socialEvents: SocialEvents[] = []
		const email = localStorage.getItem('email')
		const key = firebase.database().ref().push().key
		for (var i = 0; i < this.eventCount; i++) {
			const event_name = (<HTMLInputElement>document.getElementById(`event_name_${i}`)).value
			const event_date = (<HTMLInputElement>document.getElementById(`event_date_${i}`)).value
			const date = new Date(event_date)
			const event: SocialEvents = {
				event_name: event_name,
				event_date: event_date,
				event_timestamp: date.getTime(),
				event_day: date.getUTCDate(),
				event_month: date.getUTCMonth(),
				event_year: date.getUTCFullYear(),
				social_tree_id: key,
				user_id: email
			}
			socialEvents.push(event)
		}
		
		const image = (<HTMLInputElement>document.getElementById("member_image")).files
		var image_url = 'https://tacadmin.firebaseapp.com/assets/img/default-avatar.png'
		if (image.length > 0) {
			const img = await this.uploadImageToStorage(image.item(0));
			image_url = img
		}
		const st: SocialTree = {
			id: key,
			user_id: email,
			name: `${this.checkoutForm.value.firstname} ${this.checkoutForm.value.lastname}`,
			// age: `${this.checkoutForm.value.age}`,
			gender: `${this.checkoutForm.value.gender}`,
			relationship: `${this.checkoutForm.value.relationship}`,
			occupation: `${this.checkoutForm.value.occupation}`,
			address: `${this.checkoutForm.value.address}`,
			number: `${this.checkoutForm.value.phone}`,
			email: `${this.checkoutForm.value.email}`,
			// events: socialEvents,
			profile_image_url: image_url,
			entry_mode: 'manual',
			created_date: firebase.firestore.FieldValue.serverTimestamp()
		}
		firebase.analytics().logEvent('social-tree', { method: `manual`, platform : 'web'});
		firebase.firestore().collection('social-tree').doc(key).set(st).then(d => {
			var index = 0
			socialEvents.forEach(async se => {
				const id = firebase.database().ref().push().key
				await firebase.firestore().collection('social-tree-events').doc(id).set(se)

				index = index + 1

				if(index == socialEvents.length){
					for (var i = 0; i < this.eventCount; i++) {
						$(`#e_${i}`).remove()
						$(`#e_${i}`).remove()
					}
					this.loading = false
					this.config.displayMessage('Member successfully added.', true)
					this.checkoutForm.reset()
				}
			})
		}).catch(err => {
			this.loading = false
			this.config.displayMessage(`${err}`, false);
		})
	}

	facebookAdding() {
		if (this.reloadToken) {
			this.signinWithFacebook()
			return
		}
		if (!this.hasFacebookToken) {
			this.signinWithFacebook()
			return
		}
		this.accessUserFriendsFromFacebookResult()
	}

	signinWithFacebook() {
		const email = localStorage.getItem('email')
		var provider = new firebase.auth.FacebookAuthProvider();
		provider.addScope('email');
		// provider.addScope('user_birthday');
		// provider.addScope('user_friends');
		// provider.addScope('user_gender')
		firebase.auth().signInWithPopup(provider).then(async result => {
			const user_email = result.user.email
			const pic = result.additionalUserInfo.profile['picture']
			const pic_data = pic['data']
			await firebase.firestore().collection('users').doc(email.toLowerCase()).update({
				//'Tokens': result.credential.toJSON(),
				'facebook_id': result.additionalUserInfo.profile['id'],
				'picture': pic_data['url'],
				'Facebook': result.credential.toJSON(),
				'birthday': (result.additionalUserInfo.profile['birthday'] == undefined) ? '' : result.additionalUserInfo.profile['birthday'],
          		'gender': (result.additionalUserInfo.profile['gender'] == undefined) ? '' : result.additionalUserInfo.profile['gender'],
			})
			this.FacebookToken = result.credential.toJSON()
			this.facebook_id = result.additionalUserInfo.profile['id']
			this.facebook_birthday = result.additionalUserInfo.profile['birthday']
			this.facebook_gender = result.additionalUserInfo.profile['gender']
			this.accessUserFriendsFromFacebookResult()
		}).catch(err => {
			//this.previewProgressSpinner.close()
			//this.config.displayMessage(`${err}`, false)
		})
	}

	accessUserFriendsFromFacebookResult() {
		this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
		const oauth_access_token = this.FacebookToken['oauthAccessToken']//${this.facebook_id}
		const url = `https://graph.facebook.com/v5.0/me/friends?access_token=${oauth_access_token}`
		this.http.get(url).toPromise().then(result => {
			this.previewProgressSpinner.close()
			if (result['error'] != null) {
				this.reloadToken = true
				this.config.displayMessage('User access token expired. Please try again.', false)
				return
			}
			this.reloadToken = false
			const items: any[] = result['data']
			var usersEvents:SocialEvents[] = []
			items.forEach(user => {
				const event_name = user.name
				const event_date = user.id
				const event: SocialEvents = {
					event_name: event_name,
					event_date: event_date,
					event_timestamp: new Date(event_date).getTime(),//error here
					event_day: 0,
					event_month: 0,
					event_year: 0,
					social_tree_id: '',
					user_id: ''
				}
				usersEvents.push(event)
			})

			const key = firebase.database().ref().push().key
			const email = localStorage.getItem('email')
			const st: SocialTree = {
				id: key,
				user_id: email,
				name: `${localStorage.getItem('fn')} ${localStorage.getItem('ln')}`,
				// age: this.facebook_birthday,
				gender: this.facebook_gender,
				relationship: '',
				occupation: '',
				address: '',
				number: localStorage.getItem('phone'),
				email: email,
				// events: usersEvents,
				profile_image_url: this.google_picture,
				entry_mode: 'facebook',
				created_date: firebase.firestore.FieldValue.serverTimestamp()
			}
			firebase.firestore().collection('social-tree').doc(key).set(st).then(d => {
				this.modalService.dismissAll()
				this.previewProgressSpinner.close()
				this.config.displayMessage('Events successfully added.', true)
			}).catch(err => {
				this.previewProgressSpinner.close()
				this.config.displayMessage(`${err}`, false);
			})

		}).catch(err => {
			this.previewProgressSpinner.close()
			this.reloadToken = true
			this.config.displayMessage('User access token expired. Please try again.', false)
		})
		
	}

	googleAdding() {
		//this.open(this.googleEventsContainer, '', '')
		if (this.reloadToken) {
			this.signinWithGoogle()
			return
		}
		if (!this.hasGoogleToken) {
			this.signinWithGoogle()
			return
		}
		this.accessEventsFromGoogleResult()
	}

	signinWithGoogle() {
		const email = localStorage.getItem('email')
		var provider = new firebase.auth.GoogleAuthProvider();
		provider.addScope('profile');
		provider.addScope('email');
		provider.addScope('https://www.googleapis.com/auth/calendar.events.readonly')
		firebase.auth().signInWithPopup(provider).then(async result => {
			//console.log(result)
			const user_email = result.user.email
			// if (email != user_email) {
			// 	this.config.displayMessage("Your gmail must correspond with the email you're currently signed into", false)
			// 	return
			// }
			await firebase.firestore().collection('users').doc(email.toLowerCase()).update({
				'Tokens': result.credential.toJSON(),
				// 'picture': result.additionalUserInfo.profile['picture']
			})
			this.GoogleToken = result.credential.toJSON()
			this.accessEventsFromGoogleResult()
		}).catch(err => {
			//this.config.displayMessage(`${err}`, false)
		})
	}

	accessEventsFromGoogleResult() {
		this.open(this.googleEventsContainer, '', '')
		this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
		const oauth_access_token = this.GoogleToken['oauthAccessToken']
		const googleApiHeader = {
			'Authorization': `Bearer ${oauth_access_token}`,
			'Accept': 'application/json'
		};
		const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?key=AIzaSyAu77RE_S5__DnrmaR1LKJvqtNNyR0mSzo'
		this.http.get(url, { headers: new HttpHeaders(googleApiHeader) }).toPromise().then(result => {
			//console.log(result)
			this.previewProgressSpinner.close()
			if (result['error'] != null) {
				this.reloadToken = true
				this.config.displayMessage('User access token expired. Please try again.', false)
				this.modalService.dismissAll()
				return
			}
			this.reloadToken = false
			this.google_events_list = result
			const items: any[] = result['items']
			const email = localStorage.getItem('email')
			items.forEach(ms => {
				const event_name = ms.summary
				const start_date = ms.start
				var event_date = start_date['dateTime']
				if (event_date == undefined) {
					event_date = start_date['date']
				}
				const date = new Date(event_date)
				const event: SocialEvents = {
					event_name: event_name,
					event_date: event_date,
					event_timestamp: date.getTime(),
					event_day: date.getUTCDate(),
					event_month: date.getUTCMonth(),
					event_year: date.getUTCFullYear(),
					social_tree_id: this.google_social_tree_key,
					user_id: email
				}
				this.googleEvents.push(event)
				$('#event_lists').append(`
			<div class="form-group col-md-6 col-sm-6 col-xs-12">
				<input type="checkbox" value="" id="checkbox_${this.google_events_counts}"><strong style="color:#ec008c;"> ${event_name}</strong>
				<br>
				<div class="field-label"><u><i>${event_date}<i></u></div>
			</div>
			`)
				this.google_events_counts = this.google_events_counts + 1
			})
		}).catch(err => {
			this.previewProgressSpinner.close()
			this.reloadToken = true
			this.config.displayMessage('User access token expired. Please try again.', false)
			this.modalService.dismissAll()
		})
	}

	submitSelection() {
		var google_Social_Tree: SocialEvents[] = []
		for (var i = 0; i < this.google_events_counts; i++) {
			const checkBox = (<HTMLInputElement>document.getElementById(`checkbox_${i}`)).checked
			if (checkBox) {
				google_Social_Tree.push(this.googleEvents[i])
			}
		}
		if (google_Social_Tree.length == 0) {
			this.config.displayMessage('Please select at least one event from your calendar.', false)
			return
		}

		this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
		// const key = firebase.database().ref().push().key
		const email = localStorage.getItem('email')
		const st: SocialTree = {
			id: this.google_social_tree_key,
			user_id: email,
			name: `${localStorage.getItem('fn')} ${localStorage.getItem('ln')}`,
			// age: '',
			gender: '',
			relationship: '',
			occupation: '',
			address: '',
			number: localStorage.getItem('phone'),
			email: email,
			// events: google_Social_Tree,
			profile_image_url: this.google_picture,
			entry_mode: 'google',
			created_date: firebase.firestore.FieldValue.serverTimestamp()
		}
		firebase.analytics().logEvent('social-tree', { method: `google`, platform : 'web'});
		firebase.firestore().collection('social-tree').doc(this.google_social_tree_key).set(st).then(d => {
			var index = 0
			google_Social_Tree.forEach(async se => {
				const id = firebase.database().ref().push().key
				await firebase.firestore().collection('social-tree-events').doc(id).set(se)

				index = index + 1

				if(index == google_Social_Tree.length){
					this.modalService.dismissAll()
					this.previewProgressSpinner.close()
					this.config.displayMessage('Events successfully added.', true)
				}
			})
		}).catch(err => {
			this.previewProgressSpinner.close()
			this.config.displayMessage(`${err}`, false);
		})
	}

	open(content, type, modalDimension) {
		if (modalDimension === 'sm' && type === 'modal_mini') {
			this.modalService.open(content, { windowClass: 'modal-mini', size: 'sm', centered: true }).result.then((result) => {
				this.closeResult = 'Closed with: $result';
			}, (reason) => {
				this.closeResult = 'Dismissed $this.getDismissReason(reason)';
			});
		} else if (modalDimension === '' && type === 'Notification') {
			this.modalService.open(content, { windowClass: 'modal-danger', centered: true }).result.then((result) => {
				this.closeResult = 'Closed with: $result';
			}, (reason) => {
				this.closeResult = 'Dismissed $this.getDismissReason(reason)';
			});
		} else {
			this.modalService.open(content, { centered: true }).result.then((result) => {
				this.closeResult = 'Closed with: $result';
			}, (reason) => {
				this.closeResult = 'Dismissed $this.getDismissReason(reason)';
			});
		}
	}


}
