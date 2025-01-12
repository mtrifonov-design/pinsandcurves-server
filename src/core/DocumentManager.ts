
import PinsAndCurvesHost from "@mtrifonov-design/pinsandcurves-external/PinsAndCurvesHost"
import { debounce } from "./utils";
import { ExtensionScript, GlobalConstants, Extension, Builder, Updater, UIBuilder, ExtensionInitContext, GlobalState, Mode, Resolution } from '../types';
import { fetchJson, setJson } from "./interactWithJSONfile";


class DocumentManager {

    virtualRoot: Element;
    renderRoot: SVGSVGElement;
    host: PinsAndCurvesHost;
    extensions: Element[];
    builders : {
        [key: string]: Builder[];
    } = {};
    commonUIBuilders: UIBuilder[] = [];
    customUIBuilders: UIBuilder[] = [];

    updaters:  {
        [key: string]: Updater[];
    } = {};

    extensionStores: {
        [id: string]: any;
    } = {};

    globalState : GlobalState = {
        mode: "view",
        resolution: "normal",
        frame: 0,
    }

    globalConstants : GlobalConstants = {
        
    }

    constructor(doc: Element, host: PinsAndCurvesHost) {
        
        this.virtualRoot = doc.querySelector('scene') as Element;
        this.renderRoot = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        document.body.appendChild(this.renderRoot);
        this.extensions = Array.from(doc.querySelectorAll('extension'));
        this.parseGlobalConstants(doc);
        this.host = host; 
        this.initPipeline();

    };

    async reInitHost() {
        // console.log(this.globalConstants);
        const projectName = this.globalConstants['projectName'] || 'Untitled';

        const request = await fetchJson();
        let json;
        if (!request.data) {
           // json = localStorage.getItem(`pac-project-${projectName}`);
        } else {
            json = request.data;
        }
        if (json) {
            const project = JSON.parse(json).project;
            this.host = PinsAndCurvesHost.FromSerialized(project);
        } else {
            this.host.c.projectTools.updateProjectName(projectName);
        }
    }

    async initExtensionStores() {
        const projectName = this.host.c.getProject().metaData.name;

        const request = await fetchJson();
        let json;
        if (!request.data) {
            //json = localStorage.getItem(`pac-extension-stores-${projectName}`);
        } else {
            json = request.data;
        }
        if (json) {
            const extensionStores = JSON.parse(json).extensionStores;
            Object.keys(extensionStores).forEach((id) => {
                this.extensionStores[id] = extensionStores[id];
            });
        }
    }

    async initAutoSave() {
        const projectName = this.host.c.getProject().metaData.name;
        this.host.onUpdate(debounce(() => {
            const extensionStores = JSON.stringify({extensionStores:this.extensionStores});
            const projectData = JSON.stringify({project:this.host.serialize()});
            const combined = JSON.stringify({project:this.host.serialize(), 
                extensionStores: this.extensionStores});
            setJson(combined);

            // localStorage.setItem(`pac-project-${projectName}`, projectData);
            // localStorage.setItem(`pac-extension-stores-${projectName}`, extensionStores);
        }, 1000));
    }


    async initPipeline() {
        await this.reInitHost();
        await this.initExtensionStores();
        await this.initAutoSave();
        await this.initExtensions(this.extensions);



        this.build();
        this.buildUi();
        this.update();

        this.renderRoot.id = 'pac-root';
        this.renderRoot.style.height = '100vh';
        this.renderRoot.style.width = '100vw';
        this.renderRoot.style.overflow = 'hidden';
        this.renderRoot.style.background = '#1D2126';
        this.host.onUpdate(() => {
            // console.log("Update");
            this.update();
        });
    };

    parseGlobalConstants(doc: Element) {
        
        const constants = Array.from(doc.getElementsByTagName('constant'));
        constants.forEach((constant) => {
            const key = constant.getAttribute('key');
            const value = constant.getAttribute('value');
            if (key && value) {
                this.globalConstants[key] = value;
            }
        });

    }

    async initExtensions(extensions: Element[]) {
        await Promise.all(extensions.map(async (extension) => {
            let src = extension.getAttribute('src');
            // if src is a relative path, resolve it
            if (src && src.startsWith('.')) {
                src = `${window.location.origin}${window.location.pathname}${src}`;
                // console.log(src);
            }


            let extensionScript : ExtensionScript | null = null;
            if (src) {
                extensionScript = await import(src);
            }
            if (!extensionScript) {
                return;
            }
            let extensions = "extensions" in extensionScript ? extensionScript.extensions : [extensionScript];
            // // console.log(extensions);
            extensions.forEach((extension : Extension) => {
                if ("init" in extension && typeof extension.init === "function") {     
                    
                    const getProject = () => this.host.c.getProject();
                    const getProjectTools = () => this.host.c.projectTools;

                    const extensionStoreExists = this.extensionStores[extension.id] !== undefined;
                    if (!extensionStoreExists) {
                        this.extensionStores[extension.id] = {};
                    }

                    const extensionInitContext : ExtensionInitContext = {
                        getProject,
                        get projectTools() {
                            return getProjectTools();
                        },
                        extensionStore: this.extensionStores[extension.id],
                        globalConstants: this.globalConstants,
                        rootElement: this.renderRoot,
                        setFrame: (frame: number, mode?: Mode, resolution?: Resolution) => {
                            this.globalState.mode = mode || this.globalState.mode;
                            this.globalState.resolution = resolution || this.globalState.resolution;
                            this.update(frame);
                        },
                        globalState: this.globalState,
                        getSignalValue: (signalName: string, frame?: number) => {
                            return this.host.signal(signalName, frame);
                        },
                        onUpdate: this.host.onUpdate.bind(this.host) as any,
                    }
                    extension.init(extensionInitContext);
                }
                const builder = extension.builder;
                const updater = extension.updater;
                const customUIBuilder = extension.customUIBuilder;
                const commonUIBuilder = extension.commonUIBuilder;
                if (customUIBuilder) {
                    this.customUIBuilders.push(customUIBuilder);
                }
                if (commonUIBuilder) {
                    this.commonUIBuilders.push(commonUIBuilder);
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
        const commonUIWidth = 300;

        this.customUIBuilders.forEach((uiBuilder) => {
            const uiLayer = document.createElement('div');
            uiLayer.style.position = 'absolute';
            uiLayer.style.width = `calc(100% - ${commonUIWidth}px)`;
            
            uiLayer.style.height = '100%';
            uiLayer.style.left = `${commonUIWidth}px`;
            uiLayer.style.top = '0';
            uiLayer.appendChild(uiBuilder());
            document.body.appendChild(uiLayer);
        });

        const commonUILayer = document.createElement('div');
        commonUILayer.style.position = 'absolute';
        commonUILayer.style.zIndex = '100';
        commonUILayer.style.width = `${commonUIWidth}px`;
        commonUILayer.style.zIndex = '100';
        commonUILayer.style.height = '100%';
        commonUILayer.style.padding = '10px';
        commonUILayer.style.left = '0';
        commonUILayer.style.top = '0';
        commonUILayer.style.display = 'flex';
        commonUILayer.style.flexDirection = 'column';
        commonUILayer.style.gap = '10px';
        commonUILayer.style.overflowY = 'auto';
        commonUILayer.style.overflowX = 'hidden';
        // style scrollbar
        commonUILayer.style.scrollbarWidth = 'thin';
        commonUILayer.style.scrollbarColor = 'var(--gray3) var(--gray1) ';

        this.commonUIBuilders.forEach((uiBuilder) => {
            const el = uiBuilder();
            // console.log(el);
            commonUILayer.appendChild(el);
        });
        document.body.appendChild(commonUILayer);

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
        // // console.log(virtualElement.tagName,this.builders, renderedChildren);
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


    traverseUpdateRecursive(virtualElement: Element, frame? : number) {
        const updaters = this.updaters[virtualElement.tagName];
        // console.log(updaters);
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
        if (frame === undefined) {
            frame = this.host.c.getProject().timelineData.playheadPosition
        }
        this.globalState.frame = frame;
        this.traverseUpdateRecursive(this.virtualRoot);
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