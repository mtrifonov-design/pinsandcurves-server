import React, { useContext, useSyncExternalStore } from 'react';
import { Button } from '@mtrifonov-design/pinsandcurves-specialuicomponents'
import CommonUIContainer from '../defaultExtensions/UIToolBox/CommonUIContainer';
import ObjectManagerContainer, { ObjectManagerContext } from '../defaultExtensions/UIToolBox/ObjectManagerContainer';
import ObjectDisplay from '../defaultExtensions/UIToolBox/ObjectPropertyDisplay';

function Example({ctx, activeStore, objectManager} : any) {
    return <div>
        <CommonUIContainer ctx={ctx} activeStore={activeStore}>
            <ObjectManagerContainer objectManager={objectManager}>
                <ObjectDisplay objectName='Mouse Move UI'/>
            </ObjectManagerContainer>
        </CommonUIContainer>
    </div>
}

export default Example;