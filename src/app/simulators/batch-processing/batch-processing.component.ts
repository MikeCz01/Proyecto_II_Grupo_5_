import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BatchProcess } from 'src/app/models/process.model';
import { InputService } from 'src/app/services/input.service';
import { BatchProcessingService } from 'src/app/services/simulators/batch-processing.service';

@Component({
  selector: 'app-batch-processing',
  templateUrl: './batch-processing.component.html',
  styleUrls: ['./batch-processing.component.scss']
})
export class BatchProcessingComponent implements OnInit {

  public started = false;
  public batch : BatchProcess;
  public BATCH_SIZE = 3;

  constructor(private input           : InputService,
              private batchProcessing : BatchProcessingService,
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
        console.log(batch);
      },
      complete: () => {
        this.toastr.success('Todos los trabajos terminados', 'Ejecución completa');
        this.started = false;
      }});
  }

  public getRowSpan(length : number, i : number){
    const fullBatches = Math.floor(length / this.BATCH_SIZE);
    if(i < fullBatches * this.BATCH_SIZE){
      return i % this.BATCH_SIZE === 0 ? this.BATCH_SIZE : 0;
    }
    return i % this.BATCH_SIZE === 0 ? length % this.BATCH_SIZE : 0;
  }

}
