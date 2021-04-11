/*
The whole project entrance
*/
import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import { PanelController } from "./controllers/PanelController.jsx";
import Panel from "./panels/Panel.jsx";

import { entrypoints } from "uxp";

const panelController =  new PanelController(() => <Panel/>, { id: "demos", menuItems: [
    { id: "reload1", label: "Reload Plugin", enabled: true, checked: false, oninvoke: () => location.reload() },
] });

entrypoints.setup({
    plugin: {
        create(plugin) {
            /* optional */ console.log("created", plugin);
        },
        destroy() {
            /* optional */ console.log("destroyed");
        }
    },
    panels: {
        main: panelController
    }
});
