class ObjectManager {

    activeObject: any = null;
    subscribers: Function[] = [];
    subscribe(cb: Function) {
        this.subscribers.push(cb);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== cb);
        }
    }

    getSnapshot() {
        return this.activeObject;
    }

    setActiveObject(obj: any) {
        this.activeObject = obj;
        this.subscribers.forEach(cb => cb());
    }


}

export default ObjectManager;