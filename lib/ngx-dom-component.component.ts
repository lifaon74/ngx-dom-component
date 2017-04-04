import { Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { NgxDOMComponent, NgxDOMComponentContainer } from './ngx-dom-component.class';

@Component({
  moduleId: module.id,
  selector: 'ngx-dom-component',
  template: `<ng-template #contentContainer></ng-template>`
})
export class NgxDOMComponentComponent {
  @Input() config: any;

  @ViewChild('contentContainer', { read: ViewContainerRef }) contentContainerRef: ViewContainerRef;

  private ngxDOMComponentContainer: NgxDOMComponentContainer;
  private ngxDOMComponent: NgxDOMComponent;

  constructor() {
    this.ngxDOMComponentContainer = new NgxDOMComponentContainer(this.contentContainerRef);
  }

  ngOnChanges() {
    if(this.config) {
      if(this.ngxDOMComponent) {
        this.ngxDOMComponent.destroy();
      }

      this.ngxDOMComponent = this.ngxDOMComponentContainer.create(this.config);
    }
  }
}
