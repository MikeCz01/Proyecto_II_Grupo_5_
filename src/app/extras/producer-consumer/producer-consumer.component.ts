import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PCProblem } from 'src/app/models/producer-consumer.model';
import { ProducerConsumerService } from 'src/app/services/simulators/producer-consumer.service';

@Component({
  selector: 'app-producer-consumer',
  templateUrl: './producer-consumer.component.html',
  styleUrls: ['./producer-consumer.component.scss']
})
export class ProducerConsumerComponent implements OnInit {
  public process : PCProblem;
  private BUFFER_SIZE = 25;
  private MIN_WORK = 2;
  private MAX_WORK = 5;
  public started = false;
  
  constructor(private router  : Router,
              private pc      : ProducerConsumerService) { }
  
  ngOnInit(): void {
    this.process = this.pc.init(this.BUFFER_SIZE, this.MIN_WORK, this.MAX_WORK);
  }

  public start(){
    this.started = true;
    this.pc.executeSimulator().subscribe({
      next: (value) => {
        this.process = value;
      }
    });
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if(event.key == 'Escape'){
      this.pc.stop();
      this.started = false
      this.router.navigate(['credits']);
    }
  }

}
