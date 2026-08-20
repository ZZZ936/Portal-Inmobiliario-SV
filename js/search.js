/**
 * ============================================================================
 * search.js
 * ============================================================================
 */

import {
    select,
    on,
    lockScroll,
    unlockScroll
} from "./utils.js";


export const initSearch = () => {

    const trigger = select("#searchTrigger");

    const modal = select("#searchModal");

    const backdrop = select("#modalBackdrop");

    const closeBtn = select("#closeSearchBtn");

    const input = select("#globalSearchInput");

    const contactLink = select("#searchContactLink");


    /* ==========================
       VALIDATION
    ========================== */

    if (
        !trigger ||
        !modal ||
        !backdrop ||
        !closeBtn
    ) {

        console.warn(
            "Buscador: faltan elementos en el HTML."
        );

        return;

    }


    /* ==========================
       OPEN
    ========================== */

    const openSearch = () => {

        modal.classList.add("active");

        backdrop.classList.add("active");

        lockScroll();


        setTimeout(() => {

            input?.focus();

        }, 150);

    };


    /* ==========================
       CLOSE
    ========================== */

    const closeSearch = () => {

        modal.classList.remove("active");

        backdrop.classList.remove("active");

        unlockScroll();


        if (input) {

            input.value = "";

        }

    };


    /* ==========================
       EVENTS
    ========================== */

    on(
        trigger,
        "click",
        openSearch
    );


    on(
        closeBtn,
        "click",
        closeSearch
    );


    on(
        backdrop,
        "click",
        closeSearch
    );


    on(
        contactLink,
        "click",
        closeSearch
    );


    on(
        document,
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                modal.classList.contains("active")
            ) {

                closeSearch();

            }


            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                openSearch();

            }

        }
    );

};