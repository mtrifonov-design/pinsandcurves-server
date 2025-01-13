import React, { useContext, useSyncExternalStore } from 'react';
import { Button } from '@mtrifonov-design/pinsandcurves-specialuicomponents'
import CommonUIContainer from '../UIToolBox/CommonUIContainer';
import ObjectManagerContainer, { ObjectManagerContext } from '../UIToolBox/ObjectManagerContainer';
import ObjectDisplay from '../UIToolBox/ObjectPropertyDisplay';
import UIPropManager from '../UIToolBox/UIPropManager';
import { CommonUIContext } from '../UIToolBox/CommonUIContainer';
import { ExtensionInitContext } from '../../types';

function UIPropDisplay() {
    const {id, uipm} = useContext(ObjectManagerContext) as {id: string, uipm: UIPropManager};
    const properties = useSyncExternalStore(uipm.subscribe.bind(uipm), uipm.getSnapshot.bind(uipm));
    const initCtx = useContext(CommonUIContext) as ExtensionInitContext;
    const { enable } = properties;
    const isEnabled = enable.value === 1;
    return <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: '10px',
    }}>
        enabled:
        <input type="checkbox" checked={isEnabled} onChange={(e) => {
            uipm.setValue('enable', e.target.checked ? 1 : 0);
            const playheadPos = initCtx.getProject().timelineData.playheadPosition;
            initCtx.projectTools.updatePlayheadPosition(playheadPos);
        }}></input>
    </div>

}


function Example({ctx, activeStore, objectManager} : any) {
    return <div>
        <CommonUIContainer ctx={ctx} activeStore={activeStore}>
            <ObjectManagerContainer objectManager={objectManager}>
                <div style={{marginBottom: "10px"}}><strong style={{color:"var(--gray7)"}}>Zigzagify</strong></div>
                <UIPropDisplay />
                <ObjectDisplay/>
            </ObjectManagerContainer>
        </CommonUIContainer>
    </div>
}

export default Example;