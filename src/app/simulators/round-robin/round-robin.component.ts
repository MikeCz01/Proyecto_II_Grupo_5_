import { Component, HostListener, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { RRProcess } from 'src/app/models/process.model';
import { InputService } from 'src/app/services/input.service';
import { RoundRobinService } from 'src/app/services/simulators/round-robin.service';
import { BcpExtendedViewerComponent } from 'src/app/viewers/bcp-extended-viewer/bcp-extended-viewer.component';

@Component({
  selector: 'app-round-robin',
  templateUrl: './round-robin.component.html',
  styleUrls: ['./round-robin.component.scss']
})
export class RoundRobinComponent implements OnInit {

  public started = false;
  public paused = false;
  public finished = false;
  public process : RRProcess;
  private modalRef : NgbModalRef | null;

  private PROCESS_IN_MEMORY = 3;

  constructor(private input   : InputService,
              private rr      : RoundRobinService,
              private toastr  : ToastrService,
              private modal   : NgbModal) { }

  ngOnInit(): void {
    this.process = this.rr.initSimulator(
        this.input.getProcessesAsBCP(), 
        this.PROCESS_IN_MEMORY, 
        this.input.getQuantum()
      );
  }

  public startSimulation(){
    this.started = true;
    this.input.resetProcesses();
    this.rr.executeSimulator().subscribe({
      next: (process) => {
        this.process = process;
        console.log(this.process);
      },
      complete: () => {
        this.toastr.success('Todos los trabajos terminados', 'Ejecución completa');
        this.modalRef = this.modal.open(BcpExtendedViewerComponent, { size: 'xl', scrollable: true, centered: true });
        this.modalRef.componentInstance.bcps = this.rr.getBCPS();
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
          this.rr.raiseIOInterrupt();
          break;
        case 'w':
        case 'W':
          this.toastr.error('Error de ejecución', 'Interrupción (W)');
          this.rr.raiseError();
          break;
        case 'p':
        case 'P':
          this.toastr.info('Ejecución en pausa', 'Interrupción (P)');
          this.paused = true;
          this.rr.pause();
          break;
        case 'b':
        case 'B':
          this.modalRef = this.modal.open(BcpExtendedViewerComponent, { size: 'xl', scrollable: true, centered: true });
          this.modalRef.componentInstance.bcps = this.rr.getBCPS();
          this.paused = true;
          this.rr.pause();
          break;
        case 'n':
        case 'N':
          this.toastr.success('Se ha agregado un nuevo proceso', 'Proceso agregado');
          this.rr.addRandomProcess();
          break;
        default:
          break;
      }
    }else if(event.key == 'C' || event.key == 'c'){
      this.toastr.info('Ejecución reanudada', 'Interrupción (C)');
      this.paused = false;
      this.rr.resume();
      if(this.modalRef){
        this.modalRef.dismiss('Closed');
        this.modalRef = null;
      }
    }
  }

  public getBlockedTime(){
    return this.rr.TIME_IN_BLOCK;
  }

  public getMemoryUsed(){
    return this.rr.memoryUsed;
  }

  public getQuantum(){
    return this.rr.QUANTUM;
  }

  public isValid(value : number | undefined){
    return typeof value !== 'undefined';
  }
}
