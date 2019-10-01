import { Component, OnInit } from '@angular/core';
import { AppConfig } from 'src/app/services/global.service';
import { OverlayService } from 'src/app/overlay/overlay.module';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { ProgressSpinnerComponent } from 'src/app/progress-spinner/progress-spinner.module';
import { ProductsService } from 'src/app/shared/services/products.service';
import * as $ from 'jquery'
import { EmailService } from 'src/app/shared/services/email.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  config = new AppConfig()
  emailService = new EmailService()

  constructor(private previewProgressSpinner: OverlayService, private http: HttpClient, private router: Router, private productService: ProductsService) { }

  ngOnInit() {

  }

  signupWithGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    provider.addScope('https://www.googleapis.com/auth/calendar.events.readonly')
    firebase.auth().signInWithPopup(provider).then(result => {
      //{headers: new HttpHeaders({'Authorization':'Bearer ya29.Gls_BxF-gXvGwf7VUjiejdkymdQxB3n5U_K4yKpIaXb45_uIRNu9nsXXMkcw6WXSe7zW2ofKGX4p061CSW0tXNprTspG8muURLAx2BnwBgzZ7xOGnWt6dHvdLl8G'})}
      // console.log(result)
      // this.http.get('https://www.googleapis.com/calendar/v3/calendars/primary/events').toPromise().then(res => {
      //   console.log(JSON.stringify(res))
      // })
      const user_email = result.user.email
      this.uploadFirestoreAndRedirect('google', user_email, result, null)
    }).catch(err => {
      //this.previewProgressSpinner.close()
      //this.config.displayMessage(`${err}`, false)
    })
  }

  signupWithFacebook() {
    var provider = new firebase.auth.FacebookAuthProvider();
    // provider.addScope('user_events');
    provider.addScope('email');
    provider.addScope('user_birthday');
    provider.addScope('user_friends');
    provider.addScope('user_gender')
    firebase.auth().signInWithPopup(provider).then(result => {
      console.log(result)
      const user_email = result.user.email
      this.uploadFirestoreAndRedirect('facebook', user_email, result, null)
    }).catch(err => {
      //this.previewProgressSpinner.close()
      //this.config.displayMessage(`${err}`, false)
    })
  }

  signupWithEmailAndPassword() {
    const fname = (<HTMLInputElement>document.getElementById("fname")).value
    const lname = (<HTMLInputElement>document.getElementById("lname")).value
    const email = (<HTMLInputElement>document.getElementById("email")).value.toLowerCase()
    const password = (<HTMLInputElement>document.getElementById("review")).value

    if (email == '' && password == '' && fname == '' && lname == '') {
      this.config.displayMessage('Fill all fields.', false)
      return
    }
    this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
    firebase.auth().createUserWithEmailAndPassword(email, password).then(result => {
      result.user.sendEmailVerification().then(d => {
        localStorage.setItem("verified", "false");
        this.previewProgressSpinner.close()
        const data = {
          fn: fname,
          ln: lname
        }
        this.uploadFirestoreAndRedirect('email', email, null, data)
      })
    }).catch(err => {
      this.previewProgressSpinner.close()
      this.config.displayMessage(`${err}`, false)
    })
  }

  uploadFirestoreAndRedirect(method: string, email: string, google_result: firebase.auth.UserCredential, other_result: {}) {
    this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);

    var user_data: {}
    const id = firebase.database().ref().push().key

    if (other_result != null) {
      user_data = {
        'id': id,
        'blocked': false,
        'country': this.productService.country,
        'email': email,
        'created_date': `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        'firstname': other_result['fn'],
        'lastname': other_result['ln'],
        'picture': 'https://tacadmin.firebaseapp.com/assets/img/default-avatar.png'
      }
    } else {
      if (method == 'google') {
        user_data = {
          'id': id,
          'blocked': false,
          'country': this.productService.country,
          'email': email,
          'created_date': `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
          'firstname': google_result.additionalUserInfo.profile['given_name'],
          'lastname': google_result.additionalUserInfo.profile['family_name'],
          'picture': google_result.additionalUserInfo.profile['picture'],
          'Tokens': google_result.credential.toJSON()
        }
      }
      if (method == 'facebook') {
        const pic = google_result.additionalUserInfo.profile['picture']
        const pic_data = pic['data']
        user_data = {
          'id': id,
          'blocked': false,
          'country': this.productService.country,
          'email': email,
          'created_date': `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
          'firstname': google_result.additionalUserInfo.profile['first_name'],
          'lastname': google_result.additionalUserInfo.profile['last_name'],
          'picture': pic_data['url'],
          'Facebook': google_result.credential.toJSON(),
          'birthday': google_result.additionalUserInfo.profile['birthday'],
          'gender': google_result.additionalUserInfo.profile['gender'],
          'facebook_id': google_result.additionalUserInfo.profile['id'],
        }
      }
    }

    var inner_products = ''

    this.productService.getProducts().subscribe(products => {
      ``
      var index = 2
      products.slice(0, 3).forEach(pro => {
        if (index % 2 == 0) {//left
          inner_products += `<table cellpadding="0" cellspacing="0" border="0" width="88%"
          style="width:100%!important;min-width:100%;max-width:100%;border-width:1px;border-style:solid;border-color:#e8e8e8;border-bottom:none;border-left:none;border-right:none">

          <tbody>
              <tr>

                  <td align="center" valign="top">

                      <div class="m_8651446753593829059mob_b2"
                          style="display:inline-block;vertical-align:top;width:460px">

                          <table class="m_8651446753593829059mob_btn" cellpadding="0"
                              cellspacing="0" border="0" width="440"
                              style="width:440px;max-width:440px">

                              <tbody>
                                  <tr>

                                      <td align="left" valign="top">

                                          <div
                                              style="height:32px;line-height:32px;font-size:30px">
                                              &nbsp;</div>

                                          <font face="'Source Sans Pro', sans-serif"
                                              color="#27cbcc"
                                              style="font-size:22px;line-height:28px;font-weight:600">

                                              <span
                                                  style="font-family:'Source Sans Pro',Arial,Tahoma,Geneva,sans-serif;color:#27cbcc;font-size:22px;line-height:28px;font-weight:600">

                                                  ${index - 1}. ${pro.name}

                                              </span>

                                          </font>

                                          <div
                                              style="height:13px;line-height:13px;font-size:11px">
                                              &nbsp;</div>

                                          <font face="'Source Sans Pro', sans-serif"
                                              color="#5E5E5E"
                                              style="font-size:17px;line-height:20px">

                                              <span
                                                  style="font-family:'Source Sans Pro',Arial,Tahoma,Geneva,sans-serif;color:#5e5e5e;font-size:17px;line-height:20px">

                                                  ${pro.description}

                                              </span>

                                          </font>

                                          <div
                                              style="height:20px;line-height:14px;font-size:12px">
                                              &nbsp;</div>

                                          <a href="https://tacgifts.com/home/product/${pro.id}"
                                              style="display:block;font-family:'Source Sans Pro',Verdana,Tahoma,Geneva,sans-serif;color:#ff9800;font-size:15px;line-height:18px;text-decoration:none;white-space:nowrap;text-transform:uppercase"
                                              target="_blank"
                                              data-saferedirecturl="https://www.google.com/url?q=https://tacgifts.com/home/product/${pro.id}">

                                              <font face="'Source Sans Pro', sans-serif"
                                                  color="#ff9800"
                                                  style="font-size:15px;line-height:18px;text-decoration:none;white-space:nowrap;text-transform:uppercase">

                                                  <span
                                                      style="font-family:'Source Sans Pro',Verdana,Tahoma,Geneva,sans-serif;color:#ff9800;font-size:15px;line-height:18px;text-decoration:none;white-space:nowrap;text-transform:uppercase;border:1px solid #ff9800;padding:10px;border-radius:5px;background-color:#ff9800;color:#ffffff">

                                                      Shop Now

                                                  </span>

                                              </font>

                                          </a>

                                      </td>

                                  </tr>

                              </tbody>
                          </table>

                      </div>



                      <div class="m_8651446753593829059mob_b2"
                          style="display:inline-block;text-align:center;vertical-align:middle;width:180px;height:100%">

                          <table class="m_8651446753593829059mob_btn" cellpadding="0"
                              cellspacing="0" border="0" width="160"
                              style="width:160px;max-width:160px">

                              <tbody>
                                  <tr>

                                      <td align="left" valign="top">

                                          <div
                                              style="height:32px;line-height:32px;font-size:30px">
                                              &nbsp;</div>

                                          <a href="#m_8651446753593829059_"
                                              style="display:block;max-width:100%">

                                              <img src="${pro.pictures[0]}"
                                                  alt="img" width="100%" border="0"
                                                  style="display:block;width:100%"
                                                  class="CToWUd">

                                          </a>



                                      </td>

                                  </tr>

                              </tbody>
                          </table>

                      </div>



                  </td>

              </tr>

          </tbody>
      </table>`
        } else {//right
          inner_products += `
            <table cellpadding="0" cellspacing="0" border="0" width="88%"
                                    style="width:100%!important;min-width:100%;max-width:100%;border-width:1px;border-style:solid;border-color:#e8e8e8;border-bottom:none;border-left:none;border-right:none">

                                    <tbody>
                                        <tr>

                                            <td align="center" valign="top">

                                                <div class="m_8651446753593829059mob_b2"
                                                    style="display:inline-block;text-align:center;vertical-align:middle;width:180px;height:100%">

                                                    <table class="m_8651446753593829059mob_btn" cellpadding="0"
                                                        cellspacing="0" border="0" width="160"
                                                        style="width:160px;max-width:160px">

                                                        <tbody>
                                                            <tr>

                                                                <td align="left" valign="top">

                                                                    <div
                                                                        style="height:32px;line-height:32px;font-size:30px">
                                                                        &nbsp;</div>

                                                                    <a href="#m_8651446753593829059_"
                                                                        style="display:block;max-width:100%">

                                                                        <img src="${pro.pictures[0]}"
                                                                            alt="img" width="100%" border="0"
                                                                            style="display:block;width:100%"
                                                                            class="CToWUd">

                                                                    </a>



                                                                </td>

                                                            </tr>

                                                        </tbody>
                                                    </table>

                                                </div>



                                                <div class="m_8651446753593829059mob_b2"
                                                    style="display:inline-block;vertical-align:top;width:460px">

                                                    <table class="m_8651446753593829059mob_btn" cellpadding="0"
                                                        cellspacing="0" border="0" width="440"
                                                        style="width:440px;max-width:440px">

                                                        <tbody>
                                                            <tr>

                                                                <td align="left" valign="top">

                                                                    <div
                                                                        style="height:32px;line-height:32px;font-size:30px">
                                                                        &nbsp;</div>

                                                                    <font face="'Source Sans Pro', sans-serif"
                                                                        color="#27cbcc"
                                                                        style="font-size:22px;line-height:28px;font-weight:600">

                                                                        <span
                                                                            style="font-family:'Source Sans Pro',Arial,Tahoma,Geneva,sans-serif;color:#27cbcc;font-size:22px;line-height:28px;font-weight:600">

                                                                            ${index - 1}. ${pro.name}

                                                                        </span>

                                                                    </font>

                                                                    <div
                                                                        style="height:13px;line-height:13px;font-size:11px">
                                                                        &nbsp;</div>

                                                                    <font face="'Source Sans Pro', sans-serif"
                                                                        color="#5E5E5E"
                                                                        style="font-size:17px;line-height:20px">

                                                                        <span
                                                                            style="font-family:'Source Sans Pro',Arial,Tahoma,Geneva,sans-serif;color:#5e5e5e;font-size:17px;line-height:20px">

                                                                            ${pro.description}

                                                                        </span>

                                                                    </font>

                                                                    <div
                                                                        style="height:20px;line-height:14px;font-size:12px">
                                                                        &nbsp;</div>

                                                                    <a href="https://tacgifts.com/home/product/${pro.id}"
                                                                        style="display:block;font-family:'Source Sans Pro',Verdana,Tahoma,Geneva,sans-serif;color:#ff9800;font-size:15px;line-height:18px;text-decoration:none;white-space:nowrap;text-transform:uppercase"
                                                                        target="_blank"
                                                                        data-saferedirecturl="https://www.google.com/url?q=https://tacgifts.com/home/product/${pro.id}">

                                                                        <font face="'Source Sans Pro', sans-serif"
                                                                            color="#ff9800"
                                                                            style="font-size:15px;line-height:18px;text-decoration:none;white-space:nowrap;text-transform:uppercase">

                                                                            <span
                                                                                style="font-family:'Source Sans Pro',Verdana,Tahoma,Geneva,sans-serif;color:#ff9800;font-size:15px;line-height:18px;text-decoration:none;white-space:nowrap;text-transform:uppercase;border:1px solid #ff9800;padding:10px;border-radius:5px;background-color:#ff9800;color:#ffffff">

                                                                                Shop Now

                                                                            </span>

                                                                        </font>

                                                                    </a>

                                                                </td>

                                                            </tr>

                                                        </tbody>
                                                    </table>

                                                </div>



                                            </td>

                                        </tr>

                                    </tbody>
                                </table>
            `
        }
        inner_products += `<div style="height:32px;line-height:32px;font-size:30px">&nbsp;</div>`
        index = index + 1
      })
      const email_body = this.emailService.getRegistrationBody(inner_products)
      //console.log(email_body)
      const pd = this.previewProgressSpinner
      const rt = this.router
      const cf = this.config

      firebase.firestore().collection('users').doc(email.toLowerCase()).set(user_data).then(result => {
        $(function () {
          $.ajax({
            url: `https://avidprintsconcierge.com/emailsending/register.php?sender_email=${email}&sender_name=${user_data['firstname']} ${user_data['lastname']}`,
            type: "post",
            dataType: "html",
            success: function (data) {
              pd.close()
              localStorage.setItem('email', email)
              localStorage.setItem('fn', user_data['firstname'])
              localStorage.setItem('ln', user_data['lastname'])
              if (other_result != null) {
                //cf.displayMessage('', true)
              }
              // rt.navigate(['/home'])
              location.href = '/home'
            },
            error: function (err) {
              pd.close()
              localStorage.setItem('email', email)
              localStorage.setItem('fn', user_data['firstname'])
              localStorage.setItem('ln', user_data['lastname'])
              localStorage.removeItem("signInAnonymously")
              if (other_result != null) {
                //cf.displayMessage('', true)
              }
              // rt.navigate(['/home'])
              location.href = '/home'
            },
            data: {
              body: `${email_body}`
            }
          });
        });
      }).catch(err => {
        this.previewProgressSpinner.close()
        this.config.displayMessage(`${err}`, false)
      })
    })
  }


}
