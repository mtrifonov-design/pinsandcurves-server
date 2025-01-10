
const id = "loadProject";
const global = {};

    // const persistence = true;
    // const config = {
    //     framesPerSecond: 30,
    //     numberOfFrames: 500,
    // }
    // if (persistence) {
    //     const json = localStorage.getItem('pac-project');
    //     if (json) {
    //         const serialized = JSON.parse(json).project;
    //         host = PinsAndCurvesHost.FromSerialized(serialized, config) as PinsAndCurvesHost;
    //         host.onUpdate(debounce(() => {
    //             saveProject(host);
    //         }, 1000));
    //     } else {
    //         host = PinsAndCurvesHost.NewProject(config) as PinsAndCurvesHost;
    //         host.onUpdate(debounce(() => {
    //             saveProject(host);
    //         }, 1000));
    //     }
    // } else {
    //     host = PinsAndCurvesHost.NewProject(config) as PinsAndCurvesHost;
    // }

function init(ctx) {
    const { getProject, projectController, setFrame, dm, globalConstants } = ctx;
    const projectName = globalConstants['projectName'];

    loadProject(projectName, dm);
}

function loadProject(projectName, documentManager) {
    const json = localStorage.getItem(`pac-${projectName}`);
    if (json) {
        const serialized = JSON.parse(json).project;
        documentManager.setProject(serialized);
    }
}


export { init, id }