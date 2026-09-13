const mongoose = require('mongoose');

// Stores every "Need This Laptop" form submission so the store also has a
// durable record even though the actual conversation happens over WhatsApp
// (via wa.me deep link — no WhatsApp Business API required).
const inquirySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    // Snapshot of the variant the customer actually selected, if any. Stored
    // by id plus a copy of the identifying fields at inquiry time, since the
    // variant itself may later be edited or removed from the product.
    variantId: { type: mongoose.Schema.Types.ObjectId },
    variantColor: { type: String, trim: true },
    variantSize: { type: String, trim: true },
    variantSku: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    city: { type: String, trim: true },
    message: { type: String, trim: true, maxlength: 500 },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new', index: true },
  },
  { timestamps: true }
);

inquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
