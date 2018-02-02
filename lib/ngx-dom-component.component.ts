import { Component, Input, OnChanges, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { NgxDOMComponentContainer } from './classes/NgxDOMComponentContainer';
import { NgxDOMComponent } from './classes/NgxDOMComponent';

@Component({
  selector: 'ngx-dom-component',
  template: `<ng-template #contentContainer></ng-template>`
})
export class NgxDOMComponentComponent implements OnChanges, OnDestroy {
  @Input()
  public config: any;

  @ViewChild('contentContainer', { read: ViewContainerRef })
  public contentContainerRef: ViewContainerRef;

  private ngxDOMComponentContainer: NgxDOMComponentContainer;
  private ngxDOMComponent: NgxDOMComponent | null;

  constructor() {
    this.ngxDOMComponent = null;
    this.ngxDOMComponentContainer = new NgxDOMComponentContainer(this.contentContainerRef);
  }

  ngOnChanges(): void {
    if(this.config) {
      if(this.ngxDOMComponent !== null) {
        this.ngxDOMComponent.destroy();
      }

      this.ngxDOMComponent = this.ngxDOMComponentContainer.create(this.config);
    }
  }

  ngOnDestroy(): void {
    if(this.ngxDOMComponent !== null) {
      this.ngxDOMComponent.destroy();
      this.ngxDOMComponent = null;
    }
  }

}
