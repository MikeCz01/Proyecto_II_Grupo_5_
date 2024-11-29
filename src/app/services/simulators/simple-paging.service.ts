import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BCP, BCPMemory, MemoryFrame, SimplePagingProcess } from 'src/app/models/process.model';
import { MEM_ASSIGN, MEM_STATUS } from 'src/app/resources/memory.numbers.status';
import { defaultOperation, functionOperations, Operation } from 'src/app/resources/operation.list';
import { InputService } from '../input.service';

@Injectable({
  providedIn: 'root'
})
export class SimplePagingService {
  private newProcesses: BCPMemory[];
  private process: SimplePagingProcess;

  public TIME_IN_BLOCK: number = 7;
  private SO_MEMORY_SIZE: number = 4;
  public QUANTUM : number;
  private FRAME_COUNT: number;
  private FRAME_SIZE: number;

  constructor(private automaticInput : InputService) { }

  public initSimulator(processes: BCPMemory[], quantum : number, frameSize : number, frameCount : number): SimplePagingProcess {
    this.newProcesses = processes;
    this.FRAME_COUNT = frameCount;
    this.FRAME_SIZE = frameSize;

    this.QUANTUM = quantum;
    this.process = {
      ready: [],
      blocked: [],
      executing: null,
      finished: [],
      globalCounter: 0,
      pauseFlag: false,
      errorFlag: false,
      interruptFlag: false,
      inputFlag: false,
      contextChangeFlag: false,
      memory: this.generateMemoryMap(),
      newQty: this.newProcesses.length,
    };
    return this.process;
  }

  private checkProcesses(value : BehaviorSubject<SimplePagingProcess>) : void{
    
    while (this.canFitProcess()) {
      const newProcess = this.newProcesses.shift()!;
      newProcess.startTime = this.process.globalCounter;
      newProcess.waitTime = 0;
      this.allocateReadyMemory(newProcess);
      this.process.ready.push(newProcess);
      this.process.newQty = this.newProcesses.length;
    }
    this.process.newQty = this.newProcesses.length;
    value.next(this.process);
  }

  private allocateReadyMemory(process : BCPMemory){
    let remaining = process.memoryUsed;

    this.process.memory
      .filter(m => m.status == MEM_STATUS.FREE)
      .forEach(m => {
        if(remaining >= m.size){
          m.process = process.programId;
          m.status = MEM_STATUS.READY;
          m.used = m.size;
          remaining -= m.size;
        }else if(remaining > 0){
          m.process = process.programId;
          m.status = MEM_STATUS.READY;
          m.used = remaining;
          remaining = 0;
        }
    });
  }

  private changeStatus(process : BCPMemory, status : string){
    this.process.memory
      .filter(m => m.process == process.programId)
      .forEach(s => {
        s.status = status;
        if(status == MEM_STATUS.FREE){
          s.used = 0;
          s.process = MEM_ASSIGN.FREE
        }
    })
  }

  public executeSimulator(): Observable<SimplePagingProcess> {
    const value = new BehaviorSubject<SimplePagingProcess>(this.process);
    const observable = value.asObservable();

    const observer = async () => {
      while (this.areProcessesInMemory) {

        // Asegurar que se llene la memoria
        this.checkProcesses(value);

        // Verificar si el quantum terminó
        if(this.process.executing && (this.process.executing.currentQuantum === this.QUANTUM)){
          this.process.ready.push(this.process.executing);
          this.changeStatus(this.process.executing, MEM_STATUS.READY);
          this.process.executing = null;
          this.process.contextChangeFlag = true;
          
          setTimeout(() => {
            this.process.contextChangeFlag = false;
            value.next(this.process);
          }, 250);

        }

        // Verificar si podemos tener un proceso ejecutándose
        if (this.process.executing == null && this.process.ready.length > 0) {
          this.process.executing = this.process.ready.shift()!;
          this.changeStatus(this.process.executing, MEM_STATUS.EXECUTING);
          this.process.executing.currentQuantum = 0;
          
          // Calculamos su tiempo de respuesta
          if (typeof this.process.executing.responseTime == 'undefined') {
            this.process.executing.responseTime = this.process.globalCounter;
            this.process.executing.elapsedTime = 0;
          }

          value.next(this.process);
        }

        // Ciclo de reloj, 25 ticks de 40ms
        for (let i = 0; i < 25; i++) {
          // En caso de estar en pausa
          do {
            await this.delay(40);
          } while (this.process.pauseFlag);
          // Salir si se produce una interrupción
          if (this.process.errorFlag || this.process.interruptFlag || this.process.inputFlag) {
            break;
          }
        }

        // Fin del ciclo de reloj, verificamos si el ciclo terminó por error o de forma natural

        if (this.process.errorFlag) {           //Terminó por error
          this.process.errorFlag = false;
          if(this.process.executing != null){
            this.process.executing.result = undefined;
            this.process.executing.finishTime = this.process.globalCounter;
            this.process.executing.returnTime = this.process.executing.finishTime - this.process.executing.startTime!;
            this.process.finished.push(this.process.executing);
            this.changeStatus(this.process.executing, MEM_STATUS.FREE);
            this.process.executing = null;
          }
        }
        else if (this.process.interruptFlag) {   // Terminó por interrupción
          this.process.interruptFlag = false;
          if(this.process.executing != null){
            this.process.executing!.timeBlocked = 0;
            this.changeStatus(this.process.executing, MEM_STATUS.BLOCKED);
            this.process.blocked.push(this.process.executing!);
          }
          this.process.executing = null;

        } else if(this.process.inputFlag){    // Interrupción de entrada, no pasa nada pero vuelve a checar 
          this.checkProcesses(value);
          this.process.inputFlag = false;
          continue;

        } else {                                // Ciclo de reloj, terminó naturalmente
          this.process.globalCounter++;

          if (this.process.executing != null) { // Si no es proceso nulo
            this.process.executing.elapsedTime++;
            this.process.executing.currentQuantum!++;

            if (this.process.executing!.elapsedTime == this.process.executing!.maximumTime) {  //Si se acabó
              const { operator1, operation, operator2 } = this.process.executing;
              const f: Operation = functionOperations.get(operation) ?? defaultOperation;
              
              this.process.executing!.result = f(operator1, operator2);
              this.process.executing!.finishTime = this.process.globalCounter;
              this.process.executing!.returnTime = this.process.executing!.finishTime - this.process.executing.startTime!;
              this.changeStatus(this.process.executing, MEM_STATUS.FREE);

              this.process.finished.push(this.process.executing);
              this.process.executing = null;
            }

          }

          // Sumar 1 de tiempo de espera a los procesos listos
          this.process.ready.forEach(r => r.waitTime!++ );

          // Actualizar procesos bloqueados
          this.process.blocked = this.process.blocked.filter(b => {
            b.timeBlocked!++;
            b.waitTime!++;
            if (b.timeBlocked == this.TIME_IN_BLOCK) {
              this.process.ready.push(b);
              this.changeStatus(b, MEM_STATUS.READY);
              return false;
            }
            
            return true;
          });

        }
        value.next(this.process);

      }
      value.complete();
    }

    observer();
    return observable;
  }

  private canFitProcess() : boolean{
    if(!this.nextProcess){
      return false;
    }
    const nextFramesRequired = Math.ceil(this.nextProcess.memoryUsed / this.FRAME_SIZE);
    return this.freeMemory >= nextFramesRequired;
  }

  public get nextProcess() : BCPMemory{
    return this.newProcesses[0];
  }

  public get processCount() : number{
    return this.process.blocked.length + this.process.ready.length + ((this.process.executing != null) ? 1 : 0);
  }

  public get usedMemory(): number {
    return this.process.memory.filter(m => m.status != MEM_STATUS.FREE).length;
  }

  public get freeMemory() : number{
    return this.process.memory.filter(m => m.status == MEM_STATUS.FREE).length;
  }

  private get areProcessesInMemory(): boolean {
    return this.newProcesses.length > 0 || this.process.executing != null ||
      this.process.blocked.length > 0 || this.process.ready.length > 0;
  }

  private async delay(time: number) {
    return new Promise(resolve => {
      setTimeout(resolve, time);
    });
  }

  public pause(): void {
    this.process.pauseFlag = true;
  }

  public resume(): void {
    this.process.pauseFlag = false;
  }

  public raiseError(): void {
    this.process.errorFlag = true;
  }

  public raiseIOInterrupt(): void {
    this.process.interruptFlag = true;
  }

  public addRandomProcess() : void{
    const id = this.getTotalProcessCount() + 1;
    const newProcess : BCPMemory = this.automaticInput.getRandomBCPMemory(id);
    this.process.inputFlag = true;
    this.newProcesses.push(newProcess); 
  }

  private getTotalProcessCount() : number{
    let count = 0;
    if(this.process){
      if(this.process.executing){
        count++;
      }
      count += this.process.ready.length + this.process.blocked.length + this.process.finished.length;
    }
    return this.newProcesses.length + count;
  }

  public getBCPS() : BCP[] {
    let bcps : BCP[] = [];
    this.process.finished.forEach(p => {
      bcps.push({
        ...p,
        status: 'Finalizado'
      });
    });
    
    if(this.process.executing){
      bcps.push({
        ... this.process.executing,
        status: 'Ejecutando'
      });
    }
    
    this.process.blocked.forEach(p => {
      bcps.push({
        ...p,
        status: 'Bloqueado'
      })
    });

    this.process.ready.forEach(p => {
      bcps.push({
        ...p,
        status: 'Listo'
      })
    });

    this.newProcesses.forEach(p => {
      bcps.push({
        ...p, 
        status: 'Nuevo'
      })
    });

    return bcps;
  }

  private generateMemoryMap() : MemoryFrame[] {
    let memory : MemoryFrame[] = [];
    for(let i = 0; i < this.FRAME_COUNT; i++){
      if((this.FRAME_COUNT - i) <= this.SO_MEMORY_SIZE){
        memory.push({
          id: i,
          size: this.FRAME_SIZE, 
          used: this.FRAME_SIZE, 
          process: MEM_ASSIGN.SO,
          status: MEM_STATUS.RESERVED
        });

      }else{
        memory.push({
          id: i,
          size: this.FRAME_SIZE, 
          used: 0, 
          process: MEM_ASSIGN.FREE,
          status: MEM_STATUS.FREE
        });
      }
    }
    return memory;
  }
}