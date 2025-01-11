import React, { createContext, useSyncExternalStore } from 'react';
import ObjectManager from './ObjectManager';

const ObjectManagerContext = createContext<ObjectManager | null>(null);
function ObjectManagerContainer({ objectManager, children }: {
    objectManager: ObjectManager;
    children?: React.ReactNode;
}) {
    const activeObject = useSyncExternalStore(objectManager.subscribe.bind(objectManager), objectManager.getSnapshot.bind(objectManager));
    return <ObjectManagerContext.Provider value={activeObject}>
                {children ? children : null}
        </ObjectManagerContext.Provider>;
}

export { ObjectManagerContext };
export default ObjectManagerContainer;