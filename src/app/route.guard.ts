import { CanActivate } from "@angular/router";

export class LoginRouteGuard implements CanActivate {

    canActivate() {
        const email = localStorage.getItem('email')
        const logged = localStorage.getItem('logged')

        if (logged == null || logged == 'false' || email == null) {
            return true
        } else {
            return false
        }
    }
}

export class DashboardRouteGuard implements CanActivate {
    canActivate() {
        const logged = localStorage.getItem('logged')

        if (logged == 'true' && logged != null) {
            return true
        } else {
            return false
        }
    }
}