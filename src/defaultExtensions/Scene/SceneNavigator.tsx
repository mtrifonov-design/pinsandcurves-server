import React from 'react';
import { Button, Icon } from '@mtrifonov-design/pinsandcurves-specialuicomponents'
import CommonUIContainer from '../UIToolBox/CommonUIContainer';
import { ExtensionInitContext } from '../../types';


function setUniqueId(element: Element, rootElement: Element) {};

function SceneElement({ element, selectedElement, setSelectedElement, root, rootElement, initCtx }: {
    element: Element,
    selectedElement: Element | null,
    setSelectedElement: (element: Element) => void,
    rootElement: Element,
    root?: boolean,
    initCtx: ExtensionInitContext,
}) {

    const [expanded, setExpanded] = React.useState(true);
    const tagName = element.tagName;
    const children = Array.from(element.children);
    const elementId = element.getAttribute('id');
    return <>
        <div style={{
            marginLeft: root? "0px" : "20px",
        }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                flexDirection: "row",
            }}>
                <div style={{
                }}>
                    <Icon iconName={
                        children.length === 0 ?
                            "category" : expanded ? "arrow_drop_up" : "arrow_drop_down"} onClick={() => setExpanded(!expanded)}
                        hoverBgColor={children.length === 0 ? "transparent" : "var(--gray4)"}
                    />
                </div>
                <div style={{
                    backgroundColor: selectedElement === element ? "var(--gray5)" : "var(--gray4)",
                    padding: "3px",
                    borderRadius: 'var(--borderRadiusSmall)',
                    border: selectedElement === element ? "1px solid var(--gray6)" : "none",
                    cursor: "pointer",
                }}
                    onClick={() => {
                        if (selectedElement !== element) {
                            if (selectedElement) {
                                selectedElement.dispatchEvent(new CustomEvent("deselect"))
                            }
                            if (!element.id) {
                                setUniqueId(element,rootElement);
                            }

                            element.dispatchEvent(new CustomEvent("select"))
                            setSelectedElement(element)
                        }
                    }}
                >{`${tagName}${elementId ? ` #${elementId}` : ""}`}
                </div>


            </div>
            <div style={{
                display: expanded ? "block" : "none",
            }}>
                {children.map((child: Element, i: number) => <SceneElement
                    element={child}
                    selectedElement={selectedElement}
                    setSelectedElement={setSelectedElement}
                    key={child.tagName + i}
                    rootElement={rootElement}
                    initCtx={initCtx}
                />)}
            </div>
        </div>
    </>
}




const SceneNavigator = ({ rootElement, initCtx }: { rootElement: Element, initCtx: ExtensionInitContext }) => {

    const [selectedElement, setSelectedElement] = React.useState<Element | null>(null);

    return <div>
        <SceneElement initCtx={initCtx} root={true} element={rootElement} setSelectedElement={setSelectedElement} selectedElement={selectedElement} rootElement={rootElement} />
    </div>
}

const SceneNavigatorContainer = ({ rootElement, initCtx }: { rootElement: Element, initCtx: ExtensionInitContext }) => {
    return <div style={{
        display: 'inline-block',
        width : '300px',
        position: "absolute",
        right: "0px",
        color: 'var(--gray6)',
        padding: '10px',
        height: '100%',
        overflowY: 'scroll',
        scrollbarColor: 'var(--gray3) transparent',
    }}>
        <strong>Scene Navigation</strong>
        <SceneNavigator rootElement={rootElement} initCtx={initCtx} />
    </div>
}

export default SceneNavigatorContainer;