import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { BcpViewerService } from '../services/bcp-viewer.service';

@Injectable({
  providedIn: 'root'
})
export class BcpGuard implements CanActivate {

  constructor(private bcp   : BcpViewerService,
              private router: Router){
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if(!this.bcp.isBCPSet()){
      this.router.navigate(['input']);
      return false;
    }
    return true;
  }
  
}
