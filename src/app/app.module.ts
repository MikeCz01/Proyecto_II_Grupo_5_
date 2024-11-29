import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppRoutes } from './app.routing';
import { LayoutComponent } from './layout/layout.component';
import { ManualInputComponent } from './input/manual-input/manual-input.component';
import { BatchProcessingComponent } from './simulators/batch-processing/batch-processing.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MultiprogrammingComponent } from './simulators/multiprogramming/multiprogramming.component';
import { AutomaticInputComponent } from './input/automatic-input/automatic-input.component';
import { FcfsComponent } from './simulators/fcfs/fcfs.component';
import { BcpViewerComponent } from './viewers/bcp-viewer/bcp-viewer.component';
import { FcfsContinuacionComponent } from './simulators/fcfs-continuacion/fcfs-continuacion.component';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BcpExtendedViewerComponent } from './viewers/bcp-extended-viewer/bcp-extended-viewer.component';
import { QuantumInputComponent } from './input/quantum-input/quantum-input.component';
import { RoundRobinComponent } from './simulators/round-robin/round-robin.component';
import { CreditsComponent } from './extras/credits/credits.component';
import { ProducerConsumerComponent } from './extras/producer-consumer/producer-consumer.component';
import { SimplePagingComponent } from './simulators/simple-paging/simple-paging.component';
import { MemoryViewerComponent } from './viewers/memory-viewer/memory-viewer.component';
import { HttpClientModule } from '@angular/common/http';
import { SuspendedProcessComponent } from './simulators/suspended-process/suspended-process.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    ManualInputComponent,
    BatchProcessingComponent,
    MultiprogrammingComponent,
    AutomaticInputComponent,
    FcfsComponent,
    BcpViewerComponent,
    FcfsContinuacionComponent,
    BcpExtendedViewerComponent,
    QuantumInputComponent,
    RoundRobinComponent,
    ProducerConsumerComponent,
    CreditsComponent,
    SimplePagingComponent,
    MemoryViewerComponent,
    SuspendedProcessComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 5000,
      progressBar: true,
      progressAnimation: 'increasing',
      extendedTimeOut: 3000,
      closeButton: true
    }),
    RouterModule.forRoot(AppRoutes),
    ReactiveFormsModule,
    NgbModule,
    HttpClientModule
  ],
  providers: [
    NgbActiveModal
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
