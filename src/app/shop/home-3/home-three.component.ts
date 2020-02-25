import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Product } from '../../shared/classes/product';
import { ProductsService } from '../../shared/services/products.service';
import * as $ from 'jquery'
import * as firebase from "firebase/app"
import "firebase/firestore"
import { EmailService } from "../../shared/services/email.service";
import * as axios from 'axios'
import * as FormData from 'form-data'

@Component({
  selector: 'app-home-three',
  templateUrl: './home-three.component.html',
  styleUrls: ['./home-three.component.scss']
})
export class HomeThreeComponent implements OnInit, AfterViewInit {

  ngAfterViewInit(): void {
    //this.recordWebsiteVisits()
  }

  public products: Product[] = [];


  constructor(private productsService: ProductsService) { }

  ngOnInit() {
    this.productsService.getProducts().subscribe(product => this.products = product);
    $('#fc_frame, #fc_frame.fc-widget-normal').css("bottom", "35px").css("right", "0px")

    this.sendReminderToUsersFromSocialTree()
    // firebase.firestore().collection('orders').where('payment_status', '==', 'unpaid').where('status', '==', 'canceled').get().then(d => {
    //   d.forEach(r => {
    //     console.log(r.data())
    //   })
    // })
  }

  async sendReminderToUsersFromSocialTree() {
    try {
      const promises: any[] = []
      const subCategories = await firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').where('deleted', '==', false).get()
      const products = await firebase.firestore().collection('db').doc('tacadmin').collection('products').where('deleted', '==', false).get()
      const current_date = new Date().getUTCDate()
      const date_current_month = new Date().getUTCMonth()
      const date_one_month_ahead = date_current_month + 1
      const firebase_query_data = []
      const current_query = await firebase.firestore().collection('social-tree-events').where('event_month', '==', date_current_month).get()
      var ahead_query = null
      if (current_date >= 28) {
        ahead_query = await firebase.firestore().collection('social-tree-events').where('event_month', '==', date_one_month_ahead).get()
      }
      firebase_query_data.push(current_query)
      if (ahead_query != null) {
        firebase_query_data.push(ahead_query)
      }
      firebase_query_data[0].forEach(async query => {
        const tree = query.data()
        const d = `${tree['event_date']}`.split('-')
        const _current_date = new Date()
        // console.log(`current date = ${_current_date.getUTCMonth()}`) 
        const tree_event_date = new Date(_current_date.getFullYear(), Number(d[1]) - 1, Number(d[2]))
        // console.log(`tree date = ${tree_event_date.getUTCMonth()}`) 
        const diff = tree_event_date.getTime() - _current_date.getTime()
        const one_day = 1000 * 60 * 60 * 24
        // const dateDiff = new Date(diff) 
        const dayDiff = Math.round(diff / one_day);
        console.log(`difference in days = ${dayDiff}`)
        if (dayDiff == 3 || dayDiff == 1 || dayDiff == 0) {
          //upcoming birthday 
          const evName = `${tree['event_name']}`.toLowerCase() //.split(' ') 
          const user_email = tree['user_id']
          const socialTreeID = tree['social_tree_id']
          const getSocialTreeData = await firebase.firestore().collection('social-tree').doc(socialTreeID).get()
          const getUserData = await firebase.firestore().collection('users').doc(user_email).get()
          const user = getUserData.data()
          const st = getSocialTreeData.data()
          if (st != undefined && user != undefined) {
            const gender = `${st['gender']}`
            const name = st['name']
            const relationship = st['relationship']
            const image = st['profile_image_url']
            // const st_email = `${st['email']}`
            //search for suggested gift baskets 
            var searched_cat_id = ''
            subCategories.forEach(q => {
              const sc = q.data()
              const sc_meta = `${sc['meta']}`.toLowerCase().split(',')
              const sc_name = `${sc['name']}`.toLowerCase()
              if (sc_name.includes(evName) || sc_meta.includes(evName)) {
                searched_cat_id = sc['id']
              }
            })
            console.log(`category found 1 == ${searched_cat_id}`)
            if (searched_cat_id == '') {
              subCategories.forEach(q => {
                const sc = q.data()
                const sc_meta = `${sc['meta']}`.toLowerCase().split(',')
                if (sc_meta.includes(gender)) {
                  searched_cat_id = sc['id']
                }
              })
            }
            console.log(`category found 2 == ${searched_cat_id}`)
            const resultPro: firebase.firestore.DocumentData[] = []
            products.forEach(q => {
              const pro = q.data()
              const cat = `${pro['category']}`.split(',')
              if (cat.includes(searched_cat_id)) {
                resultPro.push(pro)
              }
            })
            console.log(`prod len = ${resultPro.length}`)
            var index = 3, len = 0
            var product_columns = ''
            resultPro.forEach(p => {
              const pName = p['name']
              const img = p['pictures']
              const pImage = img[0]
              const pLink = `https://tacgifts.com/home/product/${p['menu_link']}`
              console.log(`prod name = ${pName} & img == ${pImage}`)
              if (index % 2 == 1) {
                product_columns += '<tr>'
                product_columns += ` <td class="pc-xs-ta-center" style="font-size: 0;" valign="top"> <!--[if (gte mso 9)|(IE)]><table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation"><tr><td width="50%" valign="top"><![endif]--> `
                product_columns += ` <div class="pc-sm-mw-50pc pc-xs-mw-100pc" style="display: inline-block; width: 100%; max-width: 280px; vertical-align: top;"> <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"> <tbody> <tr> <td style="padding: 20px;" valign="top"> <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"> <tbody> <tr> <td valign="top"> <img class="pc-xs-m-0-auto" src="${pImage}" width="230" height="240" alt="" style="border: 0; line-height: 100%; outline: 0; -ms-interpolation-mode: bicubic; color: #151515; max-width: 100%; height: auto; display: block;"> </td> </tr> <tr> <td height="16" style="font-size: 1px; line-height: 1px;">&nbsp;</td> </tr> </tbody> <tbody> <tr> <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 700; line-height: 34px; letter-spacing: -0.3px; color: #151515;" valign="top"> ${pName} </td> </tr> <tr> <td height="4" style="font-size: 1px; line-height: 1px;">&nbsp;</td> </tr> </tbody> <tbody> <tr> <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 500; color: #9B9B9B;" valign="top"></td> </tr> <tr> <td height="17" style="font-size: 1px; line-height: 1px;">&nbsp;</td> </tr> </tbody> <tbody> <tr> <td valign="top"> <table class="pc-xs-m-0-auto" border="0" cellpadding="0" cellspacing="0" role="presentation"> <tbody> <tr> <td style="padding: 13px 17px; border-radius: 8px; background-color: #e4159c" bgcolor="#e4159c" valign="top" align="center"> <a class="pc-fb-font" href="${pLink}" style="line-height: 24px; text-decoration: none; word-break: break-word; font-weight: 500; display: block; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff;">Shop now</a> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </div> <!--[if (gte mso 9)|(IE)]></td><![endif]--> `
              }

              if (index % 2 == 0) {
                product_columns += `<!--[if (gte mso 9)|(IE)]><td width="50%" valign="top"><![endif]-->`
                product_columns += ` <div class="pc-sm-mw-50pc pc-xs-mw-100pc" style="display: inline-block; width: 100%; max-width: 280px; vertical-align: top;"> <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"> <tbody> <tr> <td style="padding: 20px;" valign="top"> <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"> <tbody> <tr> <td valign="top"> <img class="pc-xs-m-0-auto" src="${pImage}" width="230" height="240" alt="" style="border: 0; line-height: 100%; outline: 0; -ms-interpolation-mode: bicubic; color: #151515; max-width: 100%; height: auto; display: block;"> </td> </tr> <tr> <td height="16" style="font-size: 1px; line-height: 1px;">&nbsp;</td> </tr> </tbody> <tbody> <tr> <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 700; line-height: 34px; letter-spacing: -0.3px; color: #151515;" valign="top"> ${pName} </td> </tr> <tr> <td height="4" style="font-size: 1px; line-height: 1px;">&nbsp;</td> </tr> </tbody> <tbody> <tr> <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 500; color: #9B9B9B;" valign="top"></td> </tr> <tr> <td height="17" style="font-size: 1px; line-height: 1px;">&nbsp;</td> </tr> </tbody> <tbody> <tr> <td valign="top"> <table class="pc-xs-m-0-auto" border="0" cellpadding="0" cellspacing="0" role="presentation"> <tbody> <tr> <td style="padding: 13px 17px; border-radius: 8px; background-color: #e4159c" bgcolor="#e4159c" valign="top" align="center"> <a class="pc-fb-font" href="${pLink}" style="line-height: 24px; text-decoration: none; word-break: break-word; font-weight: 500; display: block; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff;">Shop now</a> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </div> `
                product_columns += `<!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]-->`
                product_columns += '</td>'
                product_columns += '</tr>'
              }
              len = len + 1
              index = index + 1
              if (len == resultPro.length) {
                if (index % 2 == 1) {
                  product_columns += `<!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]-->`
                  product_columns += '</td>'
                  product_columns += '</tr>'
                }
              }
            })
            const user_name = user['firstname']
            const textMessage = `Hi ${user_name}, <br><br>You have an upcoming event <b>${evName}</b> ${(dayDiff == 3 || dayDiff == 1) ? `in ${dayDiff} day(s) time` : `happening today`}. <br><br>Below are suggested gift baskets you can send to ${(gender.toLowerCase() == 'male') ? 'him' : 'her'}.<br><br>Don't just gift it, TAC it!`
            const emailBody = new EmailService().getSocialTreeReminderHTMLBody(textMessage, image, name, relationship, evName, product_columns)
            const url = `https://avidprintsconcierge.com/emailsending/socialtree.php?sender_email=${user_email}&sender_name=${user_name}`
            // console.log(`emailBody = ${product_columns}`)
            $('#st').append(emailBody)
            const fd1 = new FormData()
            fd1.append("body", emailBody)
            const promise = axios.default.post(url, fd1)
            promises.push(promise)
          }
        }
      })
      console.log(`i dey here now`)
      axios.default.all(promises).then((result) => {
        console.log(result)
        result.forEach(res => {
          console.log(res)
        })
      }).catch(err => {
        console.log(err)
        console.log(err.response)
        console.log(JSON.stringify(err))
      })
    } catch (err) {
      console.log(`catch err: ${err}`)
    }
  }




  //   recordWebsiteVisits() {
  //     const date = new Date()
  //     const months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  //     const year = date.getUTCFullYear()
  //     const month = months[date.getUTCMonth()]
  //     const day = date.getUTCDate()

  //     const firebase_ref = firebase.database().ref("website-views").child(`${year}`).child(month).child(`${day}`)
  //     firebase_ref.child("metric").once('value', snap => {
  //        if (snap.exists()) {
  //           const current_metric: number = snap.val()
  //           firebase_ref.update({ 'metric': current_metric + 1 })
  //        } else {
  //           firebase_ref.update({ 'metric': 1 })
  //        }
  //     })
  //  }


}
