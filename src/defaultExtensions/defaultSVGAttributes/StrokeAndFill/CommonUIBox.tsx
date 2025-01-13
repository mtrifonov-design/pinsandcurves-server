import React, { useContext, useSyncExternalStore } from 'react';
import { Button } from '@mtrifonov-design/pinsandcurves-specialuicomponents'
import CommonUIContainer from '../../UIToolBox/CommonUIContainer';
import ObjectManagerContainer, { ObjectManagerContext } from '../../UIToolBox/ObjectManagerContainer';
import PropertyManager from '../../UIToolBox/PropertyManager';
import Dropdown from '../../UIToolBox/DropdownProps';
import { CommonUIContext } from '../../UIToolBox/CommonUIContainer';
import { ExtensionInitContext } from '../../../types';
import ObjectDisplay from '../../UIToolBox/ObjectPropertyDisplay';

function Example({ctx, activeStore, objectManager} : any) {
    return <div>
        <CommonUIContainer ctx={ctx} activeStore={activeStore}>
            <ObjectManagerContainer objectManager={objectManager}>
                <ObjectDisplay objectName='Stroke and Fill'/>
            </ObjectManagerContainer>
        </CommonUIContainer>
    </div>
}

export default Example;