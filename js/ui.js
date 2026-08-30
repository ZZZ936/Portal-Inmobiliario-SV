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

// Renderiza la lista de proyectos dentro del contenedor del portafolio
export function renderPortfolioGrid(projects) {

    const container = document.getElementById("portfolioGrid");

    if (!container) return;

    container.innerHTML = projects.map(project => {

        const images = project.images || [
            project.imageUrl
        ];

        return `
            <article class="portfolio-card" data-project-id="${project.id}">

                <!-- IMAGEN PRINCIPAL -->
                <div class="portfolio-image-wrapper">

                    <img
                        src="${images[0]}"
                        alt="${project.title}"
                        class="portfolio-main-image"
                    >

                    <span class="portfolio-category">
                        ${project.category}
                    </span>

                    ${
                        images.length > 1
                            ? `
                                <button
                                    type="button"
                                    class="portfolio-expand-btn"
                                    aria-label="Ver imágenes del proyecto"
                                >
                                    Ver proyecto
                                </button>
                            `
                            : ""
                    }

                </div>


                <!-- INFORMACIÓN -->
                <div class="portfolio-content">

                    <h3 class="portfolio-title">
                        ${project.title}
                    </h3>

                    <p class="portfolio-description">
                        ${project.description}
                    </p>

                </div>


                <!-- GALERÍA EXPANDIDA -->
                <div class="portfolio-gallery">

                    <button
                        type="button"
                        class="portfolio-arrow portfolio-arrow-left"
                        aria-label="Imagen anterior"
                    >
                        ←
                    </button>


                    <div class="portfolio-gallery-track">

                        ${images.map((image, index) => `
                            
                            <img
                                src="${image}"
                                alt="${project.title} - imagen ${index + 1}"
                                class="portfolio-gallery-image"
                                data-index="${index}"
                            >

                        `).join("")}

                    </div>


                    <button
                        type="button"
                        class="portfolio-arrow portfolio-arrow-right"
                        aria-label="Siguiente imagen"
                    >
                        →
                    </button>

                </div>

            </article>
        `;

    }).join("");


    /*
     * ============================================================
     * EXPANDIR / CERRAR PROYECTO
     * ============================================================
     */

    container.querySelectorAll(".portfolio-card").forEach(card => {

        const expandButton =
            card.querySelector(".portfolio-expand-btn");

        const gallery =
            card.querySelector(".portfolio-gallery");

        const leftButton =
            card.querySelector(".portfolio-arrow-left");

        const rightButton =
            card.querySelector(".portfolio-arrow-right");

        const track =
            card.querySelector(".portfolio-gallery-track");

        if (!gallery || !track) return;


        /*
         * ABRIR GALERÍA
         */

        if (expandButton) {

            expandButton.addEventListener("click", event => {

                event.stopPropagation();

                card.classList.toggle("expanded");

            });

        }


        /*
         * FLECHA DERECHA
         */

        if (rightButton) {

            rightButton.addEventListener("click", event => {

                event.stopPropagation();

                track.scrollBy({
                    left: 350,
                    behavior: "smooth"
                });

            });

        }


        /*
         * FLECHA IZQUIERDA
         */

        if (leftButton) {

            leftButton.addEventListener("click", event => {

                event.stopPropagation();

                track.scrollBy({
                    left: -350,
                    behavior: "smooth"
                });

            });

        }

    });

    // Generación dinámica de las tarjetas del portafolio
    portfolioGrid.innerHTML = projects.map(project => `
        <article class="portfolio-card" data-id="${project.id}">
            <div class="portfolio-card-image">
                <img src="${project.imageUrl || '"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800"'}" alt="${project.title}" loading="lazy">
                ${project.category ? `<span class="portfolio-badge">${project.category}</span>` : ''}
            </div>
            <div class="portfolio-card-content">
                <h3 class="portfolio-card-title">${project.title}</h3>
                <p class="portfolio-card-description">${project.description || ''}</p>
                ${project.link ? `<a href="${project.link}" class="btn-portfolio-link" target="_blank" rel="noopener">Ver proyecto</a>` : ''}
            </div>
        </article>
    `).join('');
}
