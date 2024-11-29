import { Component, OnInit } from '@angular/core';
import { BCP } from '../../models/process.model';
import { BcpViewerService } from '../../services/bcp-viewer.service';

@Component({
  selector: 'app-bcp-viewer',
  templateUrl: './bcp-viewer.component.html',
  styleUrls: ['./bcp-viewer.component.scss']
})
export class BcpViewerComponent implements OnInit {

  public bcps : BCP[];

  constructor(private bcp : BcpViewerService) { }

  ngOnInit(): void {
    this.bcps = this.bcp.getBCPs();
  }

  public isValid(value : number | undefined) : boolean{
    return typeof value !== 'undefined';
  }
}
