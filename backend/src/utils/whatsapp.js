/**
 * Builds a wa.me deep link with a pre-filled message. This is the
 * "click to chat" mechanism (https://faq.whatsapp.com/general/chats/how-to-use-click-to-chat)
 * which requires no WhatsApp Business API, no approval process, and no
 * per-message cost — it simply opens the customer's own WhatsApp app/web
 * with the store's number and a pre-composed message ready to send.
 */
function buildWhatsAppLink({ storeNumber, product, variant, customer }) {
  const price = variant ? variant.price : product.price;

  const lines = [
    `Hi, I'm interested in the *${product.name}*${variant ? ` (${variant.color} / ${variant.size})` : ''}`,
    variant ? `SKU: ${variant.sku}` : null,
    `Price: Rs ${price?.toLocaleString('en-IN')}`,
    '',
    `Name: ${customer.name}`,
    `Phone: ${customer.phone}`,
    customer.city ? `City: ${customer.city}` : null,
    customer.message ? `Message: ${customer.message}` : null,
    '',
    `Product link: ${process.env.CLIENT_URL}/products/${product.slug}`,
  ].filter(Boolean);

  const text = encodeURIComponent(lines.join('\n'));
  const number = String(storeNumber).replace(/[^\d]/g, ''); // digits only, no '+'

  return `https://wa.me/${number}?text=${text}`;
}

module.exports = { buildWhatsAppLink };
