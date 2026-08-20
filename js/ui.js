/**
 * ============================================================================
 * ui.js
 * UI Interactions
 * ============================================================================
 */

import { select, on, scrollToElement } from "./utils.js";


/* ===========================
   BACK TO TOP
=========================== */

function initBackToTop() {

    const button = document.createElement("button");

    button.className = "back-to-top";

    button.type = "button";

    button.setAttribute(
        "aria-label",
        "Volver arriba"
    );

    button.innerHTML = "↑";

    document.body.appendChild(button);

    on(window, "scroll", () => {

        button.classList.toggle(
            "is-visible",
            window.scrollY > 500
        );

    }, { passive: true });


    on(button, "click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}


/* ===========================
   FAQ
=========================== */

function initFAQ() {

    const items =
        document.querySelectorAll(".faq-item");

    if (!items.length) return;


    items.forEach(item => {

        const button =
            item.querySelector(".faq-question");

        if (!button) return;


        on(button, "click", () => {

            const isOpen =
                item.classList.contains("active");


            items.forEach(other => {

                other.classList.remove("active");

                other
                    .querySelector(".faq-question")
                    ?.setAttribute(
                        "aria-expanded",
                        "false"
                    );

            });


            if (!isOpen) {

                item.classList.add("active");

                button.setAttribute(
                    "aria-expanded",
                    "true"
                );

            }

        });

    });

}


/* ===========================
   CONTACT ADVISOR BUTTON
=========================== */

function initContactAdvisor() {

    const button =
        select("#contactAdvisorBtn");

    if (!button) return;


    on(button, "click", event => {

        event.preventDefault();

        scrollToElement(
            "#contact",
            90
        );

    });

}


/* ===========================
   INITIALIZE UI
=========================== */

export const initUI = () => {

    initBackToTop();

    initFAQ();

    initContactAdvisor();

};