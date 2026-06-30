export function getProductBuilderUrl(productId?: string): string {
  const base = `${import.meta.env.BASE_URL}product-builder.html`;
  if (!productId) return base;
  return `${base}?product=${encodeURIComponent(productId)}`;
}
