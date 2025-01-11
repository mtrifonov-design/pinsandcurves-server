import React from 'react';
import { Button } from '@mtrifonov-design/pinsandcurves-specialuicomponents'
import CommonUIContainer from '../../UIToolBox/CommonUIContainer';

function Example({ctx, activeStore} : any) {
    return <div>
        <CommonUIContainer ctx={ctx} activeStore={activeStore}>TEST</CommonUIContainer>
    </div>
}

export default Example;