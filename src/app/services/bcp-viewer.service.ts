import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BCP, FCFSProcess } from '../models/process.model';

@Injectable({
  providedIn: 'root'
})
export class BcpViewerService {
  private bcps : BCP[];

  constructor(private router : Router) { }

  public getBCPs() : BCP[]{
    return this.bcps;
  }

  public setBCPs(bcps : BCP[]){
    this.bcps = bcps;
  }

  public fcfsToBCP(process : FCFSProcess){
    this.bcps = process.finished;
  }

  public viewBCP(){
    this.router.navigate(['bcp']);
  }

  public isBCPSet(){
    return this.bcps && this.bcps.length > 0;
  }
}
