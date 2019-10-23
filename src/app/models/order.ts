import { CartItem } from "../shared/classes/cart-item";

export interface TacOrder {
    carts:CartItem[]
    currency_used:string
    conversion_rate:number
    transaction_id:string
    id: string
    country: string
    email: string
    created_date:string
    timestamp:any
    track_id:number
    status:string
    total_amount:number
    shipping_details:any
    other_payment_detals:any
    gift_card_style:string
    tracking_details:Tracking[]
}

export interface Tracking {
    title: string
    text: string
    icon: string
    time: string
}