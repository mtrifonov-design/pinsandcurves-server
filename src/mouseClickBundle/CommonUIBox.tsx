import React, { useContext, useSyncExternalStore } from 'react';
import { Button } from '@mtrifonov-design/pinsandcurves-specialuicomponents'
import CommonUIContainer from '../defaultExtensions/UIToolBox/CommonUIContainer';
import ObjectManagerContainer, { ObjectManagerContext } from '../defaultExtensions/UIToolBox/ObjectManagerContainer';
import ObjectDisplay from '../defaultExtensions/UIToolBox/ObjectPropertyDisplay';
import { CommonUIContext } from '../defaultExtensions/UIToolBox/CommonUIContainer';
import { ExtensionInitContext } from '../types';
import UIPropManager from '../defaultExtensions/UIToolBox/UIPropManager';

function UIPropDisplay() {
    const {id, uipm} = useContext(ObjectManagerContext) as {id: string, uipm: UIPropManager};
    const properties = useSyncExternalStore(uipm.subscribe.bind(uipm), uipm.getSnapshot.bind(uipm));
    const initCtx = useContext(CommonUIContext) as ExtensionInitContext;
    const { enable, anchor } = properties;

    const isEnabled = enable.value === 1;
    const anchorValue = anchor.value;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
        }}>
            {/* Checkbox row */}
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '10px',
            }}>
                show path:
                <input 
                    type="checkbox" 
                    checked={isEnabled} 
                    onChange={(e) => {
                        uipm.setValue('enable', e.target.checked ? 1 : 0);
                        const playheadPos = initCtx.getProject().timelineData.playheadPosition;
                        initCtx.projectTools.updatePlayheadPosition(playheadPos);
                    }}
                />
            </div>

            {/* Select row for Anchor */}
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '10px',
            }}>
                anchor:
                <select 
                    value={anchorValue}
                    onChange={(e) => {
                        const selectedValue = parseInt(e.target.value, 10); // Convert the value to an integer
                        uipm.setValue('anchor', selectedValue);
                        const playheadPos = initCtx.getProject().timelineData.playheadPosition;
                        initCtx.projectTools.updatePlayheadPosition(playheadPos);
                    }}
                >
                    <option value={0}>top-right</option>
                    <option value={1}>center</option>
                    <option value={2}>top-left</option>
                </select>
            </div>
        </div>
    );
}



function Example({ctx, activeStore, objectManager} : any) {
    return <div>
        <CommonUIContainer ctx={ctx} activeStore={activeStore}>
            <ObjectManagerContainer objectManager={objectManager}>
                <ObjectDisplay objectName='Mouse Move UI'/>
                <UIPropDisplay />
            </ObjectManagerContainer>

        </CommonUIContainer>
    </div>
}

export default Example;