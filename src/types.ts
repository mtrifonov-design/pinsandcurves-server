import { ProjectDataStructure, PinsAndCurvesProjectController } from '@mtrifonov-design/pinsandcurves-external'
import DocumentManager from './core/DocumentManager';

type PinsAndCurvesProjectTools = PinsAndCurvesProjectController.ProjectTools;
type PinsAndCurvesProject = ProjectDataStructure.PinsAndCurvesProject;

type ExtensionScript = 
| {
    extensions: Extension[];
}
| Extension;

type VirtualElement = any;

type GlobalState = {
    mode: Mode;
    resolution: Resolution;
    frame: number;
};

type Mode = "edit" | "view" | "render";
type Resolution = "min" | "normal" | "max";
type SetFrame = (frame: number, mode?: Mode, resolution?: Resolution) => void;

type GlobalConstants = {
    [key: string]: string;
}

type ExtensionInitContext = {
    getProject: () => PinsAndCurvesProject;
    getSignalValue: (signalName: string, frame?: number) => number | string | undefined;
    projectTools: PinsAndCurvesProjectTools;
    extensionStore: any;
    globalConstants: GlobalConstants;
    rootElement: SVGSVGElement;
    setFrame: SetFrame;
    globalState: GlobalState;
    onUpdate: (callback: Function) => Function;
}

type Builder = (virtualElement: VirtualElement, renderedChildren: SVGElement[]) => SVGElement[];
type Updater = (virtualElement: VirtualElement) => void;
type UIBuilder = () => HTMLElement;

type Extension = {
    id: string;
    name?: string;
    iconSrc?: string;
    init?: (ctx: ExtensionInitContext) => void;
    builder?: Builder;
    updater?: Updater;
    customUIBuilder?: UIBuilder;
    commonUIBuilder?: UIBuilder;
    tagNames?: string[];
}

export type {
    Extension,
    ExtensionScript,
    GlobalState,
    VirtualElement,
    PinsAndCurvesProjectTools,
    PinsAndCurvesProject,
    ExtensionInitContext,
    Builder,
    Updater,
    UIBuilder,
    SetFrame,
    Mode,
    Resolution,
    GlobalConstants
}