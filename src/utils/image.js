// /src/utils/image.js

export function pickImage(p) {
  if (!p) return null;

  const list = [
    p.image_url,
    p.main_img,
    p.img_url,
    p.img,
    Array.isArray(p.gallery) ? p.gallery[0] : null,
  ];

  for (const x of list) {
    if (typeof x === "string" && x.startsWith("http")) return x;
  }

  return list.find(Boolean) || null;
}

export function formatImage(img) {
  if (!img) return null;

  if (typeof img === "string" && img.startsWith("http")) {
    return img;
  }

  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/products/${img}`;
}
