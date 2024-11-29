import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BatchProcess, Process } from 'src/app/models/process.model';
import { defaultOperation, functionOperations, Operation } from 'src/app/resources/operation.list';

@Injectable({
  providedIn: 'root'
})
export class BatchProcessingService {

  private processes : Process[];
  private batchSize : number;
  private batches : Process[][];
  private batch : BatchProcess;

  constructor() { }

  public initSimulator(processes : Process[], batchSize : number) : BatchProcess{
    this.processes = processes;
    this.batchSize = batchSize;
    this.batches = this.generateBatches();
    this.batch = {
      currentBatch: [],
      doneProcesses: [],
      executingProcess: null,
      globalCounter: 0,
      pendingBatches: this.batches.length,
      elapsedTime: 0
    };
    return this.batch;
  }

  public executeSimulator() : Observable<BatchProcess>{
    const value = new BehaviorSubject<BatchProcess>(this.batch);
    const observable = value.asObservable();

    const observer = async() => {
      
      let batchNumber = 0;
      while(this.batches.length > 0 || this.batch.executingProcess != null){
        batchNumber++;
        this.batch.currentBatch = this.batches.shift()!;
        this.batch.pendingBatches = this.batches.length;
        
        while(this.batch.currentBatch.length > 0){
          this.batch.executingProcess = this.batch.currentBatch.shift()!;
          this.batch.elapsedTime = 0;
          value.next(this.batch);

          for(let i = 0; i < this.batch.executingProcess.maximumTime; i++){
            await this.delay(1000);
            this.batch.globalCounter++;
            this.batch.elapsedTime++;
            value.next(this.batch);
          }
          const { operator1, operation, operator2 } = this.batch.executingProcess;
          
          const f : Operation = functionOperations.get(operation) ?? defaultOperation;
          this.batch.executingProcess.result = f(operator1, operator2);
          this.batch.executingProcess.batchNumber = batchNumber;
          this.batch.doneProcesses.push(this.batch.executingProcess);
          value.next(this.batch);
        }
        this.batch.executingProcess = null;
      }
      value.complete();
    }

    observer();
    return observable;
  }

  public generateBatches() : Process[][]{
    let chunk : Process[] = [];
    let chunks :Process[][] = [];
    
    this.processes.forEach(process => {
      if(chunk.length == this.batchSize){
        chunks.push(chunk);
        chunk = [];
      }
      chunk.push(process);
    });

    chunks.push(chunk);

    return chunks;
  }

  public async delay(time : number){
    return new Promise(resolve => {
      setTimeout(resolve, time);
    });
  }
}
