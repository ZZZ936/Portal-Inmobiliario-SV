import {
    select,
    selectAll,
    on,
    lockScroll,
    unlockScroll,
    scrollToElement
} from './utils.js';

import { SELECTORS, CLASSES, UI } from './config.js';

export function initNavigation() {

    const header = select(SELECTORS.header);
    const menu = select(SELECTORS.navMenu);
    const toggle = select(SELECTORS.navToggle);
    const overlay = select(SELECTORS.navOverlay);
    const links = selectAll(SELECTORS.navLinks);

    const updateHeader = () => {
        header?.classList.toggle(
            CLASSES.STICKY,
            window.scrollY > 25
        );
    };

    on(window, 'scroll', updateHeader, { passive: true });
    updateHeader();

    const openMenu = () => {
        if (!menu) return;

        menu.classList.add(CLASSES.OPEN);
        overlay?.classList.add(CLASSES.OPEN);
        toggle?.setAttribute('aria-expanded', 'true');
        lockScroll();
    };

    const closeMenu = () => {
        if (!menu) return;

        menu.classList.remove(CLASSES.OPEN);
        overlay?.classList.remove(CLASSES.OPEN);
        toggle?.setAttribute('aria-expanded', 'false');
        unlockScroll();
    };

    on(toggle, 'click', () => {
        menu?.classList.contains(CLASSES.OPEN)
            ? closeMenu()
            : openMenu();
    });

    on(overlay, 'click', closeMenu);

    links.forEach(link => {
        on(link, 'click', event => {
            const href = link.getAttribute('href');

            closeMenu();

            if (!href?.startsWith('#')) return;

            const target = select(href);

            if (!target) return;

            event.preventDefault();
            scrollToElement(target, UI.scrollOffset);
        });
    });

    on(document, 'keydown', event => {
        if (event.key === 'Escape') closeMenu();
    });

    const sections = selectAll('section[id]');

    if (!sections.length || !links.length) return;

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const id = entry.target.id;

                links.forEach(link => {
                    link.classList.toggle(
                        CLASSES.ACTIVE,
                        link.getAttribute('href') === `#${id}`
                    );
                });
            });
        },
        {
            threshold: 0.3,
            rootMargin: '-120px 0px -40% 0px'
        }
    );

    sections.forEach(section => observer.observe(section));
}
