import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BCP, FCFSProcess, RRProcess } from 'src/app/models/process.model';
import { defaultOperation, functionOperations, Operation } from 'src/app/resources/operation.list';
import { InputService } from '../input.service';

@Injectable({
  providedIn: 'root'
})
export class RoundRobinService {
  private newProcesses: BCP[];
  private process: RRProcess;
  private cpuMemory: number;

  public TIME_IN_BLOCK: number = 7;
  public QUANTUM : number;

  constructor(private automaticInput : InputService) { }

  public initSimulator(processes: BCP[], cpuMemory: number, quantum : number): RRProcess {
    this.newProcesses = processes;
    this.cpuMemory = cpuMemory;
    this.QUANTUM = quantum;
    this.process = {
      newQty: 0,
      ready: [],
      blocked: [],
      executing: null,
      finished: [],
      globalCounter: 0,
      pauseFlag: false,
      errorFlag: false,
      interruptFlag: false,
      inputFlag: false,
      contextChangeFlag: false
    };
    return this.process;
  }

  private checkProcesses(value : BehaviorSubject<RRProcess>) : void{
    while (this.memoryUsed < this.cpuMemory && this.newProcesses.length > 0) {
      const newProcess = this.newProcesses.shift()!;
      newProcess.startTime = this.process.globalCounter;
      newProcess.waitTime = 0;
      this.process.ready.push(newProcess);
      this.process.newQty = this.newProcesses.length;
    }
    this.process.newQty = this.newProcesses.length;
    value.next(this.process);
  }

  public executeSimulator(): Observable<RRProcess> {
    const value = new BehaviorSubject<RRProcess>(this.process);
    const observable = value.asObservable();

    const observer = async () => {
      while (this.areProcessesInMemory) {

        // Asegurar que siempre que se pueda haya 3 procesos en memoria
        this.checkProcesses(value);

        // Verificar si el quantum terminó
        if(this.process.executing && (this.process.executing.currentQuantum === this.QUANTUM)){
          this.process.ready.push(this.process.executing);
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
            this.process.executing = null;
          }
        }
        else if (this.process.interruptFlag) {   // Terminó por interrupción
          this.process.interruptFlag = false;
          if(this.process.executing != null){
            this.process.executing!.timeBlocked = 0;
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

  public get memoryUsed(): number {
    let count = 0;
    if (this.process.executing != null) {
      count++;
    }
    count += this.process.blocked.length;
    count += this.process.ready.length;
    return count;
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
    const newProcess : BCP = this.automaticInput.getRandomBCP(id);
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

}
