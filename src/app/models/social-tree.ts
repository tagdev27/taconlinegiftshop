export interface SocialTree {
    id:string
    user_id:string
    name:string
    age:number
    gender:string
    relationship:string
    occupation:string
    address:string
    number:string
    email:string
    events:SocialEvents[]
    profile_image_url:string
    entry_mode:string
}

export interface SocialEvents {
    event_name:string
    event_date:string
}