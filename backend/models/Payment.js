const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  premium: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Premium',
    default: null
  },
  purchase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase',
    default: null
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['upi_qr', 'card', 'netbanking', 'wallet', 'manual'],
    default: 'upi_qr'
  },
  upiId: {
    type: String,
    default: null
  },
  upiApp: {
    type: String,
    default: null
  },
  transactionId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
