/**
 * process-heritage-image
 * Supabase Edge Function: add Al-Ameen Emerald Star logo to all four corners of images
 * uploaded to the heritage-majlis bucket and inject SEO metadata (JPEG comment segment).
 * Trigger via Database Webhook on storage.objects INSERT.
 *
 * Prerequisite: Transparent PNG logo at LOGO_URL (e.g. /static/al-ameen-star-emerald.png).
 * Env: LOGO_URL (required), HERITAGE_BUCKET (default: heritage-majlis).
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Image } from "npm:imagescript@1.3.0";

const HERITAGE_BUCKET = Deno.env.get("HERITAGE_BUCKET") ?? "heritage-majlis";
const LOGO_URL = Deno.env.get("LOGO_URL") ?? "";
const PADDING_PX = 20;
const LOGO_SCALE = 0.1; // logo width = 10% of base image width

const SEO_COPYRIGHT =
  "Digital Archive of Al-Ameen Caps - Preserving the Legacy of Imam Abdullah Kadi Abdus Salaam (Tuan Guru) through the Taliep & Rakiep lineages—from Imam Mogamat Talaabodien (Ou Bappa) to Asia Taliep (Oemie).";
const SEO_KEYWORDS =
  "Imam Abdullah Kadi Abdus Salaam, Tuan Guru, Imam Mogamat Talaabodien, Ou Bappa, Imam Achmat Talaabodien, Bappa, Asia Taliep, Oemie, District Six, Bridgetown, Taliep Lineage, Rakiep Heritage, Auwal Masjid, Tana Baru Cemetery";

interface StorageObjectRecord {
  bucket_id?: string;
  name?: string;
  id?: string;
}

interface WebhookPayload {
  type?: string;
  table?: string;
  record?: StorageObjectRecord;
  old_record?: unknown;
}

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function fetchImage(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  return res.arrayBuffer();
}

export async function brandImage(baseBytes: ArrayBuffer, logoBytes: ArrayBuffer): Promise<Uint8Array> {
  const base = await Image.decode(new Uint8Array(baseBytes));
  const logo = await Image.decode(new Uint8Array(logoBytes));

  const baseW = base.width;
  const baseH = base.height;
  const logoW = Math.max(1, Math.round(baseW * LOGO_SCALE));
  const logoH = Math.max(1, Math.round((logo.height * logoW) / logo.width));
  const logoResized = logo.resize(logoW, logoH);

  const padding = PADDING_PX;
  const positions: [number, number][] = [
    [padding, padding],
    [baseW - logoW - padding, padding],
    [padding, baseH - logoH - padding],
    [baseW - logoW - padding, baseH - logoH - padding],
  ];

  for (const [x, y] of positions) {
    base.composite(logoResized, x, y);
  }

  return base.encodeJPEG(0.92);
}

/** Inject a JPEG COM (comment) segment after SOI with copyright and keywords. Metadata travels with the file. */
function injectJpegComment(jpegBytes: Uint8Array, comment: string): Uint8Array {
  const SOI_LEN = 2;
  if (jpegBytes.length < SOI_LEN || jpegBytes[0] !== 0xff || jpegBytes[1] !== 0xd8) {
    return jpegBytes;
  }
  const encoder = new TextEncoder();
  const commentBytes = encoder.encode(comment);
  const segLen = 2 + commentBytes.length;
  if (segLen > 0xffff) return jpegBytes;
  const out = new Uint8Array(SOI_LEN + 2 + 2 + commentBytes.length + (jpegBytes.length - SOI_LEN));
  let off = 0;
  out[off++] = 0xff;
  out[off++] = 0xd8;
  out[off++] = 0xff;
  out[off++] = 0xfe;
  out[off++] = (segLen >> 8) & 0xff;
  out[off++] = segLen & 0xff;
  out.set(commentBytes, off);
  off += commentBytes.length;
  out.set(jpegBytes.subarray(SOI_LEN), off);
  return out;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*" } });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let payload: WebhookPayload;
  try {
    payload = (await req.json()) as WebhookPayload;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const record = payload?.record;
  const bucketId = record?.bucket_id ?? "";
  const path = record?.name ?? "";

  const schema = (payload as { schema?: string }).schema;
  const table = payload?.table;
  if (payload?.type !== "INSERT" || schema !== "storage" || table !== "objects") {
    return new Response(
      JSON.stringify({ ok: true, message: "Ignored: not a storage.objects INSERT" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  if (bucketId !== HERITAGE_BUCKET || !path) {
    return new Response(
      JSON.stringify({ ok: true, message: `Ignored: bucket=${bucketId} path=${path || "(empty)"}` }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!LOGO_URL) {
    console.error("LOGO_URL not set");
    return new Response(JSON.stringify({ error: "LOGO_URL not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return new Response(JSON.stringify({ error: "Supabase not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucketId)
      .download(path);

    if (downloadError || !fileData) {
      console.error("Download error", downloadError);
      return new Response(JSON.stringify({ error: "Failed to download image" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const baseBytes = await fileData.arrayBuffer();
    const logoBytes = await fetchImage(LOGO_URL);

    const brandedJpeg = await brandImage(baseBytes, logoBytes);
    const metadataComment = `${SEO_COPYRIGHT} Keywords: ${SEO_KEYWORDS}`;
    const finalJpeg = injectJpegComment(brandedJpeg, metadataComment);

    const { error: uploadError } = await supabase.storage
      .from(bucketId)
      .upload(path, finalJpeg, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error", uploadError);
      return new Response(JSON.stringify({ error: "Failed to upload branded image" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        path,
        message: "Image branded, metadata injected, and saved",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("process-heritage-image error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Image processing failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
