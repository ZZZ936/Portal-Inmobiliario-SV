import { getPropertiesFromSupabase } from './supabase.js';
/**
 * ============================================================================
 * properties.js
 * ============================================================================
 *
 * Sistema dinámico de catálogo e interacción de propiedades.
 *
 * Fuente de datos compartida:
 * localStorage -> "portal_properties"
 *
 * El panel administrativo modifica esta información y la página principal
 * la consume automáticamente.
 * ============================================================================
 */

import { select, selectAll, on } from "./utils.js";

/* ============================================================================
   DATOS POR DEFECTO
============================================================================ */

const defaultProperties = [
    {
        id: "1",
        title: "Residencia Bosque Alto",
        type: "Casa",
        location: "Santa Tecla, La Libertad",
        price: "$485,000",
        bedrooms: 4,
        bathrooms: 3,
        area: "285 m²",
        status: "Disponible",
        activeProperties: true,
        activePortfolio: false,
        description: "",
        media: [
            {
                type: "image",
                url: "assets/images/property-1.jpg",
                caption: "Fachada Principal"
            },
            {
                type: "image",
                url: "assets/images/property-1-2.jpg",
                caption: "Sala de Estar"
            },
            {
                type: "video",
                url: "assets/videos/property-1-tour.mp4",
                caption: "Recorrido Virtual"
            }
        ]
    },

    {
        id: "2",
        title: "Apartamento San Benito",
        type: "Apartamento",
        location: "San Benito, San Salvador",
        price: "$325,000",
        bedrooms: 3,
        bathrooms: 2,
        area: "165 m²",
        status: "En reserva",
        activeProperties: true,
        activePortfolio: false,
        description: "",
        media: [
            {
                type: "image",
                url: "assets/images/property-2.jpg",
                caption: "Vista Panorámica"
            }
        ]
    },

    {
        id: "3",
        title: "Terreno El Boquerón",
        type: "Terreno",
        location: "El Boquerón, San Salvador",
        price: "$210,000",
        bedrooms: 0,
        bathrooms: 0,
        area: "1,200 m²",
        status: "Vendido",
        activeProperties: false,
        activePortfolio: false,
        description: "",
        media: []
    }
];


/* ============================================================================
   CARGAR PROPIEDADES
============================================================================ */

/**
 * Obtiene las propiedades almacenadas por el panel administrativo.
 *
 * Si todavía no existe información en localStorage, utiliza los datos
 * iniciales y los guarda.
 */

async function loadProperties() {

    try {

        const data = await getPropertiesFromSupabase();

        if (Array.isArray(data)) {
            return data;
        }

        console.warn(
            "Supabase no devolvió una lista de propiedades. Se utilizarán los datos por defecto."
        );

    } catch (error) {

        console.error(
            "Error leyendo las propiedades desde Supabase:",
            error
        );

    }

    return defaultProperties;
}

/* ============================================================================
   ESTADO
============================================================================ */

let properties = [];

let currentFilter = "all";


/* ============================================================================
   OBTENER PROPIEDADES ACTIVAS
============================================================================ */

/**
 * IMPORTANTE:
 *
 * El panel utiliza:
 *
 * activeProperties: true / false
 *
 * Por lo tanto la página principal debe consultar exactamente ese campo.
 */

function getActiveProperties() {

    return properties.filter(
        property => property.activeProperties === true
    );

}


/* ============================================================================
   OBTENER ELEMENTOS DEL PORTAFOLIO
============================================================================ */

function getActivePortfolio() {

    return properties.filter(
        property => property.activePortfolio === true
    );

}


/* ============================================================================
   RENDERIZADO
============================================================================ */

async function renderProperties() {

    const grid = select("#propertiesGrid");
    const empty = select("#propertiesEmpty");

    if (!grid) return;


    /*
     * Recargar datos por si el administrador modificó localStorage
     * mientras la página estaba abierta.
     */

    properties = await loadProperties();


    const activeProperties = getActiveProperties();


    const filteredProperties =
        currentFilter === "all"
            ? activeProperties
            : activeProperties.filter(
                property => property.type === currentFilter
            );


    /* =========================================================
       SIN PROPIEDADES
    ========================================================= */

    if (!filteredProperties.length) {

        grid.innerHTML = "";
        grid.style.display = "none";

        if (empty) {
            empty.hidden = false;
        }

        return;

    }


    /* =========================================================
       PROPIEDADES DISPONIBLES
    ========================================================= */

    grid.style.display = "";

    if (empty) {
        empty.hidden = true;
    }


    grid.innerHTML = filteredProperties
        .map(createPropertyCard)
        .join("");

}


/* ============================================================================
   RENDERIZADO DEL PORTAFOLIO
============================================================================ */

export async function renderPortfolio() {

    const portfolioGrid = select("#portfolioGrid");

    if (!portfolioGrid) return;

    properties = await loadProperties();

    const portfolioItems = getActivePortfolio();

    if (!portfolioItems.length) {
        portfolioGrid.innerHTML = `
            <div class="portfolio-empty text-center" style="grid-column: 1 / -1;">
                <p>No hay proyectos en el portafolio actualmente.</p>
            </div>
        `;
        return;
    }

    portfolioGrid.innerHTML = portfolioItems
        .map(createPortfolioCard)
        .join("");

}

/* ============================================================================
   TARJETA PROPIEDAD
============================================================================ */

function createPropertyCard(property) {
    const firstMedia = Array.isArray(property.media) && property.media.length > 0 ? property.media[0] : null;
    const coverMedia = getValidImageUrl(firstMedia);

    const mediaCount = Array.isArray(property.media) ? property.media.length : 0;
    const statusClass = property.status
        ? property.status.toLowerCase().replace(/\s+/g, "-")
        : "disponible";

    return `
        <article
            class="property-card"
            data-property-id="${property.id}"
            data-property-type="${property.type}"
        >
            <div class="property-image-wrapper" style="position: relative; overflow: hidden; width: 100%; height: 220px; background-color: #111;">
                <img
                    src="${coverMedia}"
                    alt="${property.title || 'Propiedad'}"
                    class="property-image"
                    loading="lazy"
                    style="width: 100%; height: 100%; object-fit: cover; display: block; border: none;"
                    onerror="this.onerror=null; this.src='${DEFAULT_IMAGE_PLACEHOLDER}';"
                >

                ${
                    property.status
                        ? `<span class="property-status status-${statusClass}">${property.status}</span>`
                        : ""
                }

                ${
                    mediaCount > 1
                        ? `<span class="property-media-badge">📷 ${mediaCount}</span>`
                        : ""
                }
            </div>

            <div class="property-content">
                <span class="property-type">${property.type || ""}</span>

                <h3 class="property-title">${property.title || ""}</h3>

                <p class="property-location">${property.location || ""}</p>

                <div class="property-details">
                    ${property.bedrooms > 0 ? `<span>${property.bedrooms} hab.</span>` : ""}
                    ${property.bathrooms > 0 ? `<span>${property.bathrooms} baños</span>` : ""}
                    <span>${property.area || ""}</span>
                </div>

                <div class="property-footer">
                    <strong class="property-price">${property.price || ""}</strong>

                    <button
                        type="button"
                        class="property-view-btn"
                        data-property-id="${property.id}"
                    >
                        Ver detalles →
                    </button>
                </div>
            </div>
        </article>
    `;
}

/* ============================================================================
   TARJETA PORTAFOLIO
============================================================================ */

function createPortfolioCard(item) {
    const firstMedia = Array.isArray(item.media) && item.media.length > 0 ? item.media[0] : null;
    const coverMedia = getValidImageUrl(firstMedia);

    return `
        <article class="portfolio-card" data-portfolio-id="${item.id}" style="cursor: pointer;">
            <div class="portfolio-card-image" style="position: relative; overflow: hidden; width: 100%; height: 220px; background-color: #111;">
                <img 
                    src="${coverMedia}" 
                    alt="${item.title || 'Proyecto'}" 
                    loading="lazy"
                    style="width: 100%; height: 100%; object-fit: cover; display: block; border: none;"
                    onerror="this.onerror=null; this.src='${DEFAULT_IMAGE_PLACEHOLDER}';"
                >
                ${item.type ? `<span class="portfolio-badge">${item.type}</span>` : ''}
            </div>
            <div class="portfolio-card-content">
                <h3 class="portfolio-card-title">${item.title || ''}</h3>
                <p class="portfolio-card-location">${item.location || ''}</p>
                <p class="portfolio-card-description">${item.description || ''}</p>
                <button type="button" class="portfolio-view-btn" data-portfolio-id="${item.id}" style="margin-top: 10px; background: none; border: none; color: var(--primary-color, #c5a059); font-weight: 600; cursor: pointer;">
                    Ver galería de imágenes →
                </button>
            </div>
        </article>
    `;
}

/* ============================================================================
   MODAL
============================================================================ */

function openPropertyModal(property) {

    const modal = select("#propertyModal");
    const modalContent = select("#modalPropertyDetails");

    if (!modal || !modalContent) return;


    const mediaItems =
        (property.media || []).slice(0, 15);


    modalContent.innerHTML = `

        <div class="modal-property-header">

            <span class="property-type">
                ${property.type}
            </span>

            <h2>
                ${property.title}
            </h2>

            <p class="property-location">
                ${property.location}
            </p>

            <span class="property-status-badge">
                ${property.status}
            </span>

        </div>


        <div class="modal-gallery">

            <div
                class="gallery-main-viewer"
                id="galleryMainViewer"
            >
                ${renderMediaElement(mediaItems[0])}
            </div>


            ${
                mediaItems.length > 1
                    ? `
                        <div class="gallery-thumbnails">

                            ${mediaItems.map((item, index) => `

                                <button
                                    type="button"
                                    class="thumb-btn ${
                                        index === 0
                                            ? "active"
                                            : ""
                                    }"
                                    data-media-index="${index}"
                                >

                                    ${
                                        item.type === "video"
                                            ? `
                                                <span class="video-thumb-icon">
                                                    ▶
                                                </span>

                                                <video
                                                    src="${item.url}#t=0.5"
                                                    preload="metadata"
                                                ></video>
                                            `
                                            : `
                                                <img
                                                    src="${item.url}"
                                                    alt="${property.title} - ${index + 1}"
                                                    loading="lazy"
                                                >
                                            `
                                    }

                                </button>

                            `).join("")}

                        </div>
                    `
                    : ""
            }

        </div>


        <div class="modal-property-info">

            ${
                property.description
                    ? `
                        <div class="modal-description">
                            <p>
                                ${property.description}
                            </p>
                        </div>
                    `
                    : ""
            }


            <div class="info-specs">

                ${
                    property.bedrooms > 0
                        ? `
                            <div>
                                <strong>Habitaciones:</strong>
                                ${property.bedrooms}
                            </div>
                        `
                        : ""
                }

                ${
                    property.bathrooms > 0
                        ? `
                            <div>
                                <strong>Baños:</strong>
                                ${property.bathrooms}
                            </div>
                        `
                        : ""
                }

                <div>
                    <strong>Área:</strong>
                    ${property.area || ""}
                </div>

                <div>
                    <strong>Precio:</strong>
                    <span class="price-highlight">
                        ${property.price}
                    </span>
                </div>

            </div>


            <div class="modal-actions">

                <a
                    href="#contact"
                    class="btn btn-primary data-close-modal"
                >
                    Solicitar información
                </a>

            </div>

        </div>
    `;


    /* =========================================================
       MINIATURAS
    ========================================================= */

    const thumbButtons =
        modalContent.querySelectorAll(".thumb-btn");

    const viewer =
        modalContent.querySelector("#galleryMainViewer");


    thumbButtons.forEach(btn => {

        on(btn, "click", () => {

            const index =
                Number(btn.dataset.mediaIndex);


            thumbButtons.forEach(button =>
                button.classList.remove("active")
            );


            btn.classList.add("active");


            if (viewer && mediaItems[index]) {

                viewer.innerHTML =
                    renderMediaElement(mediaItems[index]);

            }

        });

    });


    modal.hidden = false;

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );

}

/* ============================================================================
   FALLBACK SVG DINÁMICO (Garantiza que no aparezca "SIN IMAGEN DISPONIBLE")
============================================================================ */
const DEFAULT_IMAGE_PLACEHOLDER =
    "data:image/svg+xml;charset=utf8," +
    encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
            <rect width="100%" height="100%" fill="#111111"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#c5a059" font-family="sans-serif" font-size="14">Portal Inmobiliario</text>
        </svg>
    `);

function getValidImageUrl(mediaItem) {
    if (!mediaItem) return DEFAULT_IMAGE_PLACEHOLDER;
    
    // Si viene como string directo
    if (typeof mediaItem === "string") {
        return mediaItem.trim() !== "" ? mediaItem : DEFAULT_IMAGE_PLACEHOLDER;
    }
    
    // Si viene como objeto { url: "..." }
    if (mediaItem.url && typeof mediaItem.url === "string") {
        return mediaItem.url.trim() !== "" ? mediaItem.url : DEFAULT_IMAGE_PLACEHOLDER;
    }

    return DEFAULT_IMAGE_PLACEHOLDER;
}

/* ============================================================================
   MEDIA
============================================================================ */

function renderMediaElement(mediaItem) {
    const mediaUrl = getValidImageUrl(mediaItem);
    const mediaType = (typeof mediaItem === "object" && mediaItem?.type) ? mediaItem.type : "image";

    if (mediaType === "video") {
        return `
            <video
                controls
                autoplay
                muted
                playsinline
                class="modal-media-player"
                style="width: 100%; height: 100%; object-fit: cover; display: block;"
            >
                <source src="${mediaUrl}" type="video/mp4">
                Tu navegador no soporta la reproducción de video.
            </video>
        `;
    }

    return `
        <img
            src="${mediaUrl}"
            alt="${(typeof mediaItem === "object" && mediaItem?.caption) || 'Propiedad'}"
            class="modal-media-image"
            style="width: 100%; height: 100%; object-fit: cover; display: block;"
            onerror="this.onerror=null; this.src='${DEFAULT_IMAGE_PLACEHOLDER}';"
        >
    `;
}

/* ============================================================================
   CERRAR MODAL
============================================================================ */

function closePropertyModal() {

    const modal = select("#propertyModal");

    if (!modal) return;


    modal.hidden = true;

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );


    const activeVideo =
        modal.querySelector("video");

    if (activeVideo) {
        activeVideo.pause();
    }

}


/* ============================================================================
   FILTROS
============================================================================ */

function initPropertyFilters() {

    const filters =
        selectAll(".property-filter");


    filters.forEach(filter => {

        on(filter, "click", () => {

            currentFilter =
                filter.dataset.filter || "all";


            filters.forEach(button => {

                button.classList.toggle(
                    "active",
                    button === filter
                );

            });


            renderProperties();

        });

    });

}


/* ============================================================================
   EVENTOS
============================================================================ */

function initPropertyEvents() {

    const grid =
        select("#propertiesGrid");

    const portfolioGrid =
        select("#portfolioGrid");

    const modal =
        select("#propertyModal");


    // Clics en la sección de Propiedades
    if (grid) {

        on(grid, "click", event => {

            const button =
                event.target.closest(
                    ".property-view-btn"
                );


            if (!button) return;


            const propertyId =
                String(
                    button.dataset.propertyId
                );


            const property =
                properties.find(
                    item =>
                        String(item.id) === propertyId
                );


            if (property) {

                openPropertyModal(property);

            }

        });

    }

    // Clics en la sección del Portafolio
    if (portfolioGrid) {

        on(portfolioGrid, "click", event => {

            const card =
                event.target.closest(
                    ".portfolio-card"
                );

            if (!card) return;

            const portfolioId =
                String(
                    card.dataset.portfolioId
                );

            const property =
                properties.find(
                    item =>
                        String(item.id) === portfolioId
                );

            if (property) {

                openPropertyModal(property);

            }

        });

    }


    // Cierre del modal
    if (modal) {

        on(modal, "click", event => {

            if (
                event.target.hasAttribute(
                    "data-close-modal"
                ) ||
                event.target.classList.contains(
                    "modal-overlay"
                )
            ) {

                closePropertyModal();

            }

        });

    }

}

/* ============================================================================
   INICIALIZACIÓN
============================================================================ */

export async function initProperties() {

   const grid =
       select("#propertiesGrid");

   properties = await loadProperties();

   if (grid) {
       await renderProperties();
       initPropertyFilters();
       initPropertyEvents();
   }

   await renderPortfolio();

}
