import { Component, HostListener, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { BCPMemory, MemoryFrame, SimplePagingProcess } from 'src/app/models/process.model';
import { MEM_ASSIGN, MEM_STATUS } from 'src/app/resources/memory.numbers.status';
import { InputService } from 'src/app/services/input.service';
import { SimplePagingService } from 'src/app/services/simulators/simple-paging.service';
import { BcpExtendedViewerComponent } from 'src/app/viewers/bcp-extended-viewer/bcp-extended-viewer.component';
import { MemoryViewerComponent } from 'src/app/viewers/memory-viewer/memory-viewer.component';

@Component({
  selector: 'app-simple-paging',
  templateUrl: './simple-paging.component.html',
  styleUrls: ['./simple-paging.component.scss']
})
export class SimplePagingComponent implements OnInit {

  public started = false;
  public paused = false;
  public finished = false;
  public process : SimplePagingProcess;
  private bcpModalRef : NgbModalRef | null;
  private memoryModalRef : NgbModalRef | null;

  public FRAME_SIZE = 5;
  public FRAMES = Array.from(Array(this.FRAME_SIZE).keys());
  public FRAME_COUNT = 44;
  public ASSIGNATIONS = MEM_ASSIGN;
  public STATUSES = MEM_STATUS

  constructor(private input   : InputService,
              private paging  : SimplePagingService,
              private toastr  : ToastrService,
              private modal   : NgbModal) { }

  ngOnInit(): void {
    this.process = this.paging.initSimulator(
        this.input.getProcessesAsBCPMemory(), 
        this.input.getQuantum(),
        this.FRAME_SIZE,
        this.FRAME_COUNT,
      );
  }

  public startSimulation(){
    this.started = true;
    this.input.resetProcesses();
    this.paging.executeSimulator().subscribe({
      next: (process) => {
        this.process = process;
        console.log(this.process);
      },
      complete: () => {
        this.toastr.success('Todos los trabajos terminados', 'Ejecución completa');
        this.bcpModalRef = this.modal.open(BcpExtendedViewerComponent, { size: 'xl', scrollable: true, centered: true });
        this.bcpModalRef.componentInstance.bcps = this.paging.getBCPS();
        this.finished = true;
    }});
  }

  @HostListener('document:keypress', ['$event'])
  private handleKeyboardEvent(event: KeyboardEvent) {
    console.log('Tecla: ' + event.key);
    if(!this.paused && !this.finished){
      switch(event.key){
        case 'e':
        case 'E':
          this.toastr.warning('Interrupción por entrada/salida', 'Interrupción (E)');
          this.paging.raiseIOInterrupt();
          break;
        case 'w':
        case 'W':
          this.toastr.error('Error de ejecución', 'Interrupción (W)');
          this.paging.raiseError();
          break;
        case 'p':
        case 'P':
          this.toastr.info('Ejecución en pausa', 'Interrupción (P)');
          this.paused = true;
          this.paging.pause();
          break;
        case 'b':
        case 'B':
          this.bcpModalRef = this.modal.open(BcpExtendedViewerComponent, { size: 'xl', scrollable: true, centered: true });
          this.bcpModalRef.componentInstance.bcps = this.paging.getBCPS();
          this.paused = true;
          this.paging.pause();
          break;
        case 't':
        case 'T':
          this.memoryModalRef = this.modal.open(MemoryViewerComponent, { size: 'xl', scrollable: true, centered: true});
          this.memoryModalRef.componentInstance.memory = this.process.memory;
          this.memoryModalRef.componentInstance.isExtended = true;
          this.memoryModalRef.componentInstance.isModal = true;
          this.paused = true;
          this.paging.pause();
          break;
        case 'n':
        case 'N':
          this.toastr.success('Se ha agregado un nuevo proceso', 'Proceso agregado');
          this.paging.addRandomProcess();
          break;
        default:
          break;
      }
    }else if(event.key == 'C' || event.key == 'c'){
      this.toastr.info('Ejecución reanudada', 'Interrupción (C)');
      this.paused = false;
      this.paging.resume();
      if(this.bcpModalRef){
        this.bcpModalRef.dismiss('Closed');
        this.bcpModalRef = null;
      }
      if(this.memoryModalRef){
        this.memoryModalRef.dismiss('Closed');
        this.memoryModalRef = null;
      }
    }
  }

  public getBlockedTime(){
    return this.paging.TIME_IN_BLOCK;
  }

  public getProcessCount(){
    return this.paging.processCount;
  }

  public getQuantum(){
    return this.paging.QUANTUM;
  }

  public isValid(value : number | undefined){
    return typeof value !== 'undefined';
  }

  public getCellClass(cell : MemoryFrame, index : number){
    if(cell.process == this.ASSIGNATIONS.FREE){
      return 'free-frame';
    }
    if(cell.process == this.ASSIGNATIONS.SO){
      return 'so-frame'
    }
    if(cell.used < index){
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
    this.process.memory.forEach(m =>{
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

  public get nextProcess() : BCPMemory{
    return this.paging.nextProcess;
  }
}
