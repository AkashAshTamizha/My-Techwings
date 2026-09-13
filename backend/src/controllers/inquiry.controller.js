const Inquiry = require('../models/Inquiry');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const { buildWhatsAppLink } = require('../utils/whatsapp');

// POST /api/v1/inquiries
// Body: { productId, name, phone, email?, city?, message? }
//
// Flow (no WhatsApp Business API needed):
//   1. Validate + persist the lead in MongoDB so the store never loses it.
//   2. Build a `https://wa.me/<storeNumber>?text=<prefilled message>` link.
//   3. Return that link to the frontend, which opens it in a new tab —
//      this hands the conversation off to the customer's own WhatsApp
//      client, pre-filled with their details and the product they want.
exports.createInquiry = asyncHandler(async (req, res) => {
  const { productId, variantId, name, phone, email, city, message } = req.body;

  const product = await Product.findById(productId).lean();
  if (!product) throw new AppError('Product not found', 404);

  // Looked up by the variant's own _id (never by array position), and only
  // trusted if it actually belongs to this product — a variantId for a
  // different product must never be attached to this inquiry.
  const variant = variantId
    ? (product.variants || []).find((v) => String(v._id) === String(variantId))
    : null;

  const inquiry = await Inquiry.create({
    product: productId,
    variantId: variant?._id,
    variantColor: variant?.color,
    variantSize: variant?.size,
    variantSku: variant?.sku,
    name,
    phone,
    email,
    city,
    message,
  });

  const whatsappUrl = buildWhatsAppLink({
    storeNumber: process.env.WHATSAPP_NUMBER,
    product,
    variant,
    customer: { name, phone, city, message },
  });

  res.status(201).json({ success: true, inquiryId: inquiry._id, whatsappUrl });
});

// GET /api/v1/inquiries  (admin, JWT-protected)
exports.listInquiries = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Inquiry.find(filter)
      .populate('product', 'name slug price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Inquiry.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, items, total, page: Number(page) });
});

exports.updateInquiryStatus = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );
  if (!inquiry) throw new AppError('Inquiry not found', 404);
  res.status(200).json({ success: true, inquiry });
});
