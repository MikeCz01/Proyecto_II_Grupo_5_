import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MemoryFrame } from 'src/app/models/process.model';
import { MEM_ASSIGN, MEM_STATUS } from 'src/app/resources/memory.numbers.status';

@Component({
  selector: 'app-memory-viewer',
  templateUrl: './memory-viewer.component.html',
  styleUrls: ['./memory-viewer.component.scss']
})
export class MemoryViewerComponent implements OnInit {
   @Input() public memory : MemoryFrame[] = [];
   @Input() public isExtended : boolean = false;
   @Input() public isModal : boolean = false;

  public FRAME_SIZE : number;
  public FRAMES : number[];
  public FRAME_COUNT : number;
  public ASSIGNATIONS = MEM_ASSIGN;
  public STATUSES = MEM_STATUS

  constructor(public modal : NgbActiveModal) { }

  ngOnInit(): void {
    if(this.memory.length > 0){
      this.FRAME_SIZE = this.memory[0].size;
      this.FRAMES = Array.from(Array(this.FRAME_SIZE).keys());
      this.FRAME_COUNT = this.memory.length;
    }
  }

  private totalSameStatus(cell : MemoryFrame){
    let sameStatus : number[] = [];
    let indexOf = 0;
    this.memory.forEach(m => {
      if(m.status == cell.status && !sameStatus.includes(m.process)){
        sameStatus.push(m.process);
        if(m.process == cell.process){
          indexOf = sameStatus.length - 1;
        }
      }
    });
    return {
      sameStatus: sameStatus.length,
      indexOf: indexOf
    };
  }

  public getOpacity(cell : MemoryFrame){
    const status = this.totalSameStatus(cell);
    const opacity = 80 + 20*(status.indexOf/status.sameStatus)*((status.indexOf % 2 == 0) ? 1 : -1);
    return `opacity: ${opacity}%;`;
  }

  public getTitle(cell : MemoryFrame){
    return `Proceso ${cell.process} - ${ cell.status } (${cell.used}/${cell.size})`;
  }
  public getContent(cell : MemoryFrame, index : number){
    if(cell.process == this.ASSIGNATIONS.FREE){
      return "LIBRE"[index];
    }
    if(cell.process == this.ASSIGNATIONS.SO){
      return '  SO '[index];
    }
    if(cell.used <= index){
      return '';
    }

    if(index == 0){
      return cell.process;
    }
    return '';
  }

  public getCellClass(cell : MemoryFrame, index : number){
    if(cell.process == this.ASSIGNATIONS.FREE){
      return 'free-frame';
    }
    if(cell.process == this.ASSIGNATIONS.SO){
      return 'so-frame'
    }
    if(cell.used <= index){
      return '';
    }
    switch(cell.status){
      case this.STATUSES.READY:
        return 'ready-frame';
      case this.STATUSES.EXECUTING:
        return 'executing-frame';
      case this.STATUSES.BLOCKED:
        return 'blocked-frame';
      default:
        return 'free-frame';
    }
  }

  public memoryMap() : MemoryFrame[][]{
    let pairs : MemoryFrame[][] = [];
    let current : MemoryFrame[] = [];
    this.memory.forEach(m =>{
      current.push(m);
      if(current.length === 2){
        pairs.push(current);
        current = [];
      }
    });
    if(current.length > 0){
      pairs.push(current);
    }
    return pairs;
  }

}
