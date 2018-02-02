import {
  ViewContainerRef, ComponentRef, ComponentFactoryResolver, ComponentFactory, KeyValueDiffers,
  KeyValueDiffer, KeyValueChangeRecord, SimpleChange, SimpleChanges
} from '@angular/core';



export interface NgxDOMComponentCreateOptions {
  viewContainerRef?: ViewContainerRef; // the parent of the component
  componentType: any; // the component class
  inputs?: { [key: string] : any }; // a list of inputs to provide to the component @Input
  outputs?: { [key: string] : Function }; // a list of output callbacks to provide to link with the component @Output
  index?: number; // the position where to inject your component
}

export class NgxDOMComponentContainer {
  public viewContainerRef: ViewContainerRef;
  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef;
  }

  create(options: NgxDOMComponentCreateOptions): NgxDOMComponent {
    options.viewContainerRef = this.viewContainerRef;
    return new NgxDOMComponent(options);
  }
}

export class NgxDOMComponent {
  static componentFactoryResolver: ComponentFactoryResolver = null;
  static differs: KeyValueDiffers = null;

  static checkNgxDOMComponentCreateOptions(options: NgxDOMComponentCreateOptions): NgxDOMComponentCreateOptions {
    if(typeof options.viewContainerRef !== 'object') throw new Error('Invalid viewContainerRef');
    if(typeof options.componentType !== 'function') throw new Error('Invalid component');
    if(typeof options.inputs !== 'object')  options.inputs = {};
    if(typeof options.outputs !== 'object') options.outputs = {};
    if(typeof options.index !== 'number')   options.index = void 0;
    return options;
  }

  static injectPropertyBinds(
    componentRef: any,
    componentType: any,
    inputs: { [key: string] : any } = {},
    outputs: { [key: string] : Function } = {}
  ) {

    const handledProperties: string[] = [];

    function handlePropMetadata(propertyName: string, decoratorName: string): void {
      const key: string = propertyName + '-' + decoratorName;
      if(handledProperties.indexOf(key) === -1) {
        handledProperties.push(key);
        switch(decoratorName) {
          case '@Input':
            if(inputs[propertyName]) {
              componentRef.instance[propertyName] = inputs[propertyName];
            } else {
              console.warn('Missing input [' + propertyName + '] for ' + componentType.name);
            }
            break;
          case '@Output':
            if(typeof outputs[propertyName] === 'function') {
              componentRef.instance[propertyName].subscribe(outputs[propertyName]);
            } else {
              console.warn('Missing output (' + propertyName + ') for ' + componentType.name);
            }
            break;
        }
      }
    }

    // http://stackoverflow.com/questions/34465214/access-meta-annotation-inside-class-typescript
    let propMetadata: any = (Reflect as any).getOwnMetadata('propMetadata', componentType);
    if(propMetadata) {
      for(const prop in propMetadata) {
        if(propMetadata[prop].length > 0) {
          propMetadata[prop].forEach((metadata: any) => {
            handlePropMetadata(prop, metadata.toString());
          });
        }
      }
    }

    propMetadata = componentType['__prop__metadata__'];
    if(propMetadata) {
      for(const prop in propMetadata) {
        if(propMetadata[prop].length > 0) {
          propMetadata[prop].forEach((metadata: any) => {
            handlePropMetadata(prop, '@' + metadata.ngMetadataName);
          });
        }
      }
    }
  }


  private _viewContainerRef: ViewContainerRef;
  private _componentRef: ComponentRef<any>;
  private _differ: KeyValueDiffer<string, any>;

  constructor(options: NgxDOMComponentCreateOptions) {
    NgxDOMComponent.checkNgxDOMComponentCreateOptions(options);

    this._viewContainerRef = options.viewContainerRef;

    let componentFactory: ComponentFactory<any> = NgxDOMComponent.componentFactoryResolver.resolveComponentFactory(options.componentType);
    this._componentRef = this._viewContainerRef.createComponent(componentFactory, options.index);

    this.setupDetectChange();
    NgxDOMComponent.injectPropertyBinds(this._componentRef, options.componentType, options.inputs, options.outputs);

    this.detectChanges();
  }

  get viewContainerRef(): ViewContainerRef {
    return this._viewContainerRef;
  }

  get componentRef(): ComponentRef<any> {
    return this._componentRef;
  }

  get componentType(): any {
    return this._componentRef.componentType;
  }

  get element(): HTMLElement {
    return this._componentRef.location.nativeElement;
  }

  get instance(): any {
    return this._componentRef.instance;
  }


  insert(index: number = null, viewContainerRef: ViewContainerRef = this._viewContainerRef): this {
    if(typeof index !== 'number') index = this._viewContainerRef.length;
    this._viewContainerRef = viewContainerRef;
    this._viewContainerRef.insert(this._componentRef.hostView, index);
    return this;
  }

  move(index: number = 0, viewContainerRef: ViewContainerRef = this._viewContainerRef): this {
    this._viewContainerRef = viewContainerRef;
    this._viewContainerRef.move(this._componentRef.hostView, index);
    return this;
  }

  detach(): this {
    this._viewContainerRef.detach(this._viewContainerRef.indexOf(this._componentRef.hostView));
    return this;
  }

  destroy(): this {
    this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._componentRef.hostView));
    return this;
  }


  getChanges(): SimpleChanges  {
    let changes: SimpleChanges = null;
    let diff = this._differ.diff(this._componentRef.instance);
    if(diff) {
      diff.forEachItem((change: KeyValueChangeRecord<string, any>) => {
        if(changes === null) changes = {};
        changes[change.key] = new SimpleChange(change.previousValue, change.currentValue, false);
      });
    }
    return changes;
  }

  detectChanges() {
    if(typeof this._componentRef.instance.ngOnChanges === 'function') {
      let changes: any = this.getChanges();
      if(changes) {
        this._componentRef.instance.ngOnChanges(changes);
      }
    }
  }

  private setupDetectChange() {
    this._differ = NgxDOMComponent.differs
      .find(this._componentRef.instance)
      .create();
  }


}
