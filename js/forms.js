/**
 * ============================================================================
 * forms.js
 * Contact and newsletter forms
 * ============================================================================
 */

import { select, on } from './utils.js';

const validateEmail = email =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function initContactForm() {

    const form = select('#luxuryContactForm');

    if (!form) return;

    const success = select('#formSuccess');
    const button = form.querySelector('button[type="submit"]');

    on(form, 'submit', event => {

        event.preventDefault();

        const name = form.elements.name?.value.trim();
        const email = form.elements.email?.value.trim();
        const service = form.elements.service?.value;
        const message = form.elements.message?.value.trim();

        if (!name || !email || !service || !message) {

            alert('Completa todos los campos.');

            return;

        }

        if (!validateEmail(email)) {

            alert('Ingresa un correo electrónico válido.');

            return;

        }

        if (button) {

            button.disabled = true;
            button.textContent = 'Enviando...';

        }

        window.setTimeout(() => {

            form.reset();

            if (success) {
                success.style.display = 'block';
            }

            if (button) {

                button.disabled = false;
                button.textContent = 'Enviar Mensaje Confidencial';

            }

            window.setTimeout(() => {

                if (success) {
                    success.style.display = 'none';
                }

            }, 5000);

        }, 900);

    });

}

function initNewsletter() {

    const form = select('#newsletterForm');

    if (!form) return;

    const input = form.querySelector('input[type="email"]');

    on(form, 'submit', event => {

        event.preventDefault();

        if (!input || !validateEmail(input.value.trim())) {

            alert('Ingresa un correo electrónico válido.');

            return;

        }

        input.value = '';

        alert('Gracias por suscribirte.');

    });

}

export const initForms = () => {

    initContactForm();
    initNewsletter();

};
