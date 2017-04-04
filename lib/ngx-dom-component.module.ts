import { NgModule } from '@angular/core';
import { NgxDOMComponentService } from './ngx-dom-component.service';
import { NgxDOMComponentComponent } from './ngx-dom-component.component';

@NgModule({
  declarations: [
    NgxDOMComponentComponent
  ],
  providers: [
    NgxDOMComponentService
  ],
  exports: [
    NgxDOMComponentComponent
  ]
})
export class NgxDOMComponentModule {}
