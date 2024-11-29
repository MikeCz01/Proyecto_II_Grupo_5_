import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { InputService } from '../services/input.service';

@Injectable({
  providedIn: 'root'
})
export class EmptyManualInputGuard implements CanActivate {

  constructor(private input : InputService,
              private router  : Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if(this.input.getProcesses().length == 0){
      this.router.navigate(['manual-input']);
      return false;
    }
    return true;
  }
  
}
