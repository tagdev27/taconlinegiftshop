import * as functions from 'firebase-functions';
// import * as firestore from '@google-cloud/firestore';
import * as admin from 'firebase-admin';

import * as axios from 'axios';
import * as mHttp from 'request';
import * as FormData from 'form-data'
// import * as $ from 'jquery';

//const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore()
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

export const getIP = functions.https.onRequest((request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    axios.default.get('http://ip-api.com/json/').then(r => {
        response.send(r.data)
    }).catch(err => {
        response.send({ "error": `internal error ${err}` })
    })

})

export const get_all_products = functions.https.onRequest((greq, gresp) => {
    // response.setHeader("Access-Control-Allow-Origin","*")
    // response.setHeader("allow"," AUTHORIZATION, HEAD, POST, OPTIONS, OPTIONS, GET")
    // response.setHeader("content-type","application/json")

    gresp.setHeader("Access-Control-Allow-Origin", "*");
    gresp.setHeader("Access-Control-Allow-Credentials", "true");
    gresp.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    gresp.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    const requ = greq.query.action
    const authorization = greq.headers.authorization
    if (authorization === null) {
        gresp.send({ "error": "No api key found" })
        return
    } else {
        return admin.firestore().collection('authorizations').where("api_key", "==", authorization).get().then(async _res => {
            if (_res.size === 0) {
                gresp.send({ "error": "Invalid api key" });
            } else {
                const returnedProducts: any[] = []
                if (requ === 'get') {
                    const getTax = await admin.firestore().collection('db').doc('tacadmin').collection('settings').doc('tax').get()
                    var tax = 0
                    const delivery_fee = 2000
                    const t = getTax.data()
                    if (t !== undefined) {
                        tax = t['tax_value']
                    }
                    const products = await admin.firestore().collection('db').doc('tacadmin').collection('products').where("deleted", "==", false).orderBy("created_timestamp", "desc").get()
                    products.forEach(pro => {
                        const getP = pro.data()
                        const price = getP['price'] + Number(((getP['price'] * tax) / 100).toFixed(2)) + delivery_fee
                        const sale_price = getP['salePrice'] + Number(((getP['salePrice'] * tax) / 100).toFixed(2)) + delivery_fee
                        const isSale: boolean = getP['sale']
                        getP['price'] = price
                        getP['salePrice'] = sale_price
                        if (`${getP['scheduled_sales_period']}` !== '-') {
                            const sale_start: string = `${getP['scheduled_sales_period']}`.split('-')[0]
                            const sale_end: string = `${getP['scheduled_sales_period']}`.split('-')[1]
                            if (!isSale) {
                                const today = new Date().getTime()
                                const sale_start_date = new Date(sale_start).getTime()
                                const sale_end_date = new Date(sale_end).getTime()

                                if (today > sale_start_date && today < sale_end_date) {
                                    getP['sale'] = true
                                    getP['price'] = sale_price
                                    getP['salePrice'] = price
                                }
                            }
                        } else {
                            if (isSale) {
                                getP['price'] = sale_price
                                getP['salePrice'] = price
                            }
                        }
                        returnedProducts.push(getP)
                    })
                    gresp.send(returnedProducts);
                } else {
                    gresp.send([]);
                }
            }
        })
    }
})

export const onOrderCreated = functions.firestore.document("orders/{orderId}").onCreate(async (snapshot, context) => {
    //const orderId = context.params.orderId
    if (snapshot.exists) {
        const _data = snapshot.data()
        if (_data !== undefined) {
            const country = _data['country']
            const curr = _data['currency_used']
            const amount = _data['total_amount']
            const email = _data['email']
            //console.log(`${country} ================ ${amount}`)
            await sendNotification("New Order From TAC", `Order worth of ${curr}${amount} has been placed from ${country}`)
            await sendNotificationToUserDevice(email, 'Order from TAC', 'Your order has been received by TAC. ')
        }
    }
})

async function sendNotificationToUserDevice(email: string, title: string, body: string): Promise<any> {
    const user = await admin.firestore().collection('users').doc(email.toLowerCase()).get()
    const _data = user.data()
    if (_data !== undefined) {
        const payload = {
            notification: {
                title: title,
                body: body,
            },
        }
        if (_data['msgId'] !== null) {
            return admin.messaging().sendToDevice(`${_data['msgId']}`, payload)
        }
    }
}

function sendNotification(title: string, body: string): Promise<any> {
    const devices: string[] = []
    return admin.firestore().collection("devices").where("access", "array-contains", "Sales").get().then(query => {
        query.forEach(data => {
            const dev = data.data()
            devices.push(dev['id'])
        })
        const payload = {
            notification: {
                title: title,
                body: body,
                click_action: 'https://tacadmin.firebaseapp.com/sales/orders',
            },
        }
        devices.forEach(id => {
            return admin.messaging().sendToDevice(id, payload)
        })

    })
}

export const onAlertNewOrderCreated = functions.firestore.document("alert-new-order/{orderId}").onCreate((snapshot, context) => {
    const orderId = context.params.orderId
    if (snapshot.exists) {
        // console.log('hereee 1')
        setTimeout(() => {
            // console.log('hereee 2')
            return admin.firestore().collection("alert-new-order").doc(orderId).delete()
        }, 1000)
    }
})

export const mailChimpRegistrationOnAuthCreated = functions.auth.user().onCreate((user) => {

    const email = user.email

    if (email === null) {
        return
    }

    const key = functions.config().mailchimp.key

    const mailchimp_body = {
        'email_address': `${email}`,
        'status': 'subscribed',
        'email_type': 'html',
    }

    const _headers = {
        'Authorization': `apikey ${key}`,
        'Content-Type': 'application/json',
    }

    return axios.default.post('https://us3.api.mailchimp.com/3.0/lists/12de55fae0/members', JSON.stringify(mailchimp_body), { headers: _headers })

    // return mHttp.post('https://us3.api.mailchimp.com/3.0/lists/12de55fae0/members', { headers: _headers, body: mailchimp_body, form: mailchimp_body }).on('data', (resp) => {
    //     console.log(resp.toString())
    // }).on('error', (err) => {
    //     console.log(`Error:${err}`)
    // })

    //return axios.default.post('https://us3.api.mailchimp.com/3.0/lists/12de55fae0/members', mailchimp_body, { headers: _headers })

})

export const mailChimpRegistration = functions.https.onRequest((request, response) => {

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    //const body = request.body
    const email = request.query.email_address
    const lat = request.query.lat
    const lng = request.query.lng
    const fn = request.query.fn
    const ln = request.query.ln
    const tags = request.query.tag

    //console.log(`${email}====${lat}======${lng}======${fn}======${ln}======${tags}`)

    const key = functions.config().mailchimp.key

    const mailchimp_body = {
        'email_address': `${email}`,
        'status': 'subscribed',
        'email_type': 'html',
        'tags': (tags !== null) ? [tags] : [],
        'location': {
            'latitude': lat,
            'longitude': lng,
        },
        'merge_fields': {
            'FNAME': `${fn}`,
            'LNAME': `${ln}`,
        },
    }

    const _headers = {
        'Authorization': `apikey ${key}`,
        'Content-Type': 'application/json',
    }

    //console.log(`body: ${mailchimp_body.location.latitude}`)

    // $.ajax({
    //     url: 'https://us3.api.mailchimp.com/3.0/lists/12de55fae0/members',
    //     dataType: 'json',
    //     headers: _headers,
    //     data: mailchimp_body,
    //     method: 'post',
    //     type: 'post',
    //     crossDomain: true,
    //     success: function (data) {
    //         response.send(data)
    //     }, error: function (err) {
    //         response.send(`error: ${err}`)
    //     }
    // })


    // mHttp.post('https://us3.api.mailchimp.com/3.0/lists/12de55fae0/members', { headers: _headers, body:mailchimp_body, form:mailchimp_body }).on('data', (resp) => {
    //     response.send(JSON.parse(resp.toString()))
    // }).on('error', (err) => {
    //     console.log(`Error:${err}`)
    // }).on('response', (req) => {
    //     console.log(`req=======${req.body}`)
    // })

    axios.default.post('https://us3.api.mailchimp.com/3.0/lists/12de55fae0/members', JSON.stringify(mailchimp_body), { headers: _headers }).then(res => {
        response.send('Done')
    }).catch(err => {
        //console.log(err)
        response.send(err)
    })


})

export const dailyCurrencyJobChecker = functions.pubsub.schedule('01 12 * * *').onRun(async (context) => {
    const query = await db.collection('db').doc('tacadmin').collection('currency').get()

    query.forEach(data => {
        const curr = data.data()
        if (curr['country'] !== 'Nigeria') {
            const con_curreny = curr['name']
            getExchangeRate(con_curreny, curr['id'])
            // .then(res => {
            //     console.log(`From: ${con_curreny} ====== ${res['data']}`)
            // }).catch(err => {
            //     console.log(err)
            // })
        }
    })
})

function getExchangeRate(from_currency: any, document_id: any) {

    const secret_key = functions.config().flw.secret_key

    const _headers = {
        'Content-Type': 'application/json',
    }

    const flw_body = {
        "secret_key": `${secret_key}`,//"FLWSECK_TEST-ee6997928d4342262fdda896ee3266d7-X",
        "service": "rates_convert",
        "service_method": "post",
        "service_version": "v1",
        "service_channel": "transactions",
        "service_channel_group": "merchants",
        "service_payload": {
            "FromCurrency": `${from_currency}`,
            "ToCurrency": "NGN",
            "Amount": 1,
        },
    }

    mHttp.post('https://api.ravepay.co/v2/services/confluence', { headers: _headers, body: flw_body, form: flw_body }).on('data', async (res) => {

        const resp = JSON.parse(res.toString())

        const status = resp['status']

        if (status === 'success') {
            const dt = resp['data']

            if (dt['Rate'] !== null) {
                const amount = Number(dt['Rate']).toFixed(2)

                await db.collection('db').doc('tacadmin').collection('currency').doc(document_id).update({ 'exchange_rate': Number(amount) })
            }
        }

    }).on('error', (err) => {
        console.log(`${from_currency}: Error: ${err}`)
    })
}

export const verifyTransaction = functions.https.onRequest((request, response) => {

    const secret_key = functions.config().flw.secret_key

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    const authorization = request.headers.authorization
    const ref = request.query.ref

    if (authorization === null) {
        response.send({ "error": "No api key found" });
        return
    } else {
        return admin.firestore().collection('authorizations').where("api_key", "==", authorization).get().then(async res => {
            if (res.size === 0) {
                response.send({ "error": "Invalid api key" });
            } else {

                const _headers = {
                    'Content-Type': 'application/json',
                }

                const flw_body = {
                    "SECKEY": `${secret_key}`,
                    "txref": `${ref}`,
                }

                mHttp.post('https://api.ravepay.co/flwv3-pug/getpaidx/api/v2/verify', { headers: _headers, body: flw_body, form: flw_body }).on('data', (resp) => {

                    response.send(JSON.parse(resp.toString()))

                }).on('error', () => {
                    response.send({ "error": "internal error" })
                    // console.log(`${from_currency}: Error: ${err}`)
                })
            }
        })
    }
})

export const verifyTransactionTest = functions.https.onRequest((request, response) => {

    const secret_key = 'FLWSECK_TEST-38fd24d95eddb03b581c35199aee2093-X'//functions.config().flw.secret_key

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    const authorization = request.headers.authorization
    const ref = request.query.ref

    if (authorization === null) {
        response.send({ "error": "No api key found" });
        return
    } else {
        return admin.firestore().collection('authorizations').where("api_key", "==", authorization).get().then(async res => {
            if (res.size === 0) {
                response.send({ "error": "Invalid api key" });
            } else {

                const _headers = {
                    'Content-Type': 'application/json',
                }

                const flw_body = {
                    "SECKEY": `${secret_key}`,
                    "txref": `${ref}`,
                }

                mHttp.post('https://api.ravepay.co/flwv3-pug/getpaidx/api/v2/verify', { headers: _headers, body: flw_body, form: flw_body }).on('data', (resp: any) => {

                    response.send(JSON.parse(resp.toString()))

                }).on('error', () => {
                    response.send({ "error": "internal error" })
                    // console.log(`${from_currency}: Error: ${err}`)
                })
            }
        })
    }
})

export const verify2CheckoutTransaction = functions.https.onRequest((request, response) => {

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    const authorization = request.headers.authorization
    const ref = request.query.ref

    if (authorization === null) {
        response.send({ "error": "No api key found" });
        return
    } else {
        return admin.firestore().collection('authorizations').where("api_key", "==", authorization).get().then(async res => {
            if (res.size === 0) {
                response.send({ "error": "Invalid api key" });
                return
            } else {

                mHttp.get('https://avidprintsconcierge.com/emailsending/login.php').on('data', (resp) => {

                    const _headers = {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                    // console.log(`ref = ${ref} session = ${resp.toString()}`)

                    const api_body = {
                        "jsonrpc": "2.0",
                        "method": "getOrder",
                        "params": [resp.toString(), ref],
                        "id": `2${ref}1`,
                    }

                    // mHttp.post('https://api.avangate.com/rpc/5.0/', { headers: _headers, body: JSON.stringify(api_body) }).on('data', (r) => {

                    //     response.send(JSON.parse(r.toString()))

                    // }).on('error', (e) => {
                    //     response.send({ "error": `internal error1 ${e}` })
                    // })

                    axios.default.post('https://api.avangate.com/rpc/5.0/', JSON.stringify(api_body), { headers: _headers }).then(r => {
                        response.send(r.data)
                    }).catch(err => {
                        response.send({ "error": `internal error1 ${err}` })
                    })

                }).on('error', (e) => {
                    response.send({ "error": `internal error2 ${e.message}` })
                })
            }
        })
    }
})

export const getFlutterwaveKeys = functions.https.onRequest((request, response) => {

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    const authorization = request.headers.authorization

    if (authorization === null) {
        response.send({ "error": "No api key found" });
        return
    } else {
        return admin.firestore().collection('authorizations').where("api_key", "==", authorization).get().then(async res => {
            if (res.size === 0) {
                response.send({ "error": "Invalid api key" });
                
            } else {
                const fpk = functions.config().flutterwave.pk
                const fenk = functions.config().flutterwave.enc
                response.send({ "public_key": `${fpk}`, "enc_key": `${fenk}` })
                // admin.database().ref("apikeys").once('value', snapshot => {
                //     const _keys = snapshot.val()
                //     response.send({ "public_key": _keys['flutterwave_public_key'], "enc_key": _keys['flutterwave_encryption_key'] })
                // })

            }
        })
    }
})

export const sendReminderToUsersFromSocialTree = functions.pubsub.schedule('01 12 * * *').onRun(async (context) => {

    // try {
    const _promises: any[] = []

    const subCategories = await db.collection('db').doc('tacadmin').collection('sub-categories').where('deleted', "==", false).get()
    const products = await db.collection('db').doc('tacadmin').collection('products').where('deleted', "==", false).get()

    const current_date = new Date().getUTCDate()

    const date_current_month = new Date().getUTCMonth()

    const date_one_month_ahead = date_current_month + 1

    const firebase_query_data = []

    const current_query = await db.collection('social-tree-events').where('event_month', "==", date_current_month).get()

    var ahead_query = null
    if (current_date >= 28) {
        ahead_query = await db.collection('social-tree-events').where('event_month', "==", date_one_month_ahead).get()
    }

    firebase_query_data.push(current_query)
    if (ahead_query !== null) {
        firebase_query_data.push(ahead_query)
    }

    firebase_query_data[0].forEach(async query => {
        const tree = query.data()
        // const d = `${tree['event_date']}`.split('-')
        const _current_date = new Date()
        // console.log(`current date = ${_current_date.getUTCMonth()}`)
        const tree_event_date = new Date(_current_date.getFullYear(), Number(tree['event_month']), Number(tree['event_day']))
        // console.log(`tree date = ${tree_event_date.getUTCMonth()}`)
        const diff = tree_event_date.getTime() - _current_date.getTime()
        const one_day = 1000 * 60 * 60 * 24
        // const dateDiff = new Date(diff)
        const dayDiff = Math.round(diff / one_day);
        console.log(`difference in days = ${dayDiff}`)

        if (dayDiff === 3 || dayDiff === 1 || dayDiff === 0) {
            //upcoming birthday
            const evName = `${tree['event_name']}`.toLowerCase() //.split(' ')
            const user_email = tree['user_id']
            const socialTreeID = tree['social_tree_id']
            const getSocialTreeData = await db.collection('social-tree').doc(socialTreeID).get()
            const getUserData = await db.collection('users').doc(user_email).get()
            const user = getUserData.data()
            const st = getSocialTreeData.data()
            if (st !== undefined && user !== undefined) {
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
                // console.log(`category found 1 === ${searched_cat_id}`)

                if (searched_cat_id === '') {
                    subCategories.forEach(q => {
                        const sc = q.data()
                        const sc_meta = `${sc['meta']}`.toLowerCase().split(',')
                        if (sc_meta.includes(gender)) {
                            searched_cat_id = sc['id']
                        }
                    })
                }
                // console.log(`category found 2 === ${searched_cat_id}`)

                const resultPro: FirebaseFirestore.DocumentData[] = []
                products.forEach(q => {
                    const pro = q.data()
                    const cat = `${pro['category']}`.split(',')
                    if (cat.includes(searched_cat_id)) {
                        resultPro.push(pro)
                    }
                })

                // console.log(`prod len = ${resultPro.length}`)

                var index = 3, len = 0
                var product_columns = ''

                resultPro.forEach(p => {
                    const pName = p['name']
                    const img = p['pictures']
                    const pImage = img[0]
                    const pLink = `https://tacgifts.com/home/product/${p['menu_link']}`

                    // console.log(`prod name = ${pName} & img === ${pImage}`)

                    if (index % 2 === 1) {
                        product_columns += '<tr>'
                        product_columns += `
            <td class="pc-xs-ta-center" style="font-size: 0;" valign="top">
            <!--[if (gte mso 9)|(IE)]><table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation"><tr><td width="50%" valign="top"><![endif]-->
            `
                        product_columns += `
            <div class="pc-sm-mw-50pc pc-xs-mw-100pc" style="display: inline-block; width: 100%; max-width: 280px; vertical-align: top;">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                                      <tbody>
                                        <tr>
                                          <td style="padding: 20px;" valign="top">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                                              <tbody>
                                                <tr>
                                                  <td valign="top">
                                                    <img class="pc-xs-m-0-auto" src="${pImage}" width="230" height="240" alt="" style="border: 0; line-height: 100%; outline: 0; -ms-interpolation-mode: bicubic; color: #151515; max-width: 100%; height: auto; display: block;">
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td height="16" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                                                </tr>
                                              </tbody>
                                              <tbody>
                                                <tr>
                                                  <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 700; line-height: 34px; letter-spacing: -0.3px; color: #151515;" valign="top">
                                                    ${pName}
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td height="4" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                                                </tr>
                                              </tbody>
                                              <tbody>
                                                <tr>
                                                  <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 500; color: #9B9B9B;" valign="top"></td>
                                                </tr>
                                                <tr>
                                                  <td height="17" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                                                </tr>
                                              </tbody>
                                              <tbody>
                                                <tr>
                                                  <td valign="top">
                                                    <table class="pc-xs-m-0-auto" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                                      <tbody>
                                                        <tr>
                                                          <td style="padding: 13px 17px; border-radius: 8px; background-color: #e4159c" bgcolor="#e4159c" valign="top" align="center">
                                                            <a class="pc-fb-font" href="${pLink}" style="line-height: 24px; text-decoration: none; word-break: break-word; font-weight: 500; display: block; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff;">Shop now</a>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                  <!--[if (gte mso 9)|(IE)]></td><![endif]-->
            `
                    }


                    if (index % 2 === 0) {
                        product_columns += `<!--[if (gte mso 9)|(IE)]><td width="50%" valign="top"><![endif]-->`
                        product_columns += `
            <div class="pc-sm-mw-50pc pc-xs-mw-100pc" style="display: inline-block; width: 100%; max-width: 280px; vertical-align: top;">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                                      <tbody>
                                        <tr>
                                          <td style="padding: 20px;" valign="top">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                                              <tbody>
                                                <tr>
                                                  <td valign="top">
                                                    <img class="pc-xs-m-0-auto" src="${pImage}" width="230" height="240" alt="" style="border: 0; line-height: 100%; outline: 0; -ms-interpolation-mode: bicubic; color: #151515; max-width: 100%; height: auto; display: block;">
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td height="16" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                                                </tr>
                                              </tbody>
                                              <tbody>
                                                <tr>
                                                  <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 700; line-height: 34px; letter-spacing: -0.3px; color: #151515;" valign="top">
                                                    ${pName}
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td height="4" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                                                </tr>
                                              </tbody>
                                              <tbody>
                                                <tr>
                                                  <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 500; color: #9B9B9B;" valign="top"></td>
                                                </tr>
                                                <tr>
                                                  <td height="17" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                                                </tr>
                                              </tbody>
                                              <tbody>
                                                <tr>
                                                  <td valign="top">
                                                    <table class="pc-xs-m-0-auto" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                                      <tbody>
                                                        <tr>
                                                          <td style="padding: 13px 17px; border-radius: 8px; background-color: #e4159c" bgcolor="#e4159c" valign="top" align="center">
                                                            <a class="pc-fb-font" href="${pLink}" style="line-height: 24px; text-decoration: none; word-break: break-word; font-weight: 500; display: block; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff;">Shop now</a>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
            `
                        product_columns += `<!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]-->`
                        product_columns += '</td>'
                        product_columns += '</tr>'
                    }

                    len = len + 1
                    index = index + 1

                    if (len === resultPro.length) {
                        if (index % 2 === 1) {
                            product_columns += `<!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]-->`
                            product_columns += '</td>'
                            product_columns += '</tr>'
                        }
                    }

                })

                product_columns = "wait a min..."

                const user_name = user['firstname']

                const textMessage = `Hi ${user_name}, <br><br>You have an upcoming event <b>"${evName}"</b> ${(dayDiff === 3 || dayDiff === 1) ? `in ${dayDiff} day(s) time` : `happening today`}. <br><br>Below are suggested gift baskets you can send to ${(gender.toLowerCase() === 'male') ? 'him' : 'her'}.<br><br>Don't just gift it, TAC it!`

                const emailBody = new Email().getSocialTreeReminderHTMLBody(textMessage, image, name, relationship, evName, product_columns)

                const url = `https://avidprintsconcierge.com/emailsending/socialtree.php?sender_email=${user_email}&sender_name=${user_name}`

                // console.log(`emailBody = ${product_columns}`)
                const fd1 = new FormData()
                fd1.append("body", emailBody)
                const h = {
                    "Access-Control-Allow-Origin": "*",
                    'Content-Type': 'application/x-www-form-urlencoded',
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
                    "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers",
                }
                // const promise = axios.default.post(url, fd1, { headers: fd1.getHeaders() })
                mHttp.post(url, { body: { 'body': emailBody }, form: { 'body': emailBody }, formData: { 'body': emailBody }, headers: h }).on('data', (dt) => {
                    console.log(dt.toString())
                }).on('error', (err) => {
                    console.log(`http error: ${err.message} | ${err.name} | ${err.stack}`)
                }).on('complete', (com) => {
                    console.log(`com: ${com.toJSON()}`)
                })
                //_promises.push(promise)
            }
        }
    })
    if (ahead_query !== null) {
        firebase_query_data[1].forEach(async query => {
            const tree = query.data()
            // const d = `${tree['event_date']}`.split('-')
            const _current_date = new Date()
            const tree_event_date = new Date(_current_date.getFullYear(), Number(tree['event_month']), Number(tree['event_day']))
            const diff = tree_event_date.getTime() - _current_date.getTime()
            const one_day = 1000 * 60 * 60 * 24;
            // const dateDiff = new Date(diff)
            const dayDiff = Math.round(diff / one_day);
            // console.log(`difference in days ahead = ${dayDiff}`)

            if (dayDiff === 3 || dayDiff === 1 || dayDiff === 0) {
                //upcoming birthday
                const evName = `${tree['event_name']}`.toLowerCase() //.split(' ')
                const user_email = tree['user_id']
                const socialTreeID = tree['social_tree_id']
                const getSocialTreeData = await db.collection('social-tree').doc(socialTreeID).get()
                const getUserData = await db.collection('users').doc(user_email).get()
                const user = getUserData.data()
                const st = getSocialTreeData.data()
                if (st !== undefined && user !== undefined) {
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
                    // console.log(`category found 3 === ${searched_cat_id}`)

                    if (searched_cat_id === '') {
                        subCategories.forEach(q => {
                            const sc = q.data()
                            const sc_meta = `${sc['meta']}`.toLowerCase().split(',')
                            if (sc_meta.includes(gender)) {
                                searched_cat_id = sc['id']
                            }
                        })
                    }
                    // console.log(`category found 4 === ${searched_cat_id}`)

                    const resultPro: FirebaseFirestore.DocumentData[] = []
                    products.forEach(q => {
                        const pro = q.data()
                        const cat = `${pro['category']}`.split(',')
                        if (cat.includes(searched_cat_id)) {
                            resultPro.push(pro)
                        }
                    })

                    var index = 3, len = 0
                    var product_columns = ''

                    resultPro.forEach(p => {
                        const pName = p['name']
                        const img = p['pictures']
                        const pImage = img[0]
                        const pLink = `https://tacgifts.com/home/product/${p['menu_link']}`

                        if (index % 2 === 1) {
                            product_columns += '<tr>'
                            product_columns += `
              <td class="pc-xs-ta-center" style="font-size: 0;" valign="top">
              <!--[if (gte mso 9)|(IE)]><table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation"><tr><td width="50%" valign="top"><![endif]-->
              `
                            product_columns += `
              <div class="pc-sm-mw-50pc pc-xs-mw-100pc" style="display: inline-block; width: 100%; max-width: 280px; vertical-align: top;">
                                      <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                                        <tbody>
                                          <tr>
                                            <td style="padding: 20px;" valign="top">
                                              <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                                                <tbody>
                                                  <tr>
                                                    <td valign="top">
                                                      <img class="pc-xs-m-0-auto" src="${pImage}" width="230" height="240" alt="" style="border: 0; line-height: 100%; outline: 0; -ms-interpolation-mode: bicubic; color: #151515; max-width: 100%; height: auto; display: block;">
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td height="16" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                                                  </tr>
                                                </tbody>
                                                <tbody>
                                                  <tr>
                                                    <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 700; line-height: 34px; letter-spacing: -0.3px; color: #151515;" valign="top">
                                                      ${pName}
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td height="4" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                                                  </tr>
                                                </tbody>
                                                <tbody>
                                                  <tr>
                                                    <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 500; color: #9B9B9B;" valign="top"></td>
                                                  </tr>
                                                  <tr>
                                                    <td height="17" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                                                  </tr>
                                                </tbody>
                                                <tbody>
                                                  <tr>
                                                    <td valign="top">
                                                      <table class="pc-xs-m-0-auto" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                                        <tbody>
                                                          <tr>
                                                            <td style="padding: 13px 17px; border-radius: 8px; background-color: #e4159c" bgcolor="#e4159c" valign="top" align="center">
                                                              <a class="pc-fb-font" href="${pLink}" style="line-height: 24px; text-decoration: none; word-break: break-word; font-weight: 500; display: block; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff;">Shop now</a>
                                                            </td>
                                                          </tr>
                                                        </tbody>
                                                      </table>
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                    <!--[if (gte mso 9)|(IE)]></td><![endif]-->
              `
                        }


                        if (index % 2 === 0) {
                            product_columns += `<!--[if (gte mso 9)|(IE)]><td width="50%" valign="top"><![endif]-->`
                            product_columns += `
              <div class="pc-sm-mw-50pc pc-xs-mw-100pc" style="display: inline-block; width: 100%; max-width: 280px; vertical-align: top;">
                                      <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                                        <tbody>
                                          <tr>
                                            <td style="padding: 20px;" valign="top">
                                              <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                                                <tbody>
                                                  <tr>
                                                    <td valign="top">
                                                      <img class="pc-xs-m-0-auto" src="${pImage}" width="230" height="240" alt="" style="border: 0; line-height: 100%; outline: 0; -ms-interpolation-mode: bicubic; color: #151515; max-width: 100%; height: auto; display: block;">
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td height="16" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                                                  </tr>
                                                </tbody>
                                                <tbody>
                                                  <tr>
                                                    <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 700; line-height: 34px; letter-spacing: -0.3px; color: #151515;" valign="top">
                                                      ${pName}
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td height="4" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                                                  </tr>
                                                </tbody>
                                                <tbody>
                                                  <tr>
                                                    <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 500; color: #9B9B9B;" valign="top"></td>
                                                  </tr>
                                                  <tr>
                                                    <td height="17" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                                                  </tr>
                                                </tbody>
                                                <tbody>
                                                  <tr>
                                                    <td valign="top">
                                                      <table class="pc-xs-m-0-auto" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                                        <tbody>
                                                          <tr>
                                                            <td style="padding: 13px 17px; border-radius: 8px; background-color: #e4159c" bgcolor="#e4159c" valign="top" align="center">
                                                              <a class="pc-fb-font" href="${pLink}" style="line-height: 24px; text-decoration: none; word-break: break-word; font-weight: 500; display: block; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff;">Shop now</a>
                                                            </td>
                                                          </tr>
                                                        </tbody>
                                                      </table>
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
              `
                            product_columns += `<!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]-->`
                            product_columns += '</td>'
                            product_columns += '</tr>'
                        }

                        len = len + 1
                        index = index + 1

                        if (len === resultPro.length) {
                            if (index % 2 === 1) {
                                product_columns += `<!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]-->`
                                product_columns += '</td>'
                                product_columns += '</tr>'
                            }
                        }

                    })

                    const user_name = user['firstname']

                    const textMessage = `Hi ${user_name}, <br><br>You have an upcoming event <b>"${evName}"</b> ${(dayDiff === 3 || dayDiff === 1) ? `in ${dayDiff} day(s) time` : `happening today`}. <br><br>Below are suggested gift baskets you can send to ${(gender.toLowerCase() === 'male') ? 'him' : 'her'}.<br><br>Don't just gift it, TAC it!`

                    const emailBody = new Email().getSocialTreeReminderHTMLBody(textMessage, image, name, relationship, evName, product_columns)

                    const url = `https://avidprintsconcierge.com/emailsending/socialtree.php?sender_email=${user_email}&sender_name=${user_name}`

                    const fd = new FormData()
                    fd.append("body", emailBody)
                    // const h = {
                    //   "Access-Control-Allow-Origin": "*",
                    //   "Access-Control-Allow-Credentials": "true",
                    //   "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
                    //   "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
                    // }
                    // const promise = axios.default.post(url, fd, { headers: fd.getHeaders() })
                    const promise = mHttp.post(url, { body: { 'body': emailBody }, form: { 'body': emailBody }, headers: fd.getHeaders() })
                    _promises.push(promise)


                }
            }
        })
    }
    // console.log(`i dey here now`)//axios.default
    // return Promise.all(_promises).then((result) => {
    //   result.forEach(res => {
    //     console.log(res)
    //   })
    // }).catch(err => {
    //   console.log(err)
    //   // console.log(err.message)
    //   // console.log(JSON.stringify(err))
    // })
    // } catch (err) {
    //   console.log(`tayo: ${err}`)
    // }
})

export const remindUnpaidCustomers = functions.pubsub.schedule('01 12 * * *').onRun(async (context) => {

    const unpaid_customers = await admin.firestore().collection('orders').where('payment_status', "==", 'unpaid').where('status', "==", 'pending').get()

    if (unpaid_customers.docs.length > 0) {

        const promises: any[] = []

        unpaid_customers.forEach(cus => {

            const order = cus.data()

            const orderId = order['transaction_id']
            const customer_name = `${order.shipping_details['firstname']}`
            const receiver_name = `${order.shipping_details['fullname']}`
            const retry_url = order['retry_url']
            const curr = (order['currency_used'] === '₦') ? 'NGN' : order['currency_used']
            const exchangeR = order['conversion_rate']
            const total_amount = formatter(curr, order['total_amount'])
            const created_date = order['created_date']
            const email = order['email']
            const track_id = order['track_id']
            const cart: any[] = order['carts']
            const shipFee = formatter(curr, 0.00)

            var email_body_product = ''
            cart.forEach(c => {
                const p = c['product']
                const q = c['quantity']

                const pName = p['name']
                const pPrice = formatter(curr, (p['price'] / exchangeR)) //format currency
                //const pTotalPrice = formatter(curr, ((p['price'] / exchangeR) * q)) //format currency

                const image = p['pictures']

                email_body_product += `
                <tr>
                    <td style="padding: 20px 10px 20px 0; letter-spacing: -0.2px; line-height: 26px; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 16px; border-bottom: 1px solid #E5E5E5;" valign="top">
                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tbody>
                            <tr>
                            <td valign="top" style="font-size: 0;">
                                <!--[if (gte mso 9)|(IE)]><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="400"><tr><td width="120" valign="top"><![endif]-->
                                <div style="display: inline-block; max-width: 120px; vertical-align: top;">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                    <tbody>
                                    <tr>
                                        <td style="padding: 0 20px 0 0;" valign="top">
                                        <img class="pc-fb-font" src="${image[0]}" width="100" alt="" style="border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; display: block;">
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                                </div>
                                <!--[if (gte mso 9)|(IE)]></td><td width="280" valign="top"><![endif]-->
                                <div style="display: inline-block; max-width: 280px; vertical-align: top;">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                    <tbody>
                                    <tr>
                                        <td style="padding: 9px 0 0;" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                            <tbody>
                                            <tr>
                                                <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; letter-spacing: -0.3px; line-height: 28px; font-weight: 500; font-size: 18px; color: #151515;" valign="top">
                                                ${pName}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td height="4" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                                            </tr>
                                            </tbody>
                                            <tbody>
                                            <tr>
                                                <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; letter-spacing: -0.2px; line-height: 24px; font-size: 16px; color: #9B9B9B;" valign="top">
                                                
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                                </div>
                                <!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]-->
                            </td>
                            </tr>
                        </tbody>
                        </table>
                    </td>
                    <td class="pc-fb-font" style="padding: 29px 10px 20px 0; color: #9B9B9B; letter-spacing: -0.2px; line-height: 26px; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 16px; border-bottom: 1px solid #E5E5E5;" valign="top" align="right">
                        ${q}
                    </td>
                    <td class="pc-fb-font" style="padding: 29px 0 20px; letter-spacing: -0.2px; line-height: 26px; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 16px; border-bottom: 1px solid #E5E5E5; color: #151515;" valign="top" align="right">
                        ${pPrice}
                    </td>
                </tr>
                `
            })

            const email_body = new Email().getUnpaidCustomerHTMLBody(orderId, track_id, created_date, receiver_name, customer_name, retry_url, total_amount, shipFee, email_body_product)
            const fullname = `${order.shipping_details['firstname']} ${order.shipping_details['lastname']}`
            const url = `https://avidprintsconcierge.com/emailsending/unpaidcustomers.php?sender_email=${email}&sender_name=${fullname}`

            const fd = new FormData()
            fd.append("body", email_body)
            const promise = axios.default.post(url, fd, { headers: fd.getHeaders() })
            promises.push(promise)
        })

        return axios.default.all(promises).then((result) => {
            result.forEach(res => {
                console.log(res)
            })
        }).catch(err => {
            console.log(err)
        })
    }
})

function formatter(curr: any, val: any) {
    const f = new Intl.NumberFormat('en-US', {
        currency: curr,
        minimumFractionDigits: 2,
        style: 'currency',
    })
    return f.format(val)
}

// export const scheduledFirestoreExport = functions.pubsub
//     .schedule('01 12 * * *')
//     .onRun((context) => {


//         const client = new firestore.v1.FirestoreAdminClient();
//         const bucket = 'gs://taconlinegiftshop-database-backups';
//         const databaseName =
//             client.databasePath(process.env.GCP_PROJECT, '(default)');

//         return client.exportDocuments({
//             name: databaseName,
//             outputUriPrefix: bucket,
//             // Leave collectionIds empty to export all collections
//             // or set to a list of collection IDs to export,
//             // collectionIds: ['users', 'posts']
//             collectionIds: []
//         })
//             .then((responses: any[]) => {
//                 const response = responses[0];
//                 console.log(`Operation Name: ${response['name']}`);
//                 return response;
//             })
//             .catch((err: any) => {
//                 console.error(err);
//                 // throw new Error('Export operation failed');
//             });
//     });


class Email {

    getSocialTreeReminderHTMLBody(text_message: string, profile_image: string, username: string, userRelationship: string, eventName: string, product_columns: string) {
        return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="format-detection" content="telephone=no">
  <meta name="x-apple-disable-message-reformatting">
  <title></title>
  <style type="text/css">
    @media screen {
      @font-face {
        font-family: 'Fira Sans';
        font-style: normal;
        font-weight: 400;
        src: local('Fira Sans Regular'), local('FiraSans-Regular'), url(https://fonts.gstatic.com/s/firasans/v8/va9E4kDNxMZdWfMOD5Vvl4jLazX3dA.woff2) format('woff2');
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
      }
      @font-face {
        font-family: 'Fira Sans';
        font-style: normal;
        font-weight: 400;
        src: local('Fira Sans Regular'), local('FiraSans-Regular'), url(https://fonts.gstatic.com/s/firasans/v8/va9E4kDNxMZdWfMOD5Vvk4jLazX3dGTP.woff2) format('woff2');
        unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
      }
      @font-face {
        font-family: 'Fira Sans';
        font-style: normal;
        font-weight: 500;
        src: local('Fira Sans Medium'), local('FiraSans-Medium'), url(https://fonts.gstatic.com/s/firasans/v8/va9B4kDNxMZdWfMOD5VnZKveRhf6Xl7Glw.woff2) format('woff2');
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
      }
      @font-face {
        font-family: 'Fira Sans';
        font-style: normal;
        font-weight: 500;
        src: local('Fira Sans Medium'), local('FiraSans-Medium'), url(https://fonts.gstatic.com/s/firasans/v8/va9B4kDNxMZdWfMOD5VnZKveQhf6Xl7Gl3LX.woff2) format('woff2');
        unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
      }
      @font-face {
        font-family: 'Fira Sans';
        font-style: normal;
        font-weight: 700;
        src: local('Fira Sans Bold'), local('FiraSans-Bold'), url(https://fonts.gstatic.com/s/firasans/v8/va9B4kDNxMZdWfMOD5VnLK3eRhf6Xl7Glw.woff2) format('woff2');
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
      }
      @font-face {
        font-family: 'Fira Sans';
        font-style: normal;
        font-weight: 700;
        src: local('Fira Sans Bold'), local('FiraSans-Bold'), url(https://fonts.gstatic.com/s/firasans/v8/va9B4kDNxMZdWfMOD5VnLK3eQhf6Xl7Gl3LX.woff2) format('woff2');
        unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
      }
      @font-face {
        font-family: 'Fira Sans';
        font-style: normal;
        font-weight: 800;
        src: local('Fira Sans ExtraBold'), local('FiraSans-ExtraBold'), url(https://fonts.gstatic.com/s/firasans/v8/va9B4kDNxMZdWfMOD5VnMK7eRhf6Xl7Glw.woff2) format('woff2');
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
      }
      @font-face {
        font-family: 'Fira Sans';
        font-style: normal;
        font-weight: 800;
        src: local('Fira Sans ExtraBold'), local('FiraSans-ExtraBold'), url(https://fonts.gstatic.com/s/firasans/v8/va9B4kDNxMZdWfMOD5VnMK7eQhf6Xl7Gl3LX.woff2) format('woff2');
        unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
      }
    }

    #outlook a {
      padding: 0;
    }

    .ReadMsgBody,
    .ExternalClass {
      width: 100%;
    }

    .ExternalClass,
    .ExternalClass p,
    .ExternalClass td,
    .ExternalClass div,
    .ExternalClass span,
    .ExternalClass font {
      line-height: 100%;
    }

    div[style*="margin: 14px 0"],
    div[style*="margin: 16px 0"] {
      margin: 0 !important;
    }

    table,
    td {
      mso-table-lspace: 0;
      mso-table-rspace: 0;
    }

    table,
    tr,
    td {
      border-collapse: collapse;
    }

    body,
    td,
    th,
    p,
    div,
    li,
    a,
    span {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      mso-line-height-rule: exactly;
    }

    img {
      border: 0;
      outline: none;
      line-height: 100%;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }

    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
    }

    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      -webkit-font-smoothing: antialiased;
    }

    .pc-gmail-fix {
      display: none;
      display: none !important;
    }

    @media screen and (min-width: 621px) {
      .pc-email-container {
        width: 620px !important;
      }
    }

    @media screen and (max-width:620px) {
      .pc-sm-p-30 {
        padding: 30px !important
      }
      .pc-sm-p-18-30 {
        padding: 18px 30px !important
      }
      .pc-sm-p-35-30 {
        padding: 35px 30px !important
      }
      .pc-sm-p-30-10-20 {
        padding: 30px 10px 20px !important
      }
      .pc-sm-mw-100pc {
        max-width: 100% !important
      }
      .pc-sm-mw-50pc {
        max-width: 50% !important
      }
      .pc-sm-p-21-10-14 {
        padding: 21px 10px 14px !important
      }
      .pc-sm-h-20 {
        height: 20px !important
      }
    }

    @media screen and (max-width:525px) {
      .pc-xs-p-0 {
        padding: 0 !important
      }
      .pc-xs-p-25-20 {
        padding: 25px 20px !important
      }
      .pc-xs-p-18-20 {
        padding: 18px 20px !important
      }
      .pc-xs-br-disabled br {
        display: none !important
      }
      .pc-xs-p-15-0-25 {
        padding: 15px 0 25px !important
      }
      .pc-xs-mw-100pc {
        max-width: 100% !important
      }
      .pc-xs-m-0-auto {
        float: none !important;
        margin: 0 auto !important
      }
      .pc-xs-ta-center {
        text-align: center !important
      }
      .pc-xs-p-5-0 {
        padding: 5px 0 !important
      }
    }
  </style>
  <!--[if mso]>
    <style type="text/css">
        .pc-fb-font {
            font-family: Helvetica, Arial, sans-serif !important;
        }
    </style>
    <![endif]-->
  <!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
</head>
<body style="width: 100% !important; margin: 0; padding: 0; mso-line-height-rule: exactly; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #f4f4f4" class="">
  <span style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">You have an upcoming event</span>
  <table class="pc-email-body" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="table-layout: fixed;">
    <tbody>
      <tr>
        <td class="pc-email-body-inner" align="center" valign="top">
          <!--[if gte mso 9]>
            <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
                <v:fill type="tile" src="" color="#f4f4f4"/>
            </v:background>
            <![endif]-->
          <!--[if (gte mso 9)|(IE)]><table width="620" align="center" border="0" cellspacing="0" cellpadding="0" role="presentation"><tr><td width="620" align="center" valign="top"><![endif]-->
          <table class="pc-email-container" width="100%" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto; max-width: 620px;">
            <tbody>
              <tr>
                <td align="left" valign="top" style="padding: 0 10px;">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tbody>
                      <tr>
                        <td height="20" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                  <!-- BEGIN MODULE: Menu 9 -->
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tbody>
                      <tr>
                        <td valign="top" bgcolor="#ffffff" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1)">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tbody>
                              <tr>
                                <td class="pc-sm-p-30 pc-xs-p-25-20" align="center" valign="top" style="padding: 30px 40px;">
                                  <a href="https://tacgifts.com/home" style="text-decoration: none;"><img src="https://tacgifts.com/assets/images/icon/logo.png" width="130" height="" alt="logo" style="max-width: 100%; height: auto; border: 0; line-height: 100%; outline: 0; -ms-interpolation-mode: bicubic; color: #1B1B1B;"></a>
                                </td>
                              </tr>
                              <tr>
                                <td height="1" valign="top" bgcolor="#dedede" style="background-color: rgba(0, 0, 0, 0.1); font-size: 1px; line-height: 1px;">&nbsp;</td>
                              </tr>
                            </tbody>
                            <tbody>
                              <tr>
                                <td class="pc-sm-p-18-30 pc-xs-p-18-20 pc-fb-font" valign="top" style="padding: 18px 40px; text-align: center; line-height: 20px; font-family: Helvetica, sans-serif; font-size: 14px;">
                                  <a href="https://tacgifts.com/collections/anniversary" style="text-decoration: none; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 500; color: #1B1B1B">Anniversary</a>
                                  <span class="pc-xs-p-0" style="padding: 0 23px;">&nbsp;&nbsp;</span>
                                  <a href="https://tacgifts.com/collections/birthday" style="text-decoration: none; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 500; color: #1B1B1B">Birthday</a>
                                  <span class="pc-xs-p-0" style="padding: 0 23px;">&nbsp;&nbsp;</span>
                                  <a href="https://tacgifts.com/collections/corporate" style="text-decoration: none; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 500; color: #1B1B1B">Corporate</a>
                                  <span class="pc-xs-p-0" style="padding: 0 23px;">&nbsp;&nbsp;</span>
                                  <a href="https://tacgifts.com/collections/specials" style="text-decoration: none; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 500; color: #1B1B1B">Specials</a>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <!-- END MODULE: Menu 9 -->
                  <!-- BEGIN MODULE: Content 15 -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                    <tbody>
                      <tr>
                        <td height="8" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                    <tbody>
                      <tr>
                        <td class="pc-sm-p-35-30 pc-xs-p-25-20" style="padding: 40px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1)" valign="top" bgcolor="#ffffff">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                            <tbody>
                              <tr>
                                <td class="pc-fb-font" colspan="2" style="line-height: 28px; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 300; letter-spacing: -0.2px; color: #0f0e0e" valign="top">
                                  ${text_message}
                                </td>
                              </tr>
                              <tr>
                                <td colspan="2" height="22" style="line-height: 1px; font-size: 1px;">&nbsp;</td>
                              </tr>
                            </tbody>
                            <tbody>
                              <tr>
                                <td width="8%" valign="middle" style="padding-right: 10px;">
                                  <table border="0" cellpadding="0" cellspacing="0" width="40" role="presentation">
                                    <tbody>
                                      <tr>
                                        <td valign="top">
                                          <img src="${profile_image}" width="40" alt="" style="max-width: 100%; height: auto; border: 0; text-decoration: none; line-height: 100%; outline: 0; -ms-interpolation-mode: bicubic; display: block;">
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                                <td valign="middle" width="92%">
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                                    <tbody>
                                      <tr>
                                        <td class="pc-fb-font" valign="top" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 500; line-height: 21px; letter-spacing: -0.1px; color: #1B1B1B;">
                                          ${username}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td class="pc-fb-font" valign="top" style="padding-top: 1px; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 300; line-height: 20px; letter-spacing: -0.2px; color: #0f0e0e">
                                          ${userRelationship}.
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <!-- END MODULE: Content 15 -->
                  <!-- BEGIN MODULE: E-Commerce 5 -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                    <tbody>
                      <tr>
                        <td height="8" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                    <tbody>
                      <tr>
                        <td class="pc-sm-p-30-10-20 pc-xs-p-15-0-25" style="padding: 30px 20px 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1)" valign="top" bgcolor="#ffffff">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                            <tbody>
                              <tr>
                                <td class="pc-fb-font" valign="top" style="padding: 10px 20px; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 700; line-height: 34px; letter-spacing: -0.4px; color: #151515;">Suggested Products For Your Event<br><small style="color: #e4159c;">${eventName}</small></td>
                              </tr>
                            </tbody>
                            <tbody>
                            ${product_columns}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <!-- END MODULE: E-Commerce 5 -->
                  <!-- BEGIN MODULE: Footer 1 -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                    <tbody>
                      <tr>
                        <td height="8" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                    <tbody>
                      <tr>
                        <td class="pc-sm-p-21-10-14 pc-xs-p-5-0" style="padding: 21px 20px 14px 20px; background-color: #1B1B1B; border-radius: 8px; box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1)" valign="top" bgcolor="#1B1B1B" role="presentation">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                            <tbody>
                              <tr>
                                <td style="font-size: 0;" valign="top">
                                  <!--[if (gte mso 9)|(IE)]><table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation"><tr><td width="280" valign="top"><![endif]-->
                                  <div class="pc-sm-mw-100pc" style="display: inline-block; width: 100%; max-width: 280px; vertical-align: top;">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                                      <tbody>
                                        <tr>
                                          <td style="padding: 20px;" valign="top">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                                              <tbody>
                                                <tr>
                                                  <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 500; line-height: 24px; letter-spacing: -0.2px; color: #ffffff" valign="top">
                                                    Follow Us.
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td height="11" style="line-height: 1px; font-size: 1px;">&nbsp;</td>
                                                </tr>
                                              </tbody>
                                              <tbody>
                                                <tr>
                                                  <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; letter-spacing: -0.2px; color: #D8D8D8" valign="top">We are always looking for new exciting gifts and seasons. Feel free to contact us.</td>
                                                </tr>
                                                <tr>
                                                  <td class="pc-sm-h-20" height="56" style="line-height: 1px; font-size: 1px;">&nbsp;</td>
                                                </tr>
                                              </tbody>
                                              <tbody>
                                                <tr>
                                                <td style="font-family: Arial, sans-serif; font-size: 19px;" valign="top">
                                                <a href="https://www.facebook.com/103910277678861" style="text-decoration: none;"><img src="https://firebasestorage.googleapis.com/v0/b/taconlinegiftshop.appspot.com/o/icons%2Ffacebook-dark-gray.png?alt=media&token=2672f4da-4ecc-42dd-9c52-468cd529330e" width="20" height="20" alt="" style="border: 0; line-height: 100%; outline: 0; -ms-interpolation-mode: bicubic; color: #ffffff;"></a>
                                                <span>&nbsp;&nbsp;</span>
                                                <a href="https://twitter.com/tacgifts" style="text-decoration: none;"><img src="https://firebasestorage.googleapis.com/v0/b/taconlinegiftshop.appspot.com/o/icons%2Ftwitter-dark-gray.png?alt=media&token=a19ded28-f03e-4c73-91ff-2afacc40d610" width="21" height="18" alt="" style="border: 0; line-height: 100%; outline: 0; -ms-interpolation-mode: bicubic; color: #ffffff;"></a>
                                                <span>&nbsp;&nbsp;</span>
                                                <a href="https://instagram.com/tacgifts" style="text-decoration: none;"><img src="https://firebasestorage.googleapis.com/v0/b/taconlinegiftshop.appspot.com/o/icons%2Finstagram-dark-gray.png?alt=media&token=8f50cbf6-8640-442e-84b9-0c9d44f2eae3" width="21" height="20" alt="" style="border: 0; line-height: 100%; outline: 0; -ms-interpolation-mode: bicubic; color: #ffffff;"></a>
                                              </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                  <!--[if (gte mso 9)|(IE)]></td><td width="280" valign="top"><![endif]-->
                                  <div class="pc-sm-mw-100pc" style="display: inline-block; width: 100%; max-width: 280px; vertical-align: top;">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                                      <tbody>
                                        <tr>
                                          <td style="padding: 20px;" valign="top">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                                              <tbody>
                                                <tr>
                                                  <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 500; line-height: 24px; letter-spacing: -0.2px; color: #ffffff" valign="top">
                                                    Contact us.
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td height="11" style="line-height: 1px; font-size: 1px;">&nbsp;</td>
                                                </tr>
                                              </tbody>
                                              <tbody>
                                                <tr>
                                                  <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; letter-spacing: -0.2px; color: #D8D8D8" valign="top">47 Oshowole Close, Allen Avenue, Ikeja, Lagos, Nigeria.</td>
                                                </tr>
                                                <tr>
                                                  <td class="pc-sm-h-20" height="45" style="line-height: 1px; font-size: 1px;">&nbsp;</td>
                                                </tr>
                                              </tbody>
                                              <tbody>
                                                <tr>
                                                  <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 500; line-height: 24px; letter-spacing: -0.2px" valign="top">
                                                    <a href="tel:+234 706 - 711 - 7723" style="text-decoration: none; color: #ffffff;">+234 706 - 711 - 7723</a>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td height="9" style="line-height: 1px; font-size: 1px;">&nbsp;</td>
                                                </tr>
                                              </tbody>
                                              <tbody>
                                                <tr>
                                                  <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 500; line-height: 24px" valign="top">
                                                    <a href="mailto:support@tacgifts.com" style="text-decoration: none; color: #1595E7;">support@tacgifts.com</a>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                  <!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]-->
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <!-- END MODULE: Footer 1 -->
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tbody>
                      <tr>
                        <td height="20" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
          <!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]-->
        </td>
      </tr>
    </tbody>
  </table>
  <!-- Fix for Gmail on iOS -->
  <div class="pc-gmail-fix" style="white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </div>
</body>
</html>
    `
    }

    getUnpaidCustomerHTMLBody(orderId: any, trackID: any, created_date: any, receiver_name: any, name: any, retry_url: any, totalAmt: any, shippingFee: any, products: any) {
        return `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="format-detection" content="telephone=no">
  <meta name="x-apple-disable-message-reformatting">
  <title></title>
  <style type="text/css">
    @media screen {
      @font-face {
        font-family: 'Fira Sans';
        font-style: normal;
        font-weight: 400;
        src: local('Fira Sans Regular'), local('FiraSans-Regular'), url(https://fonts.gstatic.com/s/firasans/v8/va9E4kDNxMZdWfMOD5Vvl4jLazX3dA.woff2) format('woff2');
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
      }
      @font-face {
        font-family: 'Fira Sans';
        font-style: normal;
        font-weight: 400;
        src: local('Fira Sans Regular'), local('FiraSans-Regular'), url(https://fonts.gstatic.com/s/firasans/v8/va9E4kDNxMZdWfMOD5Vvk4jLazX3dGTP.woff2) format('woff2');
        unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
      }
      @font-face {
        font-family: 'Fira Sans';
        font-style: normal;
        font-weight: 500;
        src: local('Fira Sans Medium'), local('FiraSans-Medium'), url(https://fonts.gstatic.com/s/firasans/v8/va9B4kDNxMZdWfMOD5VnZKveRhf6Xl7Glw.woff2) format('woff2');
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
      }
      @font-face {
        font-family: 'Fira Sans';
        font-style: normal;
        font-weight: 500;
        src: local('Fira Sans Medium'), local('FiraSans-Medium'), url(https://fonts.gstatic.com/s/firasans/v8/va9B4kDNxMZdWfMOD5VnZKveQhf6Xl7Gl3LX.woff2) format('woff2');
        unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
      }
      @font-face {
        font-family: 'Fira Sans';
        font-style: normal;
        font-weight: 700;
        src: local('Fira Sans Bold'), local('FiraSans-Bold'), url(https://fonts.gstatic.com/s/firasans/v8/va9B4kDNxMZdWfMOD5VnLK3eRhf6Xl7Glw.woff2) format('woff2');
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
      }
      @font-face {
        font-family: 'Fira Sans';
        font-style: normal;
        font-weight: 700;
        src: local('Fira Sans Bold'), local('FiraSans-Bold'), url(https://fonts.gstatic.com/s/firasans/v8/va9B4kDNxMZdWfMOD5VnLK3eQhf6Xl7Gl3LX.woff2) format('woff2');
        unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
      }
      @font-face {
        font-family: 'Fira Sans';
        font-style: normal;
        font-weight: 800;
        src: local('Fira Sans ExtraBold'), local('FiraSans-ExtraBold'), url(https://fonts.gstatic.com/s/firasans/v8/va9B4kDNxMZdWfMOD5VnMK7eRhf6Xl7Glw.woff2) format('woff2');
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
      }
      @font-face {
        font-family: 'Fira Sans';
        font-style: normal;
        font-weight: 800;
        src: local('Fira Sans ExtraBold'), local('FiraSans-ExtraBold'), url(https://fonts.gstatic.com/s/firasans/v8/va9B4kDNxMZdWfMOD5VnMK7eQhf6Xl7Gl3LX.woff2) format('woff2');
        unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
      }
    }

    #outlook a {
      padding: 0;
    }

    .ReadMsgBody,
    .ExternalClass {
      width: 100%;
    }

    .ExternalClass,
    .ExternalClass p,
    .ExternalClass td,
    .ExternalClass div,
    .ExternalClass span,
    .ExternalClass font {
      line-height: 100%;
    }

    div[style*="margin: 14px 0"],
    div[style*="margin: 16px 0"] {
      margin: 0 !important;
    }

    table,
    td {
      mso-table-lspace: 0;
      mso-table-rspace: 0;
    }

    table,
    tr,
    td {
      border-collapse: collapse;
    }

    body,
    td,
    th,
    p,
    div,
    li,
    a,
    span {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      mso-line-height-rule: exactly;
    }

    img {
      border: 0;
      outline: none;
      line-height: 100%;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }

    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
    }

    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      -webkit-font-smoothing: antialiased;
    }

    .pc-gmail-fix {
      display: none;
      display: none !important;
    }

    @media screen and (min-width: 621px) {
      .pc-email-container {
        width: 620px !important;
      }
    }

    @media screen and (max-width:620px) {
      .pc-sm-p-30 {
        padding: 30px !important
      }
      .pc-sm-p-18-30 {
        padding: 18px 30px !important
      }
      .pc-sm-p-30-20 {
        padding: 30px 20px !important
      }
      .pc-sm-fs-30 {
        font-size: 30px !important
      }
      .pc-sm-fs-20 {
        font-size: 20px !important
      }
      .pc-sm-fs-18 {
        font-size: 18px !important
      }
      .pc-sm-p-21-10-14 {
        padding: 21px 10px 14px !important
      }
      .pc-sm-h-20 {
        height: 20px !important
      }
      .pc-sm-mw-100pc {
        max-width: 100% !important
      }
    }

    @media screen and (max-width:525px) {
      .pc-xs-p-0 {
        padding: 0 !important
      }
      .pc-xs-p-25-20 {
        padding: 25px 20px !important
      }
      .pc-xs-p-18-20 {
        padding: 18px 20px !important
      }
      .pc-xs-p-25-10 {
        padding: 25px 10px !important
      }
      .pc-xs-fs-16 {
        font-size: 16px !important
      }
      .pc-xs-br-disabled br {
        display: none !important
      }
      .pc-xs-p-5-0 {
        padding: 5px 0 !important
      }
    }
  </style>
  <!--[if mso]>
    <style type="text/css">
        .pc-fb-font {
            font-family: Helvetica, Arial, sans-serif !important;
        }
    </style>
    <![endif]-->
  <!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
</head>
<body style="width: 100% !important; margin: 0; padding: 0; mso-line-height-rule: exactly; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #f4f4f4" class="">
  <span style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">Complete your purchase!</span>
  <table class="pc-email-body" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="table-layout: fixed;">
    <tbody>
      <tr>
        <td class="pc-email-body-inner" align="center" valign="top">
          <!--[if gte mso 9]>
            <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
                <v:fill type="tile" src="" color="#f4f4f4"/>
            </v:background>
            <![endif]-->
          <!--[if (gte mso 9)|(IE)]><table width="620" align="center" border="0" cellspacing="0" cellpadding="0" role="presentation"><tr><td width="620" align="center" valign="top"><![endif]-->
          <table class="pc-email-container" width="100%" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto; max-width: 620px;">
            <tbody>
              <tr>
                <td align="left" valign="top" style="padding: 0 10px;">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tbody>
                      <tr>
                        <td height="20" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                  <!-- BEGIN MODULE: Menu 9 -->
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tbody>
                      <tr>
                        <td valign="top" bgcolor="#ffffff" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1)">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tbody>
                              <tr>
                                <td class="pc-sm-p-30 pc-xs-p-25-20" align="center" valign="top" style="padding: 30px 40px;">
                                  <a href="https://tacgifts.com/home" style="text-decoration: none;"><img src="https://tacgifts.com/assets/images/icon/logo.png" width="130" height="" alt="logo" style="max-width: 100%; height: auto; border: 0; line-height: 100%; outline: 0; -ms-interpolation-mode: bicubic; color: #1B1B1B;"></a>
                                </td>
                              </tr>
                              <tr>
                                <td height="1" valign="top" bgcolor="#dedede" style="background-color: rgba(0, 0, 0, 0.1); font-size: 1px; line-height: 1px;">&nbsp;</td>
                              </tr>
                            </tbody>
                            <tbody>
                              <tr>
                                <td class="pc-sm-p-18-30 pc-xs-p-18-20 pc-fb-font" valign="top" style="padding: 18px 40px; text-align: center; line-height: 20px; font-family: Helvetica, sans-serif; font-size: 14px;">
                                  <a href="https://tacgifts.com/collections/anniversary" style="text-decoration: none; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 500; color: #1B1B1B;">Anniversary</a>
                                  <span class="pc-xs-p-0" style="padding: 0 23px;">&nbsp;&nbsp;</span>
                                  <a href="https://tacgifts.com/collections/birthday" style="text-decoration: none; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 500; color: #1B1B1B;">Birthday</a>
                                  <span class="pc-xs-p-0" style="padding: 0 23px;">&nbsp;&nbsp;</span>
                                  <a href="https://tacgifts.com/collections/corporate" style="text-decoration: none; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 500; color: #1B1B1B;">Corporate</a>
                                  <span class="pc-xs-p-0" style="padding: 0 23px;">&nbsp;&nbsp;</span>
                                  <a href="https://tacgifts.com/collections/specials" style="text-decoration: none; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 500; color: #1B1B1B;">Specials</a>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <!-- END MODULE: Menu 9 -->
                  <!-- BEGIN MODULE: Transactional 13 -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                    <tbody>
                      <tr>
                        <td height="8" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                    <tbody>
                      <tr>
                        <td class="pc-sm-p-30-20 pc-xs-p-25-10" style="padding: 40px 30px; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1)" bgcolor="#ffffff" valign="top">
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                            <tbody>
                              <tr>
                                <td class="pc-fb-font" style="line-height: 20px; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 500; color: #40BE65; padding: 0 10px;" valign="top">
                                  Order #${orderId}<br>
                                  Tracking ID: ${trackID}
                                </td>
                              </tr>
                              <tr>
                                <td style="line-height: 1px; font-size: 1px;" height="15">&nbsp;</td>
                              </tr>
                            </tbody>
                            <tbody>
                              <tr>
                                <td class="pc-sm-fs-30 pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 36px; font-weight: 800; line-height: 46px; letter-spacing: -0.6px; color: #151515; padding: 0 10px;" valign="top">You haven't completed your purchase - ${created_date}.</td>
                              </tr>
                              <tr>
                                <td style="line-height: 1px; font-size: 1px;" height="15">&nbsp;</td>
                              </tr>
                            </tbody>
                            <tbody>
                              <tr>
                                <td class="pc-sm-fs-18 pc-xs-fs-16 pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 20px; line-height: 30px; letter-spacing: -0.2px; color: #9B9B9B; padding: 0 10px;" valign="top">
                                  <p><span style="color: #020202;">Hi ${name},</span></p>
                                  <p style="color: #020202;">We noticed that you've placed an order in your shopping cart to be delivered to <b>${receiver_name}</b>, but you didn't complete the checkout process. Would you like to complete your purchase?</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="line-height: 1px; font-size: 1px;" height="25">&nbsp;</td>
                              </tr>
                            </tbody>
                            <tbody>
                              <tr>
                                <td style="padding: 5px 10px;" valign="top">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation">
                                    <tbody>
                                      <tr>
                                        <td style="border-radius: 8px; padding: 14px 19px; background-color: #e4159c" bgcolor="#e4159c" valign="top" align="center">
                                          <a class="pc-fb-font" href="${retry_url}" style="text-decoration: none; word-break: break-word; line-height: 24px; letter-spacing: -0.2px; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 500; color: #ffffff; display: block;">Complete your purchase</a>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                            <tbody>
                              <tr>
                                <td style="line-height: 1px; font-size: 1px;" height="25">&nbsp;</td>
                              </tr>
                              <tr>
                                <td style="padding: 0 10px;" valign="top">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                    <tbody>
                                      <tr>
                                        <th class="pc-fb-font" style="letter-spacing: -0.2px; line-height: 26px; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 16px; padding: 10px 10px 10px 0; border-bottom: 1px solid #E5E5E5; width: 400px; color: #151515;" align="left">
                                          Item
                                        </th>
                                        <th class="pc-fb-font" style="letter-spacing: -0.2px; line-height: 26px; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 16px; padding: 10px 10px 10px 0; border-bottom: 1px solid #E5E5E5; width: 44px; color: #151515;" align="right">
                                          Qty
                                        </th>
                                        <th class="pc-fb-font" style="letter-spacing: -0.2px; line-height: 26px; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 16px; border-bottom: 1px solid #E5E5E5; padding: 10px 0; width: 56px; color: #151515;" align="right">
                                          Price
                                        </th>
                                      </tr>
                                      <tr>
                                        <td colspan="3" height="0" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                                      </tr>
                                    </tbody>
                                    <tbody>
                                      ${products}
                                    </tbody>
                                    <tbody>
                                      <tr>
                                        <td colspan="3" height="20" style="line-height: 1px; font-size: 1px;">&nbsp;</td>
                                      </tr>
                                    </tbody>
                                    <tbody>
                                      <tr>
                                        <td colspan="2" class="pc-fb-font" style="padding: 0 10px 0 0; letter-spacing: -0.2px; line-height: 26px; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 16px; color: #e4159c" valign="top" align="right">
                                          Subtotal:
                                        </td>
                                        <td class="pc-fb-font" style="padding: 0; letter-spacing: -0.2px; line-height: 26px; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 16px; color: #e4159c" valign="top" align="right">
                                          ${totalAmt}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td colspan="2" class="pc-fb-font" style="padding: 0 10px 0 0; letter-spacing: -0.2px; line-height: 26px; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 16px; color: #151515;" valign="top" align="right">
                                          Shipping:
                                        </td>
                                        <td class="pc-fb-font" style="letter-spacing: -0.2px; line-height: 26px; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 16px; color: #151515;" valign="top" align="right">${shippingFee}</td>
                                      </tr>
                                      <tr>
                                        <td colspan="2" class="pc-fb-font" style="padding: 0 0 20px 0; letter-spacing: -0.2px; line-height: 26px; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 16px; color: #151515;" valign="top" align="right">
                                          Tax:
                                        </td>
                                        <td class="pc-fb-font" style="padding: 0; letter-spacing: -0.2px; line-height: 26px; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 16px; color: #151515;" valign="top" align="right">
                                          Tax Inclusive
                                        </td>
                                      </tr>
                                    </tbody>
                                    <tbody>
                                      <tr>
                                        <td colspan="3" height="20" style="line-height: 1px; font-size: 1px;">&nbsp;</td>
                                      </tr>
                                    </tbody>
                                    <tbody>
                                      <tr>
                                        <td colspan="2" class="pc-fb-font pc-sm-fs-20" style="padding: 20px 10px 0 0; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; letter-spacing: -0.4px; line-height: 34px; font-size: 24px; border-top: 2px solid #E5E5E5; font-weight: bold; color: #151515;" valign="top" align="right">
                                          Total:
                                        </td>
                                        <td class="pc-fb-font pc-sm-fs-20" style="padding: 20px 0 0; font-family: 'Fira Sans', Helvetica, Arial, sans-serif; letter-spacing: -0.4px; line-height: 34px; font-size: 24px; border-top: 2px solid #E5E5E5; font-weight: bold; color: #151515;" valign="top" align="right">
                                          ${totalAmt}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <!-- END MODULE: Transactional 13 -->
                  <!-- BEGIN MODULE: Footer 1 -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                    <tbody>
                      <tr>
                        <td height="8" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                    <tbody>
                      <tr>
                        <td class="pc-sm-p-21-10-14 pc-xs-p-5-0" style="padding: 21px 20px 14px 20px; background-color: #1B1B1B; border-radius: 8px; box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1)" valign="top" bgcolor="#1B1B1B" role="presentation">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                            <tbody>
                              <tr>
                                <td style="font-size: 0;" valign="top">
                                  <!--[if (gte mso 9)|(IE)]><table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation"><tr><td width="280" valign="top"><![endif]-->
                                  <div class="pc-sm-mw-100pc" style="display: inline-block; width: 100%; max-width: 280px; vertical-align: top;">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                                      <tbody>
                                        <tr>
                                          <td style="padding: 20px;" valign="top">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                                              <tbody>
                                                <tr>
                                                  <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 500; line-height: 24px; letter-spacing: -0.2px; color: #ffffff;" valign="top">
                                                    Follow Us.
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td height="11" style="line-height: 1px; font-size: 1px;">&nbsp;</td>
                                                </tr>
                                              </tbody>
                                              <tbody>
                                                <tr>
                                                  <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; letter-spacing: -0.2px; color: #D8D8D8;" valign="top">We are always looking for new exciting gifts and seasons. Feel free to contact us.</td>
                                                </tr>
                                                <tr>
                                                  <td class="pc-sm-h-20" height="56" style="line-height: 1px; font-size: 1px;">&nbsp;</td>
                                                </tr>
                                              </tbody>
                                              <tbody>
                                                <tr>
                                                  <td style="font-family: Arial, sans-serif; font-size: 19px;" valign="top">
                                                    <a href="https://www.facebook.com/103910277678861" style="text-decoration: none;"><img src="https://firebasestorage.googleapis.com/v0/b/taconlinegiftshop.appspot.com/o/icons%2Ffacebook-dark-gray.png?alt=media&token=2672f4da-4ecc-42dd-9c52-468cd529330e" width="20" height="20" alt="" style="border: 0; line-height: 100%; outline: 0; -ms-interpolation-mode: bicubic; color: #ffffff;"></a>
                                                    <span>&nbsp;&nbsp;</span>
                                                    <a href="https://twitter.com/tacgifts" style="text-decoration: none;"><img src="https://firebasestorage.googleapis.com/v0/b/taconlinegiftshop.appspot.com/o/icons%2Ftwitter-dark-gray.png?alt=media&token=a19ded28-f03e-4c73-91ff-2afacc40d610" width="21" height="18" alt="" style="border: 0; line-height: 100%; outline: 0; -ms-interpolation-mode: bicubic; color: #ffffff;"></a>
                                                    <span>&nbsp;&nbsp;</span>
                                                    <a href="https://instagram.com/tacgifts" style="text-decoration: none;"><img src="https://firebasestorage.googleapis.com/v0/b/taconlinegiftshop.appspot.com/o/icons%2Finstagram-dark-gray.png?alt=media&token=8f50cbf6-8640-442e-84b9-0c9d44f2eae3" width="21" height="20" alt="" style="border: 0; line-height: 100%; outline: 0; -ms-interpolation-mode: bicubic; color: #ffffff;"></a>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                  <!--[if (gte mso 9)|(IE)]></td><td width="280" valign="top"><![endif]-->
                                  <div class="pc-sm-mw-100pc" style="display: inline-block; width: 100%; max-width: 280px; vertical-align: top;">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                                      <tbody>
                                        <tr>
                                          <td style="padding: 20px;" valign="top">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                                              <tbody>
                                                <tr>
                                                  <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 500; line-height: 24px; letter-spacing: -0.2px; color: #ffffff;" valign="top">
                                                    Contact us.
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td height="11" style="line-height: 1px; font-size: 1px;">&nbsp;</td>
                                                </tr>
                                              </tbody>
                                              <tbody>
                                                <tr>
                                                  <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; letter-spacing: -0.2px; color: #D8D8D8;" valign="top">47 Oshowole Close, Allen Avenue, Ikeja, Lagos, Nigeria.</td>
                                                </tr>
                                                <tr>
                                                  <td class="pc-sm-h-20" height="45" style="line-height: 1px; font-size: 1px;">&nbsp;</td>
                                                </tr>
                                              </tbody>
                                              <tbody>
                                                <tr>
                                                  <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 500; line-height: 24px; letter-spacing: -0.2px;" valign="top">
                                                    <a href="tel:+234 706 - 711 - 7723" style="text-decoration: none; color: #ffffff;">+234 706 - 711 - 7723</a>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td height="9" style="line-height: 1px; font-size: 1px;">&nbsp;</td>
                                                </tr>
                                              </tbody>
                                              <tbody>
                                                <tr>
                                                  <td class="pc-fb-font" style="font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 500; line-height: 24px;" valign="top">
                                                    <a href="mailto:support@tacgifts.com" style="text-decoration: none; color: #1595E7;">support@tacgifts.com</a>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                  <!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]-->
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <!-- END MODULE: Footer 1 -->
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tbody>
                      <tr>
                        <td height="20" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
          <!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]-->
        </td>
      </tr>
    </tbody>
  </table>
  <!-- Fix for Gmail on iOS -->
  <div class="pc-gmail-fix" style="white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </div>
</body>
</html>
        `
    }
}