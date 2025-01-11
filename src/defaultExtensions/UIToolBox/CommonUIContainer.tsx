import React, { createContext, useSyncExternalStore } from 'react';
import { Button } from '@mtrifonov-design/pinsandcurves-specialuicomponents'
import type { ExtensionInitContext } from '../../types';
import ActiveStore from './ActiveStore';
import ObjectManager from './ObjectManager';



function CommonUIContainer({ ctx, activeStore, children }: {
    ctx: ExtensionInitContext;
    activeStore: ActiveStore;

    children?: React.ReactNode;
}) {
    const isActive = useSyncExternalStore(activeStore.subscribe.bind(activeStore), activeStore.getSnapshot.bind(activeStore));
    return isActive ?
            <div style={{
                display: isActive ? 'block' : 'none',
                backgroundColor: 'var(--gray3)',
            }}>
                {children ? children : null}
            </div>
        : null;
}

export default CommonUIContainer;