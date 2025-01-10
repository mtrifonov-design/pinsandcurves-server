import { defineConfig } from "vite";


const p5slinky = defineConfig({
    root: "./demos/p5slinky",
    server: {
        port: 6002,
    },
    build: {
        outDir: "./demos/p5slinky/dist",
    },
});

export default defineConfig(({ mode }) => {
    // Use the mode or environment variable to select the configuration
    let selectedConfig;
    switch (mode) {
        case "p5slinky":
            selectedConfig = p5slinky;
            break;
        default:
            selectedConfig = configA;
    }

    return selectedConfig;
});
