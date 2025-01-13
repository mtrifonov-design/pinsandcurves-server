import { ExtensionInitContext } from "../../types"

type Property = {
    type: "numeric" | "string";
    value: number | string;
    propertyName?: string;
    propertyId: string;
}

class UIPropManager {
    store: any;
    constructor(initCtx: ExtensionInitContext, id?: string) {
        id = id? id : "default";
        const store = initCtx.extensionStore[id] ? initCtx.extensionStore[id] : {};
        initCtx.extensionStore[id] = store;
        this.store = store;
        this.properties = "uiprops" in store ? store.uiprops : {};
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

    setValue(key: string, value: number | string) {
        this.properties = {
            ...this.properties,
            [key]: {
                ...this.properties[key],
                value,
            }
        }
        this.store.uiprops = this.properties;
        this.subscribers.forEach(cb => cb());
    }

    getValue(key: string) {
        return this.properties[key].value;
    };

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


function createProperty(propertyId: string, propertyName: string, type: "numeric" | "string", value: number | string) {
    return {
        type,
        value,
        propertyName,
        propertyId,
    }
}

export { createProperty };

export default UIPropManager;