import { MetadataEntry, SetNgxEntryComponentMetaData } from './MetadataEntry';

export interface NgxEntryComponentOptions {
  inputs?: string[];
  outputs?: string[];
}

/**
 * Decorator which allows user to manually define inputs and outputs
 * @param {NgxEntryComponentOptions} options
 * @return {any}
 * @constructor
 */
export function NgxEntryComponent(options: NgxEntryComponentOptions): any {

  if (options.inputs === void 0) {
    options.inputs = [];
  }

  if (!Array.isArray(options.inputs)) {
    throw new TypeError(`Expected string[] as options.inputs`);
  }

  if (options.outputs === void 0) {
    options.outputs = [];
  }

  if (!Array.isArray(options.outputs)) {
    throw new TypeError(`Expected string[] as options.outputs`);
  }


  return (target: any): void => {
    const metadataEntries: MetadataEntry[] = [];

    let propertyName: string;
    for (let i = 0, l = options.inputs.length; i < l; i++) {
      propertyName = options.inputs[i];
      if(typeof propertyName === 'string') {
        metadataEntries.push({
          propertyName: propertyName,
          metadataName: 'Input',
        });
      } else {
        throw new TypeError(`Expected string[] as options.inputs[${i}]`);
      }
    }

    for (let i = 0, l = options.outputs.length; i < l; i++) {
      propertyName = options.outputs[i];
      if(typeof propertyName === 'string') {
        metadataEntries.push({
          propertyName: propertyName,
          metadataName: 'Output',
        });
      } else {
        throw new TypeError(`Expected string[] as options.outputs[${i}]`);
      }
    }

    SetNgxEntryComponentMetaData(target, metadataEntries);
  };
}
