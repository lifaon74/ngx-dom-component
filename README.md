### NGX-DOM-Component

Provide component injection and manipulation in DOM for your angular 5+ application :

Allow you to inject component into the DOM including inputs/outputs. And then manipulating this component by removing/deleting it from the DOM.

```
npm i ngx-dom-component --save
```

### NgxDOMComponentModule

Import `NgxDOMComponentModule` into your root module.

### Example
```ts
import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core'
import { NgxDOMComponentService, NgxDOMComponentCreateOptions, NgxDOMComponent } from 'ngx-dom-component';

@Component({
  selector: 'my-component',
  template: '<span>{{ message }}</span>'
})
export class MyComponent {
    @Input()
    public message;
}

@Component({
  selector: 'my-app',
  template: `
    <div class="container">
      <ng-template #contentContainer></ng-template>
    </div>
  `
})
export class AppComponent implements OnInit {
  @ViewChild('contentContainer', { read: ViewContainerRef })
  public contentContainerRef: ViewContainerRef;

  constructor(private ngxDOMComponentService: NgxDOMComponentService) {}

  ngOnInit() {
    this.ngxDOMComponentService.init(); // DO NOT FORGET TO INIT !!!!
    let child: NgxDOMComponent  = this.ngxDOMComponentService.create({
      viewContainerRef: contentContainerRef,
      componentType: MyComponent,
      inputs: {
        message: 'Hello World!'
      }
    });

    setTimeout(() => {
      child.destroy();
    }, 5000);
  }
}
```

### NgxDOMComponentOptions
```ts
interface NgxDOMComponentOptions {
  viewContainerRef?: ViewContainerRef; // the parent of the component
  componentType: any; // the component class
  inputs?: { [key: string] : any }; // a list of inputs to provide to the component @Input
  outputs?: { [key: string] : Function }; // a list of output callbacks to provide to link with the component @Output
  index?: number; // the position where to inject your component
}
```

### NgxDOMComponentService

Into your app.component.ts file, you **must** include the NgxDOMComponentService and then call `init`, or at least before any calls to the ngx-dom-component methods/constructor, etc...

```ts
createContainer(viewContainerRef: ViewContainerRef): NgxDOMComponentContainer;
```
Create a new NgxDOMComponentContainer.

```ts
createComponent(options: NgxDOMComponentCreateOptions): NgxDOMComponent;
```
Create a new NgxDOMComponent and inject it onto the dom.

### NgxEntryComponent (Decorator)
In some case (ex: when compiling in AOT mode) the metadata properties are lost and the binding of the inputs/outputs becomes impossible. As a result you wont see your inputs changes (ngOnChanges) and the outputs wont be binded. If you encounter this situation, you can use the decorator `NgxEntryComponent` and provide directly the list of properties as inputs and outputs
```ts
@NgxEntryComponent({
  inputs: ['message']
  outputs: []
})
@Component({
  selector: 'my-component',
  template: 'some html'
})
export class MyComponent {
    @Input()
    public message: string;
    //...
}
```
### NgxDOMComponentContainer
Create a wrapper for the ViewContainerRef, allowing you not providing the `viewContainerRef` attribute of `NgxDOMComponentCreateOptions`.
```ts
class NgxDOMComponentContainer {
  viewContainerRef: ViewContainerRef;
  constructor(viewContainerRef: ViewContainerRef);
  create(options: NgxDOMComponentCreateOptions): NgxDOMComponent;
}
```
Example:
```ts
this.ngxDOMComponentContainer = new NgxDOMComponentContainer(this.contentContainerRef);
this.ngxDOMComponentContainer.create({
  componentType: MyComponent,
  inputs: {
    message: 'Hello World!'
  }
});
```

### NgxDOMComponent
Create and inject a Angular 5+ Component into the DOM.
```ts
class NgxDOMComponent {
  constructor(options: NgxDOMComponentCreateOptions);

  readonly viewContainerRef: ViewContainerRef; // the parent container
  readonly componentRef: ComponentRef<any>; // the component ref
  readonly componentType: any; // the component class
  readonly element: HTMLElement; // the dom element
  readonly instance: any; // the instance of the constructor

  insert(index?: number, viewContainerRef?: ViewContainerRef): this; // insert the component at a specific index in viewContainerRef
  move(index?: number, viewContainerRef?: ViewContainerRef): this;  // move the component at a specific index in viewContainerRef
  detach(): this; // detach the component from the dom
  destroy(): this; // destroy the component

  detectChanges(): void; // manually trigger a changes detection, calling ngOnChanges if some elements changed
}
```

### NgxDOMComponentComponent
```html
<ngx-dom-component
  [config]="{
    component: myComponent,
    inputs: {
      message: 'Hello World!'
    }
  }"
></ngx-dom-component>
```
Inject an angular 2+ component. The config is the same as `NgxDOMComponentOptions` except that you don't need to provide a container.

