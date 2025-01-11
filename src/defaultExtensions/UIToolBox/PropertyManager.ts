import { ExtensionInitContext } from "../../types"
import { PinsAndCurvesProject } from "../../types"

import { ProjectDataStructure } from '@mtrifonov-design/pinsandcurves-external'




type ContinuousSignal = ProjectDataStructure.ContinuousSignal;

type NumericSignalProperty = {
    propertyName: string,
    type: 'numeric',
    signalAssociated: true,
    signalName: string,
    range: [number, number],
    rangeType: 'inherit' | 'remap' | 'remap-flex',
    staticValue: number,
    currentValue: number,
}

type NumericStaticProperty = {
    propertyName: string,
    type: 'numeric',
    signalAssociated: false,
    staticValue: number,
    range: [number, number],
    rangeType: 'inherit' | 'remap' | 'remap-flex',
    currentValue: number,
}


type NumericProperty =
    | NumericSignalProperty
    | NumericStaticProperty

type StringSignalProperty = {
    propertyName: string,
    type: 'string',
    signalAssociated: true,
    signalName: string,
    staticValue: string,
    currentValue: string,
}

type StringStaticProperty = {
    propertyName: string,
    type: 'string',
    signalAssociated: false,
    staticValue: string,
    currentValue: string,
}

type StringProperty =
    | StringSignalProperty
    | StringStaticProperty

type Property =
    | NumericProperty
    | StringProperty

class PropertyManager {
    properties: { [key: string]: Property } = {};
    subscribers : Function[] = [];

    getSignalValue: (signalName: string, frame?: number) => number | string | undefined;
    getProject: () => PinsAndCurvesProject;
    constructor(initCtx: ExtensionInitContext, extensionStore: any) {
        this.properties = extensionStore.properties || {};
        this.getSignalValue = initCtx.getSignalValue;
        this.getProject = initCtx.getProject;
        initCtx.onUpdate(() => {
            this.updateProperties();
            extensionStore.properties = this.properties;
            this.subscribers.forEach(cb => cb());
        });
    };

    subscribe(cb: Function) {
        this.subscribers.push(cb);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== cb);
        }
    }

    getSnapshot() {
        return this.properties;
    }

    updateProperties() {
        let newprops : { [key: string]: Property } = {};
        Object.keys(this.properties).forEach((key) => {
            const property = this.properties[key];
            if (property.type === 'numeric') {
                if (property.signalAssociated) {
                    if (property.rangeType === 'inherit') {
                        const project = this.getProject();
                        const signalId = Object.keys(project.orgData.signalNames).find(key => project.orgData.signalNames[key] === (property as NumericSignalProperty).signalName);
                        if (!signalId) {
                            return;
                        }
                        const type = project.orgData.signalTypes[signalId];
                        if (type === 'continuous') {
                            const signalRange = (project.signalData[signalId] as ContinuousSignal).range;
                            const cloned = [signalRange[0], signalRange[1]] as [number, number];
                            newprops = {
                                ...this.properties,
                                [key]: {
                                    ...property,
                                    range: cloned,
                                },
                            };
                        }

                    }

                }
            }

            const currentValue = this.getValue(key) as any;
            newprops = {
                ...this.properties,
                [key]: {
                    ...property,
                    currentValue,
                },
            };

        });
        this.properties = newprops;
    }

    registerProperty(propertyId: string, property: Property) {
        this.properties = {
            ...this.properties,
            [propertyId]: property,
        };
    };

    associateSignal(propertyId: string, signalName: string) {
        const property = this.properties[propertyId];
        if (property.type === 'numeric') {
            this.properties = {
                ...this.properties,
                [propertyId]: {
                    ...property,
                    signalAssociated: true,
                    signalName,
                },
            };
        }
    }

    disassociateSignal(propertyId: string) {
        const property = this.properties[propertyId];
        this.properties = {
            ...this.properties,
            [propertyId]: {
                ...property,
                signalAssociated: false,
            },
        };

    }

    remapRange(propertyId: string, range: [number, number]) {
        const property = this.properties[propertyId];
        if (!property) {
            return;
        }
        if (property.type === 'numeric') {
            const allowed = property.rangeType === 'remap-flex';
            if (allowed) {
                this.properties = {
                    ...this.properties,
                    [propertyId]: {
                        ...property,
                        range,
                    },
                };
            }
        }
    }

    setValue(propertyId: string, value: number | string) {
        const property = this.properties[propertyId];
        if (property.type === 'numeric') {
            if (property.signalAssociated) {
                return;
            }
            this.properties = {
                ...this.properties,
                [propertyId]: {
                    ...property,
                    staticValue: Number(value),
                },
            };
        } else {
            if (property.signalAssociated) {
                return;
            }
            this.properties = {
                ...this.properties,
                [propertyId]: {
                    ...property,
                    staticValue: String(value),
                },
            };
        }
    }


    getValue(propertyId: string, frame?: number) {
        const property = this.properties[propertyId];
        if (property.type === 'numeric') {
            if (property.signalAssociated) {
                const computedValue = Number(this.getSignalValue((property as NumericSignalProperty).signalName, frame));
                if (isNaN(computedValue)) {
                    return property.staticValue;
                }
                const [min, max] = property.range;
                const project = this.getProject();
                const signalId = Object.keys(project.orgData.signalNames).find(key => project.orgData.signalNames[key] === (property as NumericSignalProperty).signalName);
                if (!signalId) {
                    return property.staticValue;
                }
                const type = project.orgData.signalTypes[signalId];
                if (type !== 'continuous') {
                    return property.staticValue;
                }
                const signalRange = (project.signalData[signalId] as ContinuousSignal).range;
                const relative = (computedValue - signalRange[0]) / (signalRange[1] - signalRange[0]);
                return min + relative * (max - min);
            } else {
                return property.staticValue;
            }
        } else {
            if (property.signalAssociated) {
                const computedValue = this.getSignalValue((property as StringSignalProperty).signalName, frame);
                return String(computedValue);
            } else {
                return property.staticValue;
            }
        }
    };



}

export default PropertyManager;