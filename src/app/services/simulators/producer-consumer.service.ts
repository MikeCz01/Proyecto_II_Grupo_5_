import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable } from 'rxjs';
import { PCProblem } from 'src/app/models/producer-consumer.model';

@Injectable({
  providedIn: 'root'
})
export class ProducerConsumerService {

  private running = true;
  private process : PCProblem;
  private value : BehaviorSubject<PCProblem>;
  private bufferSize : number;
  private minWork : number;
  private maxWork : number;
  
  constructor(private toastr  : ToastrService) { }

  public init(bufferSize : number, minWork : number, maxWork: number) : PCProblem{
    this.bufferSize = bufferSize;
    this.minWork = minWork;
    this.maxWork = maxWork;

    this.process = {
      consumer: {
        working: false,
        idx: 0,
        count: 0
      },
      producer: {
        working: false,
        idx: 0,
        count: 0
      },
      turn: false,
      turnStatus: '',
      buffer: new Array(this.bufferSize).fill(false),
      workBufferSize: 0
    }
    return this.process;
  }

  public executeSimulator(): Observable<PCProblem> {
    this.value = new BehaviorSubject<PCProblem>(this.process);
    const observable = this.value.asObservable();

    const observer = async () => {
      while(this.running){
        await this.roulette();    // Get random turn and workSize
        this.update();

        if(this.process.turn){  //Producer's turn
          this.process.producer.count = 0;

          for(let i = 0; i < this.process.workBufferSize; i++){
            
            if(this.process.buffer[this.process.producer.idx]){
              this.toastr.warning('No se puede ingresar al buffer', 'Buffer lleno');
              break;
            }

            this.process.buffer[this.process.producer.idx] = true;
            let count = this.process.producer.idx;
            this.process.producer.idx = (count == this.bufferSize - 1)? 0 : ++count;
            this.process.producer.count++;
            
            this.update();
            await this.delay(750);
          }
        }else{                  //Consumer's turn
          this.process.consumer.count = 0;

          for(let i = 0; i<this.process.workBufferSize; i++){
            
            if(!this.process.buffer[this.process.consumer.idx]){
              this.toastr.warning('No se puede ingresar al buffer', 'Buffer vacío');
              break;
            }
            this.process.buffer[this.process.consumer.idx] = false;
            let count = this.process.consumer.idx;
            this.process.consumer.idx = (count == this.bufferSize - 1)? 0 : ++count;
            this.process.consumer.count++;

            this.update();
            await this.delay(750);
          }
        }
        this.update();
        await this.delay(250);
      }
    }

    observer();
    return observable;
  }

  private async roulette(){
    this.process.turnStatus = 'Seleccionando turno y cantidad...';
    this.process.producer.working = false;
    this.process.consumer.working = false;
    this.update();

    let turn = this.process.turn;
    const expectedValue : boolean = Math.random() <= 0.55;

    for(let i = 4; i <= 20; i++){
      this.process.turn = turn;
      this.process.workBufferSize = this.randomNumber(this.minWork, this.maxWork);
      this.update();
      await this.delay(Math.pow(i, 2));
      turn = !turn;
    }
    
    this.process.turn = expectedValue;
    this.process.producer.working = expectedValue;
    this.process.consumer.working = !expectedValue;
    this.process.turnStatus = 'Turno del ' + (expectedValue? 'productor' : 'consumidor');
    this.update();
  }

  private async delay(time: number) {
    return new Promise(resolve => {
      setTimeout(resolve, time);
    });
  }

  private update(){
    this.value.next(this.process);
  }

  public randomNumber(min : number = -255, max : number = 254){
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  public stop(){
    this.running = false;
  }
}
