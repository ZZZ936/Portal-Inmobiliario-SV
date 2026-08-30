import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// =============================================================
// SUPABASE
// =============================================================

const SUPABASE_URL = "https://xprylzrdgwywucyovonf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_hPoLjLs5r8iMIFJmSvs-Mw_Exn1G2mj";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const STORAGE_BUCKET = "Imagesvideos";
const MAX_MEDIA_FILES = 15;
const ADMIN_EMAIL = "pinmobiliariosv@gmail.com";


class AdminDashboard {

  constructor() {

    // =========================================================
    // REFERENCIAS DOM
    // =========================================================

    this.tbody = document.getElementById("properties-list");
    this.searchInput = document.getElementById("search-input");
    this.inquiriesTbody = document.getElementById("inquiries-list");
    this.inquirySearchInput = document.getElementById("inquiry-search-input");

    // =========================================================
    // MODAL
    // =========================================================

    this.modal = document.getElementById("property-modal");
    this.btnOpenModal = document.getElementById("btn-open-modal");
    this.btnCloseModal = document.getElementById("btn-close-modal");
    this.btnCancelModal = document.getElementById("btn-cancel-modal");
    this.propertyForm = document.getElementById("property-form");
    this.modalTitle = document.getElementById("modal-title");
    this.mediaInput = document.getElementById("media-file-input");
    this.mediaList = document.getElementById("media-list");

    // Medios preparados para el modal actual. No se suben ni se eliminan
    // hasta que el usuario presiona "Guardar Propiedad".
    this.currentMedia = [];
    this.pendingMedia = [];
    this.mediaToDelete = [];

    // =========================================================
    // DATOS
    // =========================================================

    this.properties = [];
    this.inquiries = [];

    // =========================================================
    // INICIALIZAR
    // =========================================================

    this.init();
  }


  // ===========================================================
  // CARGAR DESDE SUPABASE
  // ===========================================================

  async loadProperties() {

    const { data, error } = await supabase
      .from("properties")
      .select('*, "property-media" (*)')
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando propiedades desde Supabase:", error);
      alert("No se pudieron cargar las propiedades desde Supabase. Revisa la consola del navegador para ver el error.");
      return [];
    }

    // Mapeamos cada propiedad para estructurar correctamente la galería media
    return Array.isArray(data) ? data.map(p => this.normalizeProperty(p)) : [];
  }

  async loadInquiries() {
    const { data, error } = await supabase
      .from("inquiries")
      .select("*");

    if (error) {
      console.warn("La tabla de consultas (inquiries) aún no existe o no está disponible en Supabase:", error);
      return [];
    }

    return Array.isArray(data) ? data : [];
  }


  // ===========================================================
  // NORMALIZAR DATOS
  // ===========================================================

  normalizeProperty(property) {
    const rawMedia = property["property-media"] || property["property_media"] || property.media || [];

    return {
      id: property.id,
      created_at: property.created_at,
      title: property.title || "",
      location: property.location || "",
      type: property.type || "Casa",
      price: property.price || "",
      status: property.status || "Disponible",
      bedrooms: Number(property.bedrooms ?? 0),
      bathrooms: Number(property.bathrooms ?? 0),
      area: property.area || "",
      description: property.description || "",
      activeProperties: property.activeProperties === true,
      activePortfolio: property.activePortfolio === true,
      media: rawMedia.map(media => ({
        id: media.id,
        type: media.type || "image",
        url: media.url,
        caption: media.caption || ""
      }))
    };
  }


  // ===========================================================
  // INIT
  // ===========================================================

  async init() {

    if (this.searchInput) {
      this.searchInput.addEventListener("input", () => this.render());
    }

    if (this.inquirySearchInput) {
      this.inquirySearchInput.addEventListener("input", () => this.renderInquiries());
    }

    if (this.btnOpenModal) {
      this.btnOpenModal.addEventListener("click", () => this.openModal());
    }

    if (this.btnCloseModal) {
      this.btnCloseModal.addEventListener("click", () => this.closeModal());
    }

    if (this.btnCancelModal) {
      this.btnCancelModal.addEventListener("click", () => this.closeModal());
    }

    if (this.propertyForm) {
      this.propertyForm.addEventListener("submit", e => this.handleFormSubmit(e));
    }

    if (this.mediaInput) {
      this.mediaInput.addEventListener("change", e => {
        this.addPendingMedia(Array.from(e.target.files || []));
        e.target.value = "";
      });
    }

    this.properties = await this.loadProperties();
    this.inquiries = await this.loadInquiries();
    this.render();
    this.renderInquiries();

    console.log("Panel administrativo conectado a Supabase correctamente.");
  }


  // ===========================================================
  // ABRIR MODAL
  // ===========================================================

  openModal(id = null) {

    if (!this.modal) return;

    if (id) {

      const prop = this.properties.find(
        p => String(p.id) === String(id)
      );

      if (!prop) return;

      this.modalTitle.textContent = "Editar Propiedad";

      document.getElementById("prop-id").value = prop.id;
      document.getElementById("prop-title").value = prop.title || "";
      document.getElementById("prop-type").value = prop.type || "Casa";
      document.getElementById("prop-status").value = prop.status || "Disponible";
      document.getElementById("prop-location").value = prop.location || "";
      document.getElementById("prop-price").value = prop.price || "";
      document.getElementById("prop-bedrooms").value = prop.bedrooms ?? 0;
      document.getElementById("prop-bathrooms").value = prop.bathrooms ?? 0;
      document.getElementById("prop-area").value = prop.area || "";
      document.getElementById("prop-description").value = prop.description || "";
      document.getElementById("prop-active-properties").checked = prop.activeProperties === true;
      document.getElementById("prop-active-portfolio").checked = prop.activePortfolio === true;

      this.currentMedia = [...(prop.media || [])];

    } else {

      this.modalTitle.textContent = "Nueva Propiedad";
      this.propertyForm.reset();
      document.getElementById("prop-id").value = "";
      this.currentMedia = [];

    }

    this.pendingMedia = [];
    this.mediaToDelete = [];
    this.renderMediaList();

    this.modal.classList.remove("hidden");
    document.body.classList.add("modal-open");
  }


  // ===========================================================
  // CERRAR MODAL
  // ===========================================================

  closeModal() {

    if (!this.modal) return;

    this.modal.classList.add("hidden");
    document.body.classList.remove("modal-open");

    if (this.propertyForm) {
      this.propertyForm.reset();
    }

    this.currentMedia = [];
    this.pendingMedia = [];
    this.mediaToDelete = [];
    this.renderMediaList();
  }


  // ===========================================================
  // OBTENER DATOS DEL FORMULARIO
  // ===========================================================

  getFormData() {

    return {
      title: document.getElementById("prop-title").value.trim(),
      type: document.getElementById("prop-type").value,
      status: document.getElementById("prop-status").value,
      location: document.getElementById("prop-location").value.trim(),
      price: document.getElementById("prop-price").value.trim(),
      bedrooms: Number(document.getElementById("prop-bedrooms").value),
      bathrooms: Number(document.getElementById("prop-bathrooms").value),
      area: document.getElementById("prop-area").value.trim(),
      description: document.getElementById("prop-description").value.trim(),
      activeProperties: document.getElementById("prop-active-properties").checked,
      activePortfolio: document.getElementById("prop-active-portfolio").checked
    };
  }

 // ===========================================================
// GUARDAR FORMULARIO EN SUPABASE
// ===========================================================

async handleFormSubmit(e) {

    e.preventDefault();

    const id = document.getElementById("prop-id").value;
    const formData = this.getFormData();

    try {

      let savedProperty;

      // 1. Guardar o actualizar la propiedad principal
      if (id) {
        const { data, error } = await supabase
          .from("properties")
          .update(formData)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        savedProperty = data;
      } else {
        const { data, error } = await supabase
          .from("properties")
          .insert(formData)
          .select()
          .single();

        if (error) throw error;
        savedProperty = data;
      }

      document.getElementById("prop-id").value = savedProperty.id;

      // 2. Procesar eliminaciones y subidas en la tabla 'property-media' y Storage
      await this.saveMedia(savedProperty.id);

      // 3. Forzar sincronización limpia descargando todo de nuevo desde Supabase
      this.properties = await this.loadProperties();

      // 4. Cerrar y re-renderizar la vista
      this.closeModal();
      this.render();

    } catch (error) {
      console.error("Error guardando propiedad en Supabase:", error);
      alert("No se pudo guardar la propiedad en Supabase. Revisa la consola del navegador para ver el error.");
    }
  }

  // ===========================================================
  // MULTIMEDIA
  // ===========================================================

  addPendingMedia(files) {

    const validFiles = files.filter(file =>
      file.type.startsWith("image/") || file.type.startsWith("video/")
    );

    const availableSlots =
      MAX_MEDIA_FILES - this.currentMedia.length - this.pendingMedia.length;

    if (availableSlots <= 0) {
      alert(`Solo puedes guardar hasta ${MAX_MEDIA_FILES} archivos por propiedad.`);
      return;
    }

    const acceptedFiles = validFiles.slice(0, availableSlots);

    if (acceptedFiles.length < files.length) {
      alert(`Solo se agregaron ${acceptedFiles.length} archivo(s). El máximo es ${MAX_MEDIA_FILES}.`);
    }

    this.pendingMedia.push(...acceptedFiles);
    this.renderMediaList();
  }

  renderMediaList() {

    if (!this.mediaList) return;

    const existing = this.currentMedia.map(media => ({
      kind: "existing",
      label: media.caption || "Imagen de propiedad",
      type: media.type || "image",
      url: media.url,
      media
    }));

    const pending = this.pendingMedia.map((file, index) => ({
      kind: "pending",
      label: file.name,
      type: file.type.startsWith("video/") ? "video" : "image",
      url: URL.createObjectURL(file),
      index
    }));

    const items = [...existing, ...pending];

    if (!items.length) {
      this.mediaList.innerHTML = '<p class="text-muted" style="font-size:0.8rem; text-align:center; padding:12px;">No hay imágenes cargadas en esta propiedad.</p>';
      return;
    }

    this.mediaList.innerHTML = items.map(item => `
      <div class="media-item-card">
        <div class="media-preview-container">
          ${item.type === "video" 
            ? `<video src="${item.url}" class="media-thumb-preview" muted></video>` 
            : `<img src="${item.url}" alt="${this.escapeHtml(item.label)}" class="media-thumb-preview">`
          }
        </div>
        <span class="media-item-label" title="${this.escapeHtml(item.label)}">
          ${this.escapeHtml(item.label)}
          ${item.kind === "pending" ? " <small>(nuevo)</small>" : ""}
        </span>
        <button
          type="button"
          class="btn-remove-media"
          data-kind="${item.kind}"
          data-index="${item.kind === "pending" ? item.index : ""}"
          data-id="${item.kind === "existing" ? item.media.id : ""}"
          aria-label="Eliminar archivo"
        >&times;</button>
      </div>
    `).join("");

    this.mediaList.querySelectorAll(".btn-remove-media").forEach(button => {
      button.addEventListener("click", () => {
        if (button.dataset.kind === "pending") {
          this.pendingMedia.splice(Number(button.dataset.index), 1);
        } else {
          const media = this.currentMedia.find(item => String(item.id) === button.dataset.id);
          if (media) this.mediaToDelete.push(media);
          this.currentMedia = this.currentMedia.filter(item => String(item.id) !== button.dataset.id);
        }

        this.renderMediaList();
      });
    });
  }


  MediaList() {

    if (!this.mediaList) return;

    const existing = this.currentMedia.map(media => ({
      kind: "existing",
      label: media.caption || media.url,
      type: media.type || "image",
      media
    }));

    const pending = this.pendingMedia.map((file, index) => ({
      kind: "pending",
      label: file.name,
      type: file.type.startsWith("video/") ? "video" : "image",
      index
    }));

    const items = [...existing, ...pending];

    if (!items.length) {
      this.mediaList.innerHTML = "";
      return;
    }

    this.mediaList.innerHTML = items.map(item => `
      <div class="media-item-card">
        <span>${item.type === "video" ? "🎥" : "🖼️"}</span>
        <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${this.escapeHtml(item.label)}
          ${item.kind === "pending" ? " <small>(nuevo)</small>" : ""}
        </span>
        <button
          type="button"
          class="btn-remove-media"
          data-kind="${item.kind}"
          data-index="${item.kind === "pending" ? item.index : ""}"
          data-id="${item.kind === "existing" ? item.media.id : ""}"
          aria-label="Eliminar archivo"
        >&times;</button>
      </div>
    `).join("");

    this.mediaList.querySelectorAll(".btn-remove-media").forEach(button => {
      button.addEventListener("click", () => {
        if (button.dataset.kind === "pending") {
          this.pendingMedia.splice(Number(button.dataset.index), 1);
        } else {
          const media = this.currentMedia.find(item => String(item.id) === button.dataset.id);
          if (media) this.mediaToDelete.push(media);
          this.currentMedia = this.currentMedia.filter(item => String(item.id) !== button.dataset.id);
        }

        this.MediaList();
      });
    });
  }

  async saveMedia(propertyId) {

  for (const media of this.mediaToDelete) {

    let deleteQuery = supabase
      .from("property-media")
      .delete();

    // Borra por id si existe; si no, usa propiedad + URL.
    if (media.id !== null && media.id !== undefined) {
      deleteQuery = deleteQuery.eq("id", media.id);
    } else {
      deleteQuery = deleteQuery
        .eq("property_id", propertyId)
        .eq("url", media.url);
    }

    const { data: deletedRows, error: deleteError } =
      await deleteQuery.select("id");

    if (deleteError) {
      throw deleteError;
    }

    // Antes el fallo podía ser silencioso por una política de Supabase.
    if (!deletedRows || deletedRows.length === 0) {
      throw new Error(
        "Supabase no eliminó el registro multimedia."
      );
    }

    const path = this.getStoragePath(media.url);

    if (path) {
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([path]);

      if (storageError) {
        console.warn(
          "El registro fue eliminado, pero no el archivo de Storage:",
          storageError
        );
      }
    }
  }

  this.mediaToDelete = [];

  while (this.pendingMedia.length) {
    const file = this.pendingMedia[0];

    const type = file.type.startsWith("video/")
      ? "video"
      : "image";

    const filename = file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

    const path =
      `${propertyId}/${crypto.randomUUID()}-${filename}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);

    const { error: mediaError } = await supabase
      .from("property-media")
      .insert({
        property_id: propertyId,
        type,
        url: publicUrlData.publicUrl,
        caption: file.name
      });

    if (mediaError) {
      await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([path]);

      throw mediaError;
    }

    this.pendingMedia.shift();
  }
}

  getStoragePath(publicUrl) {
    const marker = `/object/public/${STORAGE_BUCKET}/`;
    const position = publicUrl.indexOf(marker);

    return position === -1
      ? null
      : decodeURIComponent(publicUrl.slice(position + marker.length));
  }


  escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = value || "";
    return element.innerHTML;
  }


  // ===========================================================
  // FILTRADO
  // ===========================================================

  getFilteredProperties() {

    if (!this.searchInput) {
      return this.properties;
    }

    const query = this.searchInput.value.toLowerCase().trim();

    if (!query) {
      return this.properties;
    }

    return this.properties.filter(
      prop =>
        (prop.title || "").toLowerCase().includes(query) ||
        (prop.location || "").toLowerCase().includes(query)
    );
  }

  getFilteredInquiries() {
    if (!this.inquirySearchInput) {
      return this.inquiries;
    }

    const query = this.inquirySearchInput.value.toLowerCase().trim();

    if (!query) {
      return this.inquiries;
    }

    return this.inquiries.filter(
      inquiry =>
        (inquiry.name || "").toLowerCase().includes(query) ||
        (inquiry.email || "").toLowerCase().includes(query) ||
        (inquiry.message || "").toLowerCase().includes(query) ||
        (inquiry.phone || "").toLowerCase().includes(query)
    );
  }


  // ===========================================================
  // TOGGLE VISIBILIDAD EN SUPABASE
  // ===========================================================

  async togglePropertyVisibility(id, field) {

    if (
      field !== "activeProperties" &&
      field !== "activePortfolio"
    ) {
      return;
    }

    const prop = this.properties.find(
      p => String(p.id) === String(id)
    );

    if (!prop) return;

    const newValue = !prop[field];

    const { data, error } = await supabase
      .from("properties")
      .update({ [field]: newValue })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error actualizando visibilidad:", error);
      alert("No se pudo actualizar la visibilidad en Supabase.");
      this.render();
      return;
    }

    Object.assign(prop, this.normalizeProperty(data));
    this.render();
  }


  // ===========================================================
  // ELIMINAR DESDE SUPABASE
  // ===========================================================

  async deleteProperty(id) {

    if (!confirm("¿Estás seguro de que deseas eliminar esta propiedad?")) {
      return;
    }

    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error eliminando propiedad:", error);
      alert("No se pudo eliminar la propiedad de Supabase.");
      return;
    }

    this.properties = this.properties.filter(
      p => String(p.id) !== String(id)
    );

    this.render();
  }

  async deleteInquiry(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar esta consulta?")) {
      return;
    }

    const { error } = await supabase
      .from("inquiries")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error eliminando consulta:", error);
      alert("No se pudo eliminar la consulta de Supabase.");
      return;
    }

    this.inquiries = this.inquiries.filter(
      i => String(i.id) !== String(id)
    );

    this.renderInquiries();
  }


  // ===========================================================
  // RENDER
  // ===========================================================

  render() {

    if (!this.tbody) return;

    const filtered = this.getFilteredProperties();

    this.tbody.innerHTML = filtered.map(prop => `

      <tr>

        <td>
          <span class="prop-info-title">
            ${prop.title || ""}
          </span>
          <span class="prop-info-sub">
            ${prop.location || ""}
          </span>
        </td>

        <td>
          ${prop.type || ""}
        </td>

        <td>
          <strong>
            ${prop.price || ""}
          </strong>
        </td>

        <td>
          <span
            class="status-badge status-${(
              prop.status || ""
            ).toLowerCase().replace(/\s+/g, "-")}"
          >
            ${prop.status || ""}
          </span>
        </td>

        <td>
          <label class="switch">
            <input
              type="checkbox"
              class="toggle-input"
              data-id="${prop.id}"
              data-field="activeProperties"
              ${prop.activeProperties ? "checked" : ""}
            >
            <span class="toggle-slider"></span>
          </label>
        </td>

        <td>
          <label class="switch">
            <input
              type="checkbox"
              class="toggle-input"
              data-id="${prop.id}"
              data-field="activePortfolio"
              ${prop.activePortfolio ? "checked" : ""}
            >
            <span class="toggle-slider"></span>
          </label>
        </td>

        <td class="text-right">
          <button
            class="btn-icon btn-edit"
            data-id="${prop.id}"
            title="Editar"
          >
            &#9998;
          </button>

          <button
            class="btn-icon btn-delete"
            data-id="${prop.id}"
            title="Eliminar"
            style="color: var(--status-vendido-text);"
          >
            &times;
          </button>
        </td>

      </tr>

    `).join("");


    // =========================================================
    // SWITCHES
    // =========================================================

    this.tbody
      .querySelectorAll(".toggle-input")
      .forEach(input => {

        input.addEventListener("change", e => {

          const id = e.target.dataset.id;
          const field = e.target.dataset.field;

          this.togglePropertyVisibility(id, field);
        });
      });


    // =========================================================
    // EDITAR
    // =========================================================

    this.tbody
      .querySelectorAll(".btn-edit")
      .forEach(btn => {

        btn.addEventListener("click", e => {

          const id = e.currentTarget.dataset.id;
          this.openModal(id);
        });
      });


    // =========================================================
    // ELIMINAR
    // =========================================================

    this.tbody
      .querySelectorAll(".btn-delete")
      .forEach(btn => {

        btn.addEventListener("click", e => {

          const id = e.currentTarget.dataset.id;
          this.deleteProperty(id);
        });
      });
  }

  renderInquiries() {
    if (!this.inquiriesTbody) return;

    const filtered = this.getFilteredInquiries();

    if (!filtered.length) {
      this.inquiriesTbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: #718096; padding: 24px;">
            No hay consultas registradas o la tabla "inquiries" aún no ha sido creada en Supabase.
          </td>
        </tr>
      `;
      return;
    }

    this.inquiriesTbody.innerHTML = filtered.map(inquiry => `
      <tr>
        <td>
          <span class="prop-info-title">${this.escapeHtml(inquiry.name || "Sin nombre")}</span>
          <span class="prop-info-sub">${this.escapeHtml(inquiry.email || "Sin email")} ${inquiry.phone ? `• ${this.escapeHtml(inquiry.phone)}` : ""}</span>
        </td>
        <td>
          <span style="display: block; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${this.escapeHtml(inquiry.message || "")}">
            ${this.escapeHtml(inquiry.message || "Sin mensaje")}
          </span>
        </td>
        <td>
          <small>${inquiry.created_at ? new Date(inquiry.created_at).toLocaleString() : ""}</small>
        </td>
        <td class="text-right">
          <button
            class="btn-icon btn-delete-inquiry"
            data-id="${inquiry.id}"
            title="Eliminar consulta"
            style="color: var(--status-vendido-text);"
          >
            &times;
          </button>
        </td>
      </tr>
    `).join("");

    this.inquiriesTbody.querySelectorAll(".btn-delete-inquiry").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = e.currentTarget.dataset.id;
        this.deleteInquiry(id);
      });
    });
  }
}


// =============================================================
// INICIALIZACIÓN
// =============================================================

function setLoginError(message = "") {
  const errorElement = document.getElementById("admin-login-error");
  if (errorElement) errorElement.textContent = message;
}

function showAdminApp() {
  document.body.classList.add("admin-authenticated");
  if (!window.adminApp) window.adminApp = new AdminDashboard();
}

async function signOut() {
  await supabase.auth.signOut();
  window.adminApp = null;
  document.body.classList.remove("admin-authenticated");
  document.getElementById("admin-login-form")?.reset();
  setLoginError("");
}

async function restoreSession() {
  const { data } = await supabase.auth.getSession();
  const email = data.session?.user?.email?.toLowerCase();

  if (email === ADMIN_EMAIL) {
    showAdminApp();
  } else if (data.session) {
    await signOut();
    setLoginError("Esta cuenta no tiene acceso al panel.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("admin-login-form");
  const logoutButton = document.getElementById("btn-logout");

  loginForm?.addEventListener("submit", async event => {
    event.preventDefault();

    const email = document.getElementById("admin-email").value.trim().toLowerCase();
    const password = document.getElementById("admin-password").value;
    const button = document.getElementById("admin-login-submit");

    setLoginError("");
    button.disabled = true;
    button.textContent = "Ingresando...";

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    button.disabled = false;
    button.textContent = "Ingresar";

    if (error || !data.user) {
      console.error("Error de inicio de sesión:", error);
      setLoginError(
        error?.message || "No se pudo iniciar sesión."
      );
      return;
    }

    if (data.user.email?.toLowerCase() !== ADMIN_EMAIL) {
      await signOut();
      setLoginError("Esta cuenta no tiene acceso al panel.");
      return;
    }

    showAdminApp();
  });

  logoutButton?.addEventListener("click", signOut);
  restoreSession();
});
