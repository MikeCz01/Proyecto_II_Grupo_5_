import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BCP, BCPMemory } from 'src/app/models/process.model';
import { defaultStatusIcon, statusIcons } from 'src/app/resources/bcp.status.list';

@Component({
  selector: 'app-bcp-extended-viewer',
  templateUrl: './bcp-extended-viewer.component.html',
  styleUrls: ['./bcp-extended-viewer.component.scss']
})
export class BcpExtendedViewerComponent implements OnInit {

  @Input() public bcps : BCP[] | BCPMemory[];

  constructor(public modal : NgbActiveModal) { }

  ngOnInit(): void {
  }

  public isValid(value : number | undefined){
    return typeof value !== 'undefined';
  }

  public getIcon(status : string) : string{
    return statusIcons.get(status) ?? defaultStatusIcon;
  }

  public isBCPMemory(){
    return this.bcps.length > 0 && this.instanceofBCPMemory(this.bcps[0]);
  }

  public instanceofBCPMemory(object : BCP | BCPMemory) : object is BCPMemory{
    return 'memoryUsed' in object;
  }

}
