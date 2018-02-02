import { ComponentFactoryResolver, ComponentRef, KeyValueChangeRecord, KeyValueDiffer, KeyValueDiffers, SimpleChange, SimpleChanges, ViewContainerRef } from '@angular/core';
import { GetNgxEntryComponentMetaData, MetadataEntry } from './MetadataEntry';


export interface NgxDOMComponentOptions {
  viewContainerRef?: ViewContainerRef; // the parent of the component
  componentType: any; // the component class
  inputs?: { [key: string]: any }; // a list of inputs to provide to the component @Input
  outputs?: { [key: string]: Function }; // a list of output callbacks to provide to link with the component @Output
  index?: number; // the position where to inject your component
}

/**
 * A NgxDOMComponent represent a angular component in the DOM.
 * It allows simple creation, deletion, and moves in the DOM of the element.
 */
export class NgxDOMComponent {
  static componentFactoryResolver: ComponentFactoryResolver = null;
  static differs: KeyValueDiffers = null;

  static normalizeNgxDOMComponentOptions(options: NgxDOMComponentOptions): NgxDOMComponentOptions {
    if (typeof options.viewContainerRef !== 'object') {
      throw new Error(`Invalid viewContainerRef`);
    }

    if (typeof options.componentType !== 'function') {
      throw new Error(`Invalid component`);
    }

    if (typeof options.inputs !== 'object') {
      options.inputs = {};
    }

    if (typeof options.outputs !== 'object') {
      options.outputs = {};
    }

    if ((typeof options.index !== 'number') || Number.isNaN(options.index)) {
      options.index = void 0;
    }

    return options;
  }

  protected _viewContainerRef: ViewContainerRef;
  protected _componentRef: ComponentRef<any>;
  protected _metadata: MetadataEntry[];
  protected _differ: KeyValueDiffer<string, any>;

  constructor(options: NgxDOMComponentOptions) {
    options = NgxDOMComponent.normalizeNgxDOMComponentOptions(options);

    this._viewContainerRef = options.viewContainerRef;

    // create the angular component
    this._componentRef = this._viewContainerRef.createComponent(
      NgxDOMComponent.componentFactoryResolver.resolveComponentFactory(options.componentType),
      options.index
    );

    // extract the metadata of the component
    this._metadata = GetNgxEntryComponentMetaData(options.componentType);

    // create a differ for the instance
    this._differ = NgxDOMComponent.differs
      .find(this._componentRef.instance)
      .create();

    // bind inputs and outputs with the create component's instance
    let metadataEntry: MetadataEntry;
    for (let i = 0, l = this._metadata.length; i < l; i++) {
      metadataEntry = this._metadata[i];
      switch (metadataEntry.metadataName) {
        case 'Input':
          if (options.inputs[metadataEntry.propertyName]) {
            this._componentRef.instance[metadataEntry.propertyName] = options.inputs[metadataEntry.propertyName];
          } else {
            console.warn(`Missing input '${metadataEntry.propertyName}' for ${options.componentType}`);
          }
          break;
        case 'Output':
          if (typeof options.outputs[metadataEntry.propertyName] === 'function') {
            this._componentRef.instance[metadataEntry.propertyName].subscribe(options.outputs[metadataEntry.propertyName]);
          } else {
            console.warn(`Missing output '${metadataEntry.propertyName}' for ${options.componentType}`);
          }
          break;
      }
    }


    this.detectChanges();
  }

  /**
   * The angular view on the parent of the element
   * @return {ViewContainerRef}
   */
  get viewContainerRef(): ViewContainerRef {
    return this._viewContainerRef;
  }

  /**
   * The angular component
   * @return {ComponentRef<any>}
   */
  get componentRef(): ComponentRef<any> {
    return this._componentRef;
  }

  /**
   * The constructor of the element
   * @return {ComponentRef<any>}
   */
  get componentType(): any {
    return this._componentRef.componentType;
  }

  /**
   * The actual DOM element.
   * @return {HTMLElement}
   */
  get element(): HTMLElement {
    return this._componentRef.location.nativeElement;
  }

  /**
   * The instance of the constructor
   * @return {any}
   */
  get instance(): any {
    return this._componentRef.instance;
  }


  insert(index: number = null, viewContainerRef: ViewContainerRef = this._viewContainerRef): this {
    if (typeof index !== 'number') {
      index = this._viewContainerRef.length;
    }

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


  getChanges(): SimpleChanges | null {
    let changes: SimpleChanges | null = null;
    const diff = this._differ.diff(this._componentRef.instance);
    if (diff) {
      diff.forEachItem((change: KeyValueChangeRecord<string, any>) => {
        let metadataEntry: MetadataEntry;
        for (let i = 0, l = this._metadata.length; i < l; i++) {
          metadataEntry = this._metadata[i];
          if ((metadataEntry.propertyName === change.key) && (metadataEntry.metadataName === 'Input')) { // check that metadata exists for this change
            if (changes === null) {
              changes = {};
            }
            changes[change.key] = new SimpleChange(change.previousValue, change.currentValue, false);
            break;
          }
        }
      });
    }
    return changes;
  }

  detectChanges(): void {
    if (typeof this._componentRef.instance.ngOnChanges === 'function') {
      const changes: SimpleChanges = this.getChanges();
      if (changes) {
        this._componentRef.instance.ngOnChanges(changes);
      }
    }
  }

}