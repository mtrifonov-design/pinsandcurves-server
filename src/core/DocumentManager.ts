
import PinsAndCurvesHost from "@mtrifonov-design/pinsandcurves-external/PinsAndCurvesHost"
import renderAsImageSequence from "./RenderAsImageSequence";
import { ExtensionScript, Extension, Builder, Updater, UIBuilder, ExtensionInitContext, GlobalContext, Mode, Resolution } from './types';

class DocumentManager {

    virtualRoot: Element;
    renderRoot: SVGSVGElement;
    host: PinsAndCurvesHost;
    extensions: Element[];
    builders : {
        [key: string]: Builder[];
    } = {};
    defaultUIBuilders: UIBuilder[] = [];
    customUIBuilders: UIBuilder[] = [];

    updaters:  {
        [key: string]: Updater[];
    } = {};

    extensionStores: {
        [id: string]: any;
    } = {};

    globalContext : GlobalContext = {
        mode: "view",
        resolution: "normal",
    }

    initCompleted = false;
    constructor(doc: Element, host: PinsAndCurvesHost) {
        this.host = host;
        this.virtualRoot = doc.querySelector('scene') as Element;
        this.renderRoot = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.extensions = Array.from(doc.querySelectorAll('extension'));
        this.initPipeline();
        this.host.onUpdate(() => {
            if (this.initCompleted) {
                this.update();
            }
        });
    }
    async initPipeline() {
        await this.initExtensions(this.extensions);
        this.build();
        this.buildUi();
        this.applySignals();
        this.update();

        this.renderRoot.id = 'pac-root';
        this.renderRoot.style.height = '100%';
        this.renderRoot.style.overflow = 'hidden';
        this.renderRoot.style.background = 'gray';
        this.renderRoot.style.zIndex = '-1';
        document.body.appendChild(this.renderRoot);
        this.initCompleted = true;
    };

    async initExtensions(extensions: Element[]) {
        await Promise.all(extensions.map(async (extension) => {
            const src = extension.getAttribute('src');
            let extensionScript : ExtensionScript | null = null;
            if (src) {
                extensionScript = await import(src);
            }
            if (!extensionScript) {
                return;
            }
            let extensions = "extensions" in extensionScript ? extensionScript.extensions : [extensionScript];
            extensions.forEach((extension : Extension) => {
                if ("init" in extension && typeof extension.init === "function") {                    
                    const extensionInitContext : ExtensionInitContext = {
                        getProject: () => this.host.c.getProject(),
                        projectTools: this.host.c.projectTools,
                        attachExtensionStore: (extensionStore) => this.extensionStores[extension.id] = extensionStore,
                        globalContext: this.globalContext,
                        rootElement: this.renderRoot,
                        setFrame: (frame: number, mode?: Mode, resolution?: Resolution) => {
                            this.globalContext.mode = mode || this.globalContext.mode;
                            this.globalContext.resolution = resolution || this.globalContext.resolution;
                            this.update(frame);
                        }
                    }
                    extension.init(extensionInitContext);
                }
                const builder = extension.builder;
                const updater = extension.updater;
                const customUIBuilder = extension.customUIBuilder;
                const defaultUIBuilder = extension.defaultUIBuilder;
                if (customUIBuilder) {
                    this.customUIBuilders.push(customUIBuilder);
                }
                if (defaultUIBuilder) {
                    this.defaultUIBuilders.push(defaultUIBuilder);
                }
                const tagNames = extension.tagNames;
                if (tagNames) {
                    tagNames.forEach((tagName : string) => {
                        if (builder) {
                            if (!this.builders[tagName]) {
                                this.builders[tagName] = [];
                            }
                            this.builders[tagName].push(builder);
                        }
                        if (updater) {
                            if (!this.updaters[tagName]) {
                                this.updaters[tagName] = [];
                            }
                            this.updaters[tagName].push(updater);
                        }
                    });
                }
            });
        }));
    }

    buildUi() {
        this.customUIBuilders.forEach((uiBuilder) => {
            const uiLayer = document.createElement('div');
            uiLayer.style.position = 'absolute';
            uiLayer.style.zIndex = '100';
            uiLayer.style.width = '100%';
            uiLayer.style.height = '100%';
            uiLayer.style.left = '0';
            uiLayer.style.top = '0';
            uiLayer.appendChild(uiBuilder());
            document.body.appendChild(uiLayer);
        });

        const defaultUILayer = document.createElement('div');
        defaultUILayer.style.position = 'absolute';
        defaultUILayer.style.zIndex = '100';
        defaultUILayer.style.width = '100%';
        defaultUILayer.style.height = '100%';
        defaultUILayer.style.left = '0';
        defaultUILayer.style.top = '0';
        const island = document.createElement('div');
        this.defaultUIBuilders.forEach((uiBuilder) => {
            island.appendChild(uiBuilder());
        });
        defaultUILayer.appendChild(island);
        document.body.appendChild(defaultUILayer);

        // const renderButton = document.createElement('button');
        // renderButton.textContent = 'Render';
        // renderButton.style.position = 'absolute';
        // renderButton.style.bottom = '0';
        // renderButton.style.right = '0';
        // renderButton.style.zIndex = '100';
        // renderButton.onclick = () => {
        //     this.exportAsFrames();
        // };
        // uiLayer.appendChild(renderButton);

        // const saveAsJsonButton = document.createElement('button');
        // saveAsJsonButton.textContent = 'Save as JSON';
        // saveAsJsonButton.style.position = 'absolute';
        // saveAsJsonButton.style.bottom = '0';
        // saveAsJsonButton.style.right = '100px';
        // saveAsJsonButton.style.zIndex = '100';

        // saveAsJsonButton.onclick = () => {
        //     this.saveAsJson();
        // };

        // uiLayer.appendChild(saveAsJsonButton);

    }

    traverseBuildRecursive(virtualElement: any) : Element {
        const renderedChildren = Array.from(virtualElement.children).map(this.traverseBuildRecursive.bind(this));
        console.log(virtualElement.tagName,this.builders, renderedChildren);
        let builder = this.builders[virtualElement.tagName];
        if (!builder) {
            throw new Error(`No builder found for tag ${virtualElement.tagName}`);
        }
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        renderedChildren.forEach((child) => {
            g.appendChild(child);
        });
        const builders = this.builders[virtualElement.tagName];
        if (builders) {
        return builders.reduce((acc : SVGGElement, builder : Builder) => {
            const rendered = builder(virtualElement, acc);
            return rendered;
        }, g);
        } else return g;
    }
    build() {
        this.renderRoot.appendChild(this.traverseBuildRecursive(this.virtualRoot));
    }


    traverseUpdateRecursive(virtualElement: Element) {
        const updaters = this.updaters[virtualElement.tagName];
        if (updaters) {
            updaters.forEach(updater =>
                updater(virtualElement)
            );
        }

        const virtualChildren = Array.from(virtualElement.children);
        for (let i = 0; i < virtualChildren.length; i++) {
            this.traverseUpdateRecursive(virtualChildren[i]);
        }
    }

    update(frame ?: number) {
        this.applySignals(frame);
        this.traverseUpdateRecursive(this.virtualRoot);
    }

    mode = "view";
    applySignals(frame? : number) {
        const host = this.host;
        const controller = host.c;
        const project = controller.getProject();
        const signalIds = project.orgData.signalIds;
        const currentFrame = project.timelineData.playheadPosition;
        const relativeTime = (frame || currentFrame) / project.timelineData.numberOfFrames;
    
        for (const signalId of signalIds) {
            const signalName = project.orgData.signalNames[signalId];
            const isExportSignal = signalName.startsWith('@') || signalName.startsWith('#');
            if (!isExportSignal) {
                continue;
            }
            const type = signalName.startsWith('@') ? 'idSelector' : 'classSelector';
            // now, assume the signal is structured as follows @ | #[name].[property]
            // extract the name and property
            const parts = signalName.split('.');
            if (parts.length < 2) {
                continue;
            };
            const name = parts[0].slice(1, parts[0].length);
            const property = parts.slice(1).join('.');
            
            const value = host.signal(signalName, frame || currentFrame);
            let elements = [];
            if (type === 'idSelector') {
                const element = this.virtualRoot.querySelector(`#${name}`);
                if (element) elements.push(element);
            } else {
                elements = Array.from(this.virtualRoot.querySelectorAll(`.${name}`));
            }
            elements.forEach((element) => {
                element.setAttribute(property, String(value));
            });
        }
    }

    exportAsFrames() {
        const focusRange = this.host.c.getProject().timelineData.focusRange;
        const [startFrame, endFrame] = focusRange;
        const fps = this.host.c.getProject().timelineData.framesPerSecond;
        renderAsImageSequence({
            applySignals: this.update.bind(this),
            startFrame,
            endFrame,
            framesPerSecond: fps,
        })
    }

    saveAsJson() {
        const json = JSON.stringify(this.host.serialize());
        const blob = new Blob([json], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'project.json';
        a.click();
    }


}

export default DocumentManager;