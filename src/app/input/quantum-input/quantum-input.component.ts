import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { InputService } from 'src/app/services/input.service';

@Component({
  selector: 'app-quantum-input',
  templateUrl: './quantum-input.component.html',
  styleUrls: ['./quantum-input.component.scss']
})
export class QuantumInputComponent implements OnInit {

  public form : FormGroup;

  constructor(private fb    : FormBuilder,
              private input : InputService,
              private router: Router,
              private toastr: ToastrService) {
   }

  ngOnInit(): void {
    this.form = this.fb.group({
      processesQty: ['', Validators.compose([Validators.required, Validators.min(1)])],
      quantum: ['', Validators.compose([Validators.required, Validators.min(1)])]
    });

  }

  public getControl(ctrl : string){
    return this.form.controls[ctrl];
  }

  public getClass(ctrl : string){
    const control = this.getControl(ctrl);
    if(control.untouched){
      return '';
    }
    return control.valid ? 'is-valid' : 'is-invalid';
  }
  
  public submit(){
    this.form.markAllAsTouched();

    if(this.form.invalid){
      this.toastr.error('Ingrese una cantidad válida de procesos a ejecutar', 'Error');
      return;
    }

    const quantity = Number(this.getControl('processesQty').value);
    const quantum = Number(this.getControl('quantum').value);
    this.input.addRandomProcesses(quantity, quantum); 
    this.execute();
  }

  public execute(){
    console.log(this.input.getProcesses());
    this.router.navigate(this.input.nextRoute());
  }

}
