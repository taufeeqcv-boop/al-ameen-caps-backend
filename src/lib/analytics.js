export function pushEcommerceEvent(eventName, ecommercePayload) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ecommerce: ecommercePayload || {},
  });
}

