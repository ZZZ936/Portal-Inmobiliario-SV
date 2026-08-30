/**
 * ============================================================================
 * main.js
 * ============================================================================
 */

import {
    initNavigation
} from "./navigation.js";

import {
    initAnimations
} from "./animations.js";

import {
    initSearch
} from "./search.js";

import {
    initForms
} from "./forms.js";

import {
    initUI
} from "./ui.js";

import {
    initProperties
} from "./properties.js";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        initNavigation();

        initAnimations();

        initSearch();

        initForms();

        initUI();

        initProperties();

        console.log(
            "Portal Inmobiliario SV iniciado correctamente."
        );

    }
);
