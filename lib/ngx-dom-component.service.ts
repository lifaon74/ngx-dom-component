import { Injectable, ComponentFactoryResolver, KeyValueDiffers, ViewContainerRef } from '@angular/core';
import { NgxDOMComponent, NgxDOMComponentContainer, NgxDOMComponentCreateOptions } from './ngx-dom-component.class';


@Injectable()
export class NgxDOMComponentService {

  constructor(componentFactoryResolver: ComponentFactoryResolver,
              differs: KeyValueDiffers) {
    NgxDOMComponent.componentFactoryResolver = componentFactoryResolver;
    NgxDOMComponent.differs = differs;
  }

  init() {
    // not empty
  }

  createContainer(viewContainerRef: ViewContainerRef): NgxDOMComponentContainer {
    return new NgxDOMComponentContainer(viewContainerRef);
  }

  createComponent(options: NgxDOMComponentCreateOptions): NgxDOMComponent {
    return new NgxDOMComponent(options);
  }
}
