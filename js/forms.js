    /**
 * ============================================================================
 * forms.js
 * ============================================================================
 */

import { select, on } from "./utils.js";
import { supabaseClient } from "./supabase.js";

const validateEmail = email =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);


function initContactForm() {
    const form = select("#luxuryContactForm");

    if (!form) return;

    const success = select("#formSuccess");
    const button = form.querySelector('button[type="submit"]');

    on(form, "submit", async event => {
        event.preventDefault();

        const name = form.elements.name?.value.trim();
        const email = form.elements.email?.value.trim();
        const service = form.elements.service?.value;
        const message = form.elements.message?.value.trim();

        if (!name || !email || !service || !message) {
            alert("Completa todos los campos.");
            return;
        }

        if (!validateEmail(email)) {
            alert("Ingresa un correo electrónico válido.");
            return;
        }

        if (button) {
            button.disabled = true;
            button.textContent = "Enviando...";
        }

        try {
            const { error } = await supabaseClient.functions.invoke(
                "send-contacts",
                {
                    body: {
                        name,
                        email,
                        service,
                        message,
                    },
                }
            );

            if (error) {
                throw error;
            }

            form.reset();

            if (success) {
                success.style.display = "block";

                window.setTimeout(() => {
                    success.style.display = "none";
                }, 5000);
            }
        } catch (error) {
            console.error("Error enviando formulario:", error);

            alert(
                "No se pudo enviar el mensaje. Inténtalo nuevamente."
            );
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent =
                    "Enviar Mensaje Confidencial";
            }
        }
    });
}


function initNewsletter() {
    const form = select("#newsletterForm");

    if (!form) return;

    const input = form.querySelector('input[type="email"]');

    on(form, "submit", event => {
        event.preventDefault();

        if (!input || !validateEmail(input.value.trim())) {
            alert("Ingresa un correo electrónico válido.");
            return;
        }

        input.value = "";

        alert("Gracias por suscribirte.");
    });
}


export const initForms = () => {
    initContactForm();
    initNewsletter();
};
