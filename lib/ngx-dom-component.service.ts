import { Injectable, ComponentFactoryResolver, KeyValueDiffers, ViewContainerRef } from '@angular/core';
import { NgxDOMComponent, NgxDOMComponentOptions } from './classes/NgxDOMComponent';
import { NgxDOMComponentContainer } from './classes/NgxDOMComponentContainer';


/**
 * The service must be called before anything because NgxDOMComponent requires :
 *  ComponentFactoryResolver and KeyValueDiffers
 */

@Injectable()
export class NgxDOMComponentService {

  constructor(componentFactoryResolver: ComponentFactoryResolver,
              differs: KeyValueDiffers) {
    NgxDOMComponent.componentFactoryResolver = componentFactoryResolver;
    NgxDOMComponent.differs = differs;
  }

  init(): void {
    // not empty
  }

  createContainer(viewContainerRef: ViewContainerRef): NgxDOMComponentContainer {
    return new NgxDOMComponentContainer(viewContainerRef);
  }

  createComponent(options: NgxDOMComponentOptions): NgxDOMComponent {
    return new NgxDOMComponent(options);
  }
}
