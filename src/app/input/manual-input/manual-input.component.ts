import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ENUM_OPERATIONS, operations } from 'src/app/resources/operation.list';
import { InputService } from 'src/app/services/input.service';

@Component({
  selector: 'app-manual-input',
  templateUrl: './manual-input.component.html',
  styleUrls: ['./manual-input.component.scss']
})
export class ManualInputComponent implements OnInit {

  public form : FormGroup;
  public operations = operations;
  public processesQty : number;

  @ViewChild('idInput') idInput : ElementRef;

  constructor(private fb    : FormBuilder,
              private toastr: ToastrService,
              private input : InputService,
              private router: Router) {
   }

  ngOnInit(): void {
    this.form = this.fb.group({
      programmerName: ['', Validators.required],
      operation: [null, Validators.required],
      operator1: ['', Validators.required],
      operator2: ['', Validators.required],
      maximumTime: ['', Validators.compose([Validators.required, Validators.min(1)])],
      programId: ['', Validators.compose([ Validators.required, Validators.min(1)])]
    });

    this.processesQty = this.input.getProcesses().length;
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
      this.toastr.error('Complete todos los campos', 'Error');
      return;
    }

    const programId = this.getControl('programId').value;
    if(!this.input.isIDUnique(programId)){
      this.toastr.error('El número de programa no es único', 'Error de ID');
      return;
    }

    const op1 = this.getControl('operator1').value;
    const op2 = this.getControl('operator2').value;
    const op = this.getControl('operation').value;

    if(Number(op2) == 0 && (op == ENUM_OPERATIONS.DIVISION || op == ENUM_OPERATIONS.RESIDUO)){
      this.toastr.error('No se puede dividir entre 0', 'Error de operacion');
      return;
    }

    if(Number(op1) == 0 && Number(op2) == 0 && op == ENUM_OPERATIONS.POTENCIA){
      this.toastr.error('0^0 es indeterminado', 'Error de operacion');
      return;
    }

    const program = this.form.value;
    this.input.addProgram(program);
    this.toastr.success('Programa agregado', 'Éxito');
    this.idInput.nativeElement.focus();      
    this.form.reset();
    this.processesQty = this.input.getProcesses().length;
  }

  public simulateInput(){
    this.input.addRandomProcesses(Number(this.getControl('programId').value || 10));
    this.execute();
  }

  public execute(){
    // this.toastr.info('Ejecutando procesos', 'Ejecución iniciada');
    this.router.navigate(['batch-processing']);
  }
}
