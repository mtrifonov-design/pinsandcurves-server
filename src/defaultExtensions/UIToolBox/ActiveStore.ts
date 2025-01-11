
class ActiveStore {
    isActive = false;
    callbacks : Function[] = [];
    constructor(defaultValue = false) {
        this.isActive = defaultValue;
    }

    setActive(value : boolean) {
        this.isActive = value;
        this.callbacks.forEach(cb => cb());
    }

    

    getSnapshot() {
        return this.isActive;
    }

    subscribe(callback : Function) {
        this.callbacks.push(callback);
        return () => {
            this.callbacks = this.callbacks.filter(cb => cb !== callback);
        }
    }

}


export default ActiveStore;