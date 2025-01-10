import { ProjectDataStructure, PinsAndCurvesProjectController } from '@mtrifonov-design/pinsandcurves-external'

type PinsAndCurvesProjectTools = PinsAndCurvesProjectController.ProjectTools;
type PinsAndCurvesProject = ProjectDataStructure.PinsAndCurvesProject;

type ExtensionScript = 
| {
    extensions: Extension[];
}
| Extension;

type VirtualElement = any;

type GlobalContext = {
    mode: Mode;
    resolution: Resolution;
};

type Mode = "edit" | "view" | "render";
type Resolution = "min" | "normal" | "max";
type SetFrame = (frame: number, mode?: Mode, resolution?: Resolution) => void;

type ExtensionInitContext = {
    getProject: () => PinsAndCurvesProject;
    projectTools: PinsAndCurvesProjectTools;
    attachExtensionStore: (extensionStore: any) => void;
    globalContext: GlobalContext;
    rootElement: SVGSVGElement;
    setFrame: SetFrame;
}

type Builder = (virtualElement: VirtualElement, renderedChild: SVGGElement) => SVGGElement;
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
    defaultUIBuilder?: UIBuilder;
    tagNames?: string[];
}

export type {
    Extension,
    ExtensionScript,
    GlobalContext,
    VirtualElement,
    PinsAndCurvesProjectTools,
    PinsAndCurvesProject,
    ExtensionInitContext,
    Builder,
    Updater,
    UIBuilder,
    SetFrame,
    Mode,
    Resolution
}