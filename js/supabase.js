// js/supabase.js

const SUPABASE_URL =
    "https://xprylzrdgwywucyovonf.supabase.co";

 const SUPABASE_ANON_KEY =
 "sb_publishable_hPoLjLs5r8iMIFJmSvs-Mw_Exn1G2mj"
export const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

/**
 * Obtiene las propiedades y sus archivos asociados desde Supabase.
 * El resultado conserva el formato que usa properties.js.
 */
export async function getPropertiesFromSupabase() {
    const { data, error } = await supabaseClient
        .from("properties")
        .select(`
            *,
            "property-media" (*)
        `);

    if (error) {
        console.error(
            "Error al cargar propiedades de Supabase:",
            error
        );

        return [];
    }

    return (data || []).map(item => {
        let formattedPrice = "Consultar";

        if (
            item.price !== null &&
            item.price !== undefined &&
            item.price !== ""
        ) {
            const rawPrice = String(item.price).trim();

            if (rawPrice.includes("$")) {
                formattedPrice = rawPrice;
            } else {
                const numericPrice = Number(
                    rawPrice.replace(/,/g, "")
                );

                formattedPrice = Number.isNaN(numericPrice)
                    ? rawPrice
                    : `$${numericPrice.toLocaleString("en-US")}`;
            }
        }

        const media = (item["property-media"] || [])
            .filter(mediaItem => mediaItem.url)
            .map(mediaItem => ({
                type: mediaItem.type || "image",
                url: mediaItem.url,
                caption: mediaItem.caption || ""
            }));

        return {
            id: item.id,

            title: item.title || "Propiedad sin título",

            type: item.type || "Casa",

            location: item.address || item.location || "",

            price: formattedPrice,

            bedrooms: Number(item.bedrooms) || 0,

            bathrooms: Number(item.bathrooms) || 0,

            // Se conserva tal como se guardó desde el panel:
            // evita terminar con “m² m²”.
            area: item.area || "",

            status: item.status || "Disponible",

            activeProperties: item.activeProperties === true,

            activePortfolio: item.activePortfolio === true,

            description: item.description || "",

            media
        };
    });
}
