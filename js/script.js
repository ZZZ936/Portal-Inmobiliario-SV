import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://xprylzrdgwywucyovonf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_hPoLjLs5r8iMIFJmSvs-Mw_Exn1G2mj";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const contactForm = document.getElementById("contact-form-public");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("client-name").value.trim();
    const email = document.getElementById("client-email").value.trim();
    const phone = document.getElementById("client-phone").value.trim();
    const message = document.getElementById("client-message").value.trim();

    try {
      const { error } = await supabase
        .from("inquiries")
        .insert([{ name, email, phone, message }]);

      if (error) throw error;

      alert("¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.");
      contactForm.reset();
    } catch (error) {
      console.error("Error al enviar la consulta:", error);
      alert("Hubo un error al enviar tu mensaje. Inténtalo de nuevo.");
    }
  });
}
