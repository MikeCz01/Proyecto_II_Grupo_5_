import { Component, HostListener, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BatchProcess, MultiprogrammingProcess } from 'src/app/models/process.model';
import { InputService } from 'src/app/services/input.service';
import { BatchMultiprogrammingProcessingService } from 'src/app/services/simulators/batch-multiprogramming-processing.service';

@Component({
  selector: 'app-multiprogramming',
  templateUrl: './multiprogramming.component.html',
  styleUrls: ['./multiprogramming.component.scss']
})
export class MultiprogrammingComponent implements OnInit {

  public started = false;
  public batch : MultiprogrammingProcess;
  public paused = false;
  public BATCH_SIZE = 3;

  constructor(private input           : InputService,
              private batchProcessing : BatchMultiprogrammingProcessingService,
              private toastr          : ToastrService) { }

  ngOnInit(): void {
    this.batch = this.batchProcessing.initSimulator(this.input.getProcesses(), this.BATCH_SIZE);
  }

  public startSimulation(){
    this.started = true;
    this.input.resetProcesses();
    this.batchProcessing.executeSimulator().subscribe({
      next: (batch) => {
        this.batch = batch;
      },
      complete: () => {
        this.toastr.success('Todos los trabajos terminados', 'Ejecución completa');
        this.started = false;
    }});
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    console.log('Tecla: ' + event.key);
    if(!this.paused){
      switch(event.key){
        case 'e':
        case 'E':
          this.toastr.warning('Interrupción por entrada/salida', 'Interrupción (E)');
          this.batchProcessing.raiseIOInterrupt();
          break;
        case 'w':
        case 'W':
          this.toastr.error('Error de ejecución', 'Interrupción (W)');
          this.batchProcessing.raiseError();
          break;
        case 'p':
        case 'P':
          this.toastr.info('Ejecución en pausa', 'Interrupción (P)');
          this.batchProcessing.pause();
          this.paused = true;
          break;
        default:
          break;
      }
    }else if(event.key == 'C' || event.key == 'c'){
      this.toastr.info('Ejecución reanudada', 'Interrupción (C)');
      this.batchProcessing.resume();
      this.paused = false;
    }
  }

  public getRowSpan(length : number, i : number){
    const fullBatches = Math.floor(length / this.BATCH_SIZE);
    if(i < fullBatches * this.BATCH_SIZE){
      return i % this.BATCH_SIZE === 0 ? this.BATCH_SIZE : 0;
    }
    return i % this.BATCH_SIZE === 0 ? length % this.BATCH_SIZE : 0;
  }

  public isValid(value : number | undefined) : boolean{
    return typeof value !== 'undefined';
  }

}
