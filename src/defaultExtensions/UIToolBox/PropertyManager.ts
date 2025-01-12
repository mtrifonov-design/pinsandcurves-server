import { ExtensionInitContext } from "../../types"
import { PinsAndCurvesProject } from "../../types"
import { ProjectDataStructure } from "@mtrifonov-design/pinsandcurves-external";

type Signal = ProjectDataStructure.Signal;
type ContinuousSignal = ProjectDataStructure.ContinuousSignal;

type Property = {
    type: "numeric" | "string";
    fallbackValue: number | string;
    currentValue?: number | string;
    signalConnected?: boolean;
    signalName?: string;
    propertyName?: string;
    propertyId: string;
}



class PropertyManager {
    getSignalValue: (signalName: string, frame?: number) => number | string | undefined;
    getProject: () => PinsAndCurvesProject;
    constructor(initCtx: ExtensionInitContext) {
        const extensionStore = initCtx.extensionStore;
        // // console.log("Extension store", extensionStore);
        this.properties = "properties" in extensionStore ? extensionStore.properties : {};
        this.getSignalValue = initCtx.getSignalValue;
        this.getProject = initCtx.getProject;
        initCtx.onUpdate(() => {
            this.updateProperties();
            extensionStore.properties = this.properties;
            this.subscribers.forEach(cb => cb());
        });
    };
    properties: {[key: string]: Property} = {};
    registerProperty(property: Property, overwrite?: boolean) {
        const propertyId = property.propertyId;
        if (this.properties[propertyId] && !overwrite) {
            return;
        }
        this.properties = {
            ...this.properties,
            [propertyId]: property,
        }
    };
    associateSignal(propertyId: string, signalName: string) {
        const property = this.properties[propertyId];
        this.properties = {
            ...this.properties,
            [propertyId]: {
                ...property,
                signalName,
            },
        };
    };
    disassociateSignal(propertyId: string) {
        const property = this.properties[propertyId];
        this.properties = {
            ...this.properties,
            [propertyId]: {
                ...property,
                signalName: undefined,
            },
        };
    }


    updateProperties() {
        Object.keys(this.properties).forEach(propertyId => {
            let property = this.properties[propertyId];
            const isConnected = this.computeIsConnected(propertyId);
            this.properties = {
                ...this.properties,
                [propertyId]: {
                    ...property,
                    signalConnected: isConnected,
                },
            };
            property = this.properties[propertyId];
            const currentValue = this.computeValue(propertyId);
            this.properties = {
                ...this.properties,
                [propertyId]: {
                    ...property,
                    currentValue,
                },
            };
        });
        this.subscribers.forEach(sub => sub());
    }

    computeIsConnected(propertyId: string) : boolean {
        const property = this.properties[propertyId];
        const signalName = property.signalName;
        if (!signalName) {
            return false;
        } 
        const project = this.getProject();
        const signalId = project.orgData.signalIds.find(id => project.orgData.signalNames[id] === signalName);
        if (signalId) {
            return true;
        }
        return false;
    };


    computeValue(propertyId: string) {
        const property = this.properties[propertyId];
        const signalConnected = property.signalConnected;
        const signalName = property.signalName;
        if (!signalConnected || !signalName) {
            return property.fallbackValue;
        }
        const signalValue = this.getSignalValue(signalName);
        const type = property.type;
        if (type === 'numeric') {
            return Number(signalValue || property.fallbackValue);
        } else {
            return String(signalValue || property.fallbackValue);
        }
    };


    getValue(key: string) {
        const currentValue = this.properties[key].currentValue;
        if (!currentValue) {
            return this.properties[key].fallbackValue;
        }
        return currentValue;
    };

    remapValue(key: string, range: [number, number]) {
        const property = this.properties[key];
        const type = property.type;
        let currentValue = this.getValue(key);
        if (type !== 'numeric') {
            return currentValue;
        }
        currentValue = currentValue as number; 
        const signalConnected = property.signalConnected;
        const signalName = property.signalName;
        if (!signalConnected || !signalName) {
            return currentValue;
        }
        const [min, max] = range;
        const project = this.getProject();
        const signalId = project.orgData.signalIds.find(id => project.orgData.signalNames[id] === signalName);
        let signal = project.signalData[signalId as string] as Signal;
        const signalType = signal.type;
        if (signalType !== 'continuous') {
            return currentValue;
        }
        signal = signal as ContinuousSignal;
        const [smin,smax] = signal.range;
        const relative = (currentValue - smin) / (smax - smin);
        const remapped = min + relative * (max - min);
        return remapped;
    }

    remapValueIf01(key: string, range: [number, number]) {
        const property = this.properties[key];
        const type = property.type;
        // console.log(property)
        let currentValue = this.getValue(key);
        if (type !== 'numeric') {
            return currentValue;
        }
        currentValue = currentValue as number; 
        const signalConnected = property.signalConnected;
        const signalName = property.signalName;
        if (!signalConnected || !signalName) {
            return currentValue;
        }
        const [min, max] = range;
        // console.log(min,max)
        const project = this.getProject();
        const signalId = project.orgData.signalIds.find(id => project.orgData.signalNames[id] === signalName);
        let signal = project.signalData[signalId as string] as Signal;
        const signalType = signal.type;
        if (signalType !== 'continuous') {
            return currentValue;
        }
        signal = signal as ContinuousSignal;
        const [smin,smax] = signal.range;
        if (smin !== 0 || smax !== 1) {
            return currentValue;
        }

        // console.log(smin,smax,min,max)
        const relative = (currentValue - smin) / (smax - smin);
        const remapped = min + relative * (max - min);
        return remapped;
    }

    getSignalConnected(key: string) {
        return this.properties[key].signalConnected;
    }

    subscribers: Function[] = [];
    subscribe(cb: Function) {
        this.subscribers.push(cb);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== cb);
        }
    }
    getSnapshot() {
        return this.properties;
    }

}


function createProperty(propertyId: string, propertyName: string, type: "numeric" | "string", fallbackValue: number | string) {
    return {
        type,
        fallbackValue,
        propertyName,
        propertyId,
    }
}

export { createProperty };

export default PropertyManager;