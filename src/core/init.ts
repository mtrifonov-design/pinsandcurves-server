import PinsAndCurvesHost from "@mtrifonov-design/pinsandcurves-external/PinsAndCurvesHost"
import { debounce } from "./utils";
import DocumentManager from "./DocumentManager";


const defaultExtensionBundlePath = "../../dist/defaultExtensionBundle/esm/index.js";

function saveProject(host: PinsAndCurvesHost) {
    const project = host.serialize();
    const name = host.c.getProject().metaData.name;
    localStorage.setItem(`pac-project-${name}`, JSON.stringify({ project }));
}


function init() {
    let host = PinsAndCurvesHost.NewProject({}) as PinsAndCurvesHost;


    fetch("scene.pinsandcurves.xml").then(response => {
        return response.text();
    }).then(xml => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");

        // Get the root <pins-and-curves> element
        const pinsAndCurvesDoc = xmlDoc.getElementsByTagName("pins-and-curves")[0];
        const extensions = pinsAndCurvesDoc.getElementsByTagName("extension")[0];
        const defaultExtensions = [];

        const defaultExtensionBundle = xmlDoc.createElement("extension");
        defaultExtensionBundle.setAttribute("src", defaultExtensionBundlePath);
        defaultExtensions.push(defaultExtensionBundle);

        for (let i = 0; i < defaultExtensions.length; i++) {
            extensions.insertBefore(defaultExtensions[i], extensions.firstChild);
        };

        // Pass the modified document to your DocumentManager
        const docManager = new DocumentManager(pinsAndCurvesDoc, host);
        applyStyles();
    });
}

function applyStyles() {

    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    document.body.style.width = '100vw';
    document.body.style.display = 'flex';
    document.body.style.borderTop = '1px solid #59646E';
    document.body.style.justifyContent = 'center';
    document.body.style.backgroundColor = "#1D2126"



}

export default init;