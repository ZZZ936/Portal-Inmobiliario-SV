/**
 * ============================================================================
 * utils.js
 * Shared utility functions for Portal Inmobiliario SV
 * ============================================================================
 */

/**
 * DOM SELECTORS
 */

export const select = (
    selector,
    scope = document
) =>
    scope.querySelector(selector);


export const selectAll = (
    selector,
    scope = document
) =>
    [
        ...scope.querySelectorAll(selector)
    ];


/**
 * EVENTS
 */

export const on = (
    element,
    event,
    callback,
    options = false
) => {

    element?.addEventListener(
        event,
        callback,
        options
    );

};

/**
 * ----------------------------------------------------------------------------
 * FUNCTIONS
 * ----------------------------------------------------------------------------
 */

/**
 * Debounce.
 */
export const debounce = (func, wait = 300) => {
    let timeout;

    return (...args) => {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
};

/**
 * Throttle.
 */
export const throttle = (func, limit = 100) => {
    let waiting = false;

    return (...args) => {
        if (waiting) return;

        waiting = true;

        func(...args);

        setTimeout(() => {
            waiting = false;
        }, limit);
    };
};

/**
 * requestAnimationFrame throttle.
 * Better for animations.
 */
export const rafThrottle = (callback) => {
    let ticking = false;

    return (...args) => {
        if (ticking) return;

        ticking = true;

        requestAnimationFrame(() => {
            callback(...args);
            ticking = false;
        });
    };
};

/**
 * Promise delay.
 */
export const wait = (ms) =>
    new Promise(resolve => setTimeout(resolve, ms));

/**
 * ----------------------------------------------------------------------------
 * ELEMENT CREATION
 * ----------------------------------------------------------------------------
 */

/**
 * Create a DOM element.
 *
 * Supported options:
 * - className
 * - text
 * - html
 * - dataset
 * - attributes
 * - children
 */
export const createElement = (
    tag,
    {
        className = '',
        text = '',
        html = '',
        dataset = {},
        attributes = {},
        children = []
    } = {}
) => {

    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text) {
        element.textContent = text;
    }

    /**
     * Only use with trusted HTML.
     */
    if (html) {
        element.innerHTML = html;
    }

    Object.entries(dataset).forEach(([key, value]) => {
        element.dataset[key] = value;
    });

    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });

    children.forEach(child => {
        if (child instanceof Node) {
            element.appendChild(child);
        }
    });

    return element;
};

/**
 * ----------------------------------------------------------------------------
 * SCROLL
 * ----------------------------------------------------------------------------
 */

/**
 * Smooth scroll.
 */
export const scrollToElement = (
    target,
    offset = 0
) => {

    const element =
        typeof target === 'string'
            ? select(target)
            : target;

    if (!element) return;

    const top =
        element.getBoundingClientRect().top +
        window.scrollY -
        offset;

    window.scrollTo({
        top,
        behavior: 'smooth'
    });
};

/**
 * ----------------------------------------------------------------------------
 * DEVICE
 * ----------------------------------------------------------------------------
 */

/**
 * Detect mobile viewport.
 */
export const isMobile = (
    breakpoint = 992
) =>
    window.matchMedia(
        `(max-width: ${breakpoint}px)`
    ).matches;

/**
 * ----------------------------------------------------------------------------
 * BODY SCROLL
 * ----------------------------------------------------------------------------
 */

const LOCK_CLASS = 'scroll-lock';

/**
 * Disable page scrolling.
 */
export const lockScroll = () => {

    if (document.body.classList.contains(LOCK_CLASS)) {
        return;
    }

    const scrollbar =
        window.innerWidth -
        document.documentElement.clientWidth;

    document.body.style.paddingRight =
        `${scrollbar}px`;

    document.body.style.overflow = 'hidden';

    document.body.classList.add(LOCK_CLASS);
};

/**
 * Enable page scrolling.
 */
export const unlockScroll = () => {

    document.body.style.paddingRight = '';

    document.body.style.overflow = '';

    document.body.classList.remove(LOCK_CLASS);
};

/**
 * ----------------------------------------------------------------------------
 * CLASS HELPERS
 * ----------------------------------------------------------------------------
 */

export const addClass = (
    element,
    className
) => {
    element?.classList.add(className);
};

export const removeClass = (
    element,
    className
) => {
    element?.classList.remove(className);
};

export const toggleClass = (
    element,
    className
) => {
    element?.classList.toggle(className);
};

export const hasClass = (
    element,
    className
) =>
    element?.classList.contains(className);

/**
 * ----------------------------------------------------------------------------
 * VIEWPORT
 * ----------------------------------------------------------------------------
 */

/**
 * Check if element is visible.
 */
export const isInViewport = (element) => {

    if (!element) return false;

    const rect =
        element.getBoundingClientRect();

    return (
        rect.top < window.innerHeight &&
        rect.bottom > 0
    );
};

/**
 * ----------------------------------------------------------------------------
 * RANDOM
 * ----------------------------------------------------------------------------
 */

/**
 * Random integer.
 */
export const random = (min, max) =>
    Math.floor(
        Math.random() * (max - min + 1)
    ) + min;

/**
 * Clamp value.
 */
export const clamp = (
    value,
    min,
    max
) =>
    Math.min(
        Math.max(value, min),
        max
    );

/**
 * ----------------------------------------------------------------------------
 * LOCAL STORAGE
 * ----------------------------------------------------------------------------
 */

export const saveStorage = (
    key,
    value
) => {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

    } catch (error) {

        console.error(
            'LocalStorage Save Error:',
            error
        );

    }

};

export const getStorage = (
    key,
    fallback = null
) => {

    try {

        const value =
            localStorage.getItem(key);

        return value
            ? JSON.parse(value)
            : fallback;

    } catch {

        return fallback;

    }

};

export const removeStorage = (key) =>
    localStorage.removeItem(key);

/**
 * ----------------------------------------------------------------------------
 * NUMBER ANIMATION
 * ----------------------------------------------------------------------------
 */

export const animateCounter = (

    element,

    target,

    duration = 2000

) => {

    let start = 0;

    const increment = target / (duration / 16);

    const update = () => {

        start += increment;

        if (start >= target) {

            element.textContent = target.toLocaleString();

            return;

        }

        element.textContent = Math.floor(start).toLocaleString();

        requestAnimationFrame(update);

    };

    update();

};

/**
 * ----------------------------------------------------------------------------
 * FADE HELPERS
 * ----------------------------------------------------------------------------
 */

export const fadeIn = (

    element,

    duration = 300

) => {

    if (!element) return;

    element.style.opacity = 0;

    element.style.display = '';

    let start;

    const animate = time => {

        if (!start) start = time;

        const progress = (time - start) / duration;

        element.style.opacity = Math.min(progress, 1);

        if (progress < 1) {

            requestAnimationFrame(animate);

        }

    };

    requestAnimationFrame(animate);

};

export const fadeOut = (

    element,

    duration = 300

) => {

    if (!element) return;

    let start;

    const animate = time => {

        if (!start) start = time;

        const progress = (time - start) / duration;

        element.style.opacity = 1 - progress;

        if (progress < 1) {

            requestAnimationFrame(animate);

        } else {

            element.style.display = 'none';

        }

    };

    requestAnimationFrame(animate);

};

/**
 * ----------------------------------------------------------------------------
 * FORMATTERS
 * ----------------------------------------------------------------------------
 */

export const formatCurrency = value =>

    new Intl.NumberFormat(

        'en-US',

        {

            style:'currency',

            currency:'USD',

            maximumFractionDigits:0

        }

    ).format(value);

export const formatNumber = value =>

    new Intl.NumberFormat().format(value);

/**
 * ----------------------------------------------------------------------------
 * UUID
 * ----------------------------------------------------------------------------
 */

export const uuid = () =>

    crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(36) +
          Math.random().toString(36).slice(2);

/**
 * ----------------------------------------------------------------------------
 * IMAGE PRELOAD
 * ----------------------------------------------------------------------------
 */

export const preloadImage = src =>

    new Promise((resolve,reject)=>{

        const img=new Image();

        img.onload=()=>resolve(img);

        img.onerror=reject;

        img.src=src;

    });

/**
 * ----------------------------------------------------------------------------
 * COPY
 * ----------------------------------------------------------------------------
 */

export const copy = async text => {

    try{

        await navigator.clipboard.writeText(text);

        return true;

    }catch{

        return false;

    }

};

/**
 * ============================================================================
 * END OF FILE
 * ============================================================================
 */
