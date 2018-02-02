export const CONST_PROP_METADATA: string = '__prop__metadata__';

/**
 * This file provide functions that allow user to register/retrieve metadata on an angular component.
 */

export interface MetadataEntry {
  propertyName: string;
  metadataName: string;
}

export function SetNgxEntryComponentMetaData(target: any, metadataEntries: MetadataEntry[]): void {
  if (!(CONST_PROP_METADATA in target)) {
    Object.defineProperty(target, CONST_PROP_METADATA, {
      value: {},
    });
  }

  const metadataList: { [key: string]: any[] } = target[CONST_PROP_METADATA];

  let metadataEntry: MetadataEntry;
  for (let i = 0, l = metadataEntries.length; i < l; i++) {
    metadataEntry = metadataEntries[i];

    if (!Array.isArray(metadataList[metadataEntry.propertyName])) {
      metadataList[metadataEntry.propertyName] = [];
    }

    const metadataPropertyList: any[] = metadataList[metadataEntry.propertyName];

    // avoid duplicated metaData
    let j = 0, s = metadataPropertyList.length;
    for (; j < s; j++) {
      if (metadataPropertyList[j].ngMetadataName === metadataEntry.metadataName) {
        break;
      }
    }

    if(j === s) {
      metadataPropertyList.push({
        ngMetadataName: metadataEntry.metadataName
      });
    }
  }
}

export function GetNgxEntryComponentMetaData(target: any): MetadataEntry[] {
  const metadataEntries: MetadataEntry[] = [];

  let metadataList: any = (Reflect as any).getOwnMetadata('propMetadata', target);
  if(metadataList) {
    for(const propertyName in metadataList) {
      if(metadataList[propertyName].length > 0) {
        metadataList[propertyName].forEach((metadata: any) => {
          let metadataName: string = metadata.toString();
          if(metadataName.startsWith('@')) {
            metadataName = metadataName.substring(1);
          }
          metadataEntries.push({
            propertyName: propertyName,
            metadataName: metadataName
          });
        });
      }
    }
  }

  metadataList = target['__prop__metadata__'];
  if(metadataList) {
    for(const propertyName in metadataList) {
      if(metadataList[propertyName].length > 0) {
        metadataList[propertyName].forEach((metadata: any) => {
          metadataEntries.push({
            propertyName: propertyName,
            metadataName: metadata.ngMetadataName
          });
        });
      }
    }
  }

  return metadataEntries;
}

