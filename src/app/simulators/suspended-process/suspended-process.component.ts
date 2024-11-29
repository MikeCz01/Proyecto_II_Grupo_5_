import { Component, HostListener, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { BCPMemory, MemoryFrame, SimplePagingProcess, SuspendedProcessesProcess } from 'src/app/models/process.model';
import { MEM_ASSIGN, MEM_STATUS } from 'src/app/resources/memory.numbers.status';
import { InputService } from 'src/app/services/input.service';
import { SuspendedProcessesService } from 'src/app/services/simulators/suspended-processes.service';
import { BcpExtendedViewerComponent } from 'src/app/viewers/bcp-extended-viewer/bcp-extended-viewer.component';
import { MemoryViewerComponent } from 'src/app/viewers/memory-viewer/memory-viewer.component';

@Component({
  selector: 'app-suspended-process',
  templateUrl: './suspended-process.component.html',
  styleUrls: ['./suspended-process.component.scss']
})
export class SuspendedProcessComponent implements OnInit {

  public started = false;
  public paused = false;
  public finished = false;
  public process : SuspendedProcessesProcess;
  private bcpModalRef : NgbModalRef | null;
  private memoryModalRef : NgbModalRef | null;

  public FRAME_SIZE = 5;
  public FRAMES = Array.from(Array(this.FRAME_SIZE).keys());
  public FRAME_COUNT = 44;
  public ASSIGNATIONS = MEM_ASSIGN;
  public STATUSES = MEM_STATUS

  constructor(private input     : InputService,
              private suspended : SuspendedProcessesService,
              private toastr    : ToastrService,
              private modal     : NgbModal) { }

  ngOnInit(): void {
    this.process = this.suspended.initSimulator(
        this.input.getProcessesAsBCPMemory(), 
        this.input.getQuantum(),
        this.FRAME_SIZE,
        this.FRAME_COUNT,
      );
  }

  public startSimulation(){
    this.started = true;
    this.input.resetProcesses();
    this.suspended.executeSimulator().subscribe({
      next: (process) => {
        this.process = process;
        console.log(this.process);
      },
      complete: () => {
        this.toastr.success('Todos los trabajos terminados', 'Ejecución completa');
        this.bcpModalRef = this.modal.open(BcpExtendedViewerComponent, { size: 'xl', scrollable: true, centered: true });
        this.bcpModalRef.componentInstance.bcps = this.suspended.getBCPS();
        this.finished = true;
    }});
  }

  @HostListener('document:keypress', ['$event'])
  private async handleKeyboardEvent(event: KeyboardEvent) {
    console.log('Tecla: ' + event.key);
    if(!this.paused && !this.finished){
      switch(event.key){
        case 'e':
        case 'E':
          this.toastr.warning('Interrupción por entrada/salida', 'Interrupción (E)');
          this.suspended.raiseIOInterrupt();
          break;
        case 'w':
        case 'W':
          this.toastr.error('Error de ejecución', 'Interrupción (W)');
          this.suspended.raiseError();
          break;
        case 'p':
        case 'P':
          this.toastr.info('Ejecución en pausa', 'Interrupción (P)');
          this.paused = true;
          this.suspended.pause();
          break;
        case 'b':
        case 'B':
          this.bcpModalRef = this.modal.open(BcpExtendedViewerComponent, { size: 'xl', scrollable: true, centered: true });
          this.bcpModalRef.componentInstance.bcps = this.suspended.getBCPS();
          this.paused = true;
          this.suspended.pause();
          break;
        case 't':
        case 'T':
          this.memoryModalRef = this.modal.open(MemoryViewerComponent, { size: 'xl', scrollable: true, centered: true});
          this.memoryModalRef.componentInstance.memory = this.process.memory;
          this.memoryModalRef.componentInstance.isExtended = true;
          this.memoryModalRef.componentInstance.isModal = true;
          this.paused = true;
          this.suspended.pause();
          break;
        case 'n':
        case 'N':
          this.toastr.success('Se ha agregado un nuevo proceso', 'Proceso agregado');
          this.suspended.addRandomProcess();
          break;
        case 'S':
        case 's':
          if(await this.suspended.suspendProcess()){
            this.toastr.success('Se ha suspendido el proceso con éxito', 'Proceso suspendido (S)')
          }else{
            this.toastr.error('No existen procesos bloqueados a suspender', 'No se pudo suspender proceso (S)');
          }
          break;
        case 'R':
        case 'r':
          if(this.process.suspended.length == 0){
            this.toastr.error('No hay procesos suspendidos', 'No se puede retornar proceso (R)');
          }
          else if(await this.suspended.returnProcess()){
            this.toastr.success('Se ha retornado el proceso con éxito', 'Proceso retornado (R)')
          }else{
            this.toastr.error('No hay suficiente memoria disponible para retornar', 'No se pudo retornar proceso (R)');
          }
          break;
        default:
          break;
      }
    }else if(event.key == 'C' || event.key == 'c'){
      this.toastr.info('Ejecución reanudada', 'Interrupción (C)');
      this.paused = false;
      this.suspended.resume();
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
    return this.suspended.TIME_IN_BLOCK;
  }

  public getProcessCount(){
    return this.suspended.processCount;
  }

  public getQuantum(){
    return this.suspended.QUANTUM;
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
    return this.suspended.nextProcess;
  }

}
