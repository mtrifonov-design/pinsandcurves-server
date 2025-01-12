import React, { useContext, useSyncExternalStore } from 'react';
import Dropdown from './DropdownProps';
import { ObjectManagerContext } from './ObjectManagerContainer';
import PropertyManager from './PropertyManager';
import { ExtensionInitContext } from '../../types';
import { CommonUIContext } from './CommonUIContainer';

function ObjectDisplay({objectName} : {objectName?: string}) {
    const {id, pm} = useContext(ObjectManagerContext) as {id: string, pm: PropertyManager};
    const properties = useSyncExternalStore(pm.subscribe.bind(pm), pm.getSnapshot.bind(pm));
    const signalNames = Object.values(pm.getProject().orgData.signalNames);
    const initCtx = useContext(CommonUIContext) as ExtensionInitContext;
    // console.log(initCtx)
    return <div>
        <div style={{marginBottom: "10px"}}><strong style={{color:"var(--gray7)"}}>{objectName ? objectName : id}</strong></div>
        {Object.keys(properties).map(propertyId => {
            const property = properties[propertyId];
            const signalName = property.signalName;
            return <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}} key={propertyId}>
                {property.propertyName ? property.propertyName : propertyId}
                <Dropdown key={propertyId} options={signalNames} selectedValue={signalName}  onChange={
                    (newValue: string | undefined) => {
                        if (newValue) {
                            pm.associateSignal(propertyId, newValue);

                        } else {
                            pm.disassociateSignal(propertyId);

                        }
                        const playheadPos = initCtx.getProject().timelineData.playheadPosition;
                        initCtx.projectTools.updatePlayheadPosition(playheadPos);
                    }} />
            </div>
        })}
    </div>

}

export default ObjectDisplay;