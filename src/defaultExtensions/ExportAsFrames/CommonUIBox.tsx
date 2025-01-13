import React, { useContext, useSyncExternalStore } from 'react';
import { Button } from '@mtrifonov-design/pinsandcurves-specialuicomponents'

function Example({ exportAsFrames, activeStore }: any) {
    const isActive = useSyncExternalStore(activeStore.subscribe.bind(activeStore), activeStore.getSnapshot.bind(activeStore));
    console.log(activeStore)
    return isActive ? <div style={{
        display: "block",
    }}>
        <Button onClick={exportAsFrames}
            text="Export as Frames"
            iconName="imagesmode"
            ></Button>
    </div> : null;
}

function Wrapper({activeStore, exportAsFrames}: any) {
    return <Example activeStore={activeStore} exportAsFrames={exportAsFrames}/>
}

export default Wrapper;