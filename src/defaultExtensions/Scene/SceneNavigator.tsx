import React from 'react';
import { Button, Icon } from '@mtrifonov-design/pinsandcurves-specialuicomponents'
import CommonUIContainer from '../UIToolBox/CommonUIContainer';




function SceneElement({ element, selectedElement, setSelectedElement, root }: {
    element: Element,
    selectedElement: Element | null,
    setSelectedElement: (element: Element) => void,
    root?: boolean,
}) {

    const [expanded, setExpanded] = React.useState(true);
    const tagName = element.tagName;
    const children = Array.from(element.children);
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
                            element.dispatchEvent(new CustomEvent("select"))
                            setSelectedElement(element)
                        }
                    }}
                >{tagName}
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
                />)}
            </div>
        </div>
    </>
}




const SceneNavigator = ({ rootElement }: { rootElement: Element }) => {

    const [selectedElement, setSelectedElement] = React.useState<Element | null>(null);

    return <div>
        <SceneElement root={true} element={rootElement} setSelectedElement={setSelectedElement} selectedElement={selectedElement} />
    </div>
}

const SceneNavigatorContainer = ({ rootElement }: { rootElement: Element }) => {
    return <div style={{
        display: 'inline-block',
        width : '300px',
        position: "absolute",
        right: "0px",
        color: 'var(--gray6)',
        padding: '10px',
    }}>
        <strong>Scene Navigation</strong>
        <SceneNavigator rootElement={rootElement} />
    </div>
}

export default SceneNavigatorContainer;