import React, { createContext, useSyncExternalStore } from 'react';
import { Button } from '@mtrifonov-design/pinsandcurves-specialuicomponents'
import type { ExtensionInitContext } from '../../types';
import ActiveStore from './ActiveStore';


const CommonUIContext = createContext<ExtensionInitContext | null>(null);

function CommonUIContainer({ ctx, activeStore, children }: {
    ctx: ExtensionInitContext;
    activeStore: ActiveStore;

    children?: React.ReactNode;
}) {
    // console.log("CommonUIContainer", ctx);
    const isActive = useSyncExternalStore(activeStore.subscribe.bind(activeStore), activeStore.getSnapshot.bind(activeStore));
    return isActive ?
            <div style={{
                display: isActive ? 'block' : 'none',
                backgroundColor: 'var(--gray3)',
                color: 'var(--gray6)',
                borderRadius: 'var(--borderRadiusSmall)',
                padding: '10px',
                marginTop: '10px',
            }}>
                <CommonUIContext.Provider value={ctx}>
                    {children ? children : null}
                </CommonUIContext.Provider>
            </div>
        : null;
}

export { CommonUIContext };
export default CommonUIContainer;