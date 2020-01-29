import { CartItem } from "../shared/classes/cart-item";

export interface TacOrder {
    carts:CartItem[]
    currency_used:string
    conversion_rate:number
    payment_gateway_fee:any
    merchant_fee:any
    payment_gateway_used:string
    order_platform:string
    transaction_id:string
    payment_status:string
    id: string
    country: string
    email: string
    created_date:string
    timestamp:any
    track_id:number
    status:string
    total_amount:number
    shipping_details:any
    other_payment_details:any
    gift_card_style:string
    tracking_details:Tracking[]
}

export interface Tracking {
    title: string
    text: string
    icon: string
    time: string
}