import * as firebase from "firebase";
import { StoreSettings } from "../models/store";

export class StoreService {

    constructor() { }
    

    public async getSettings() {
        const userSnap:firebase.firestore.DocumentSnapshot = await firebase.firestore().collection('db').doc('tacadmin').collection('settings').doc('store').get();
        return <StoreSettings>userSnap.data()
    }

    // public isAllowedAccess(access_level: string, menu: string) {
    //     if(access_level.includes(menu)){
    //         return true;
    //     }else {
    //         return false;
    //     }
    // }

}