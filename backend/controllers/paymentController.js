const Payment = require('../models/Payment');
const Premium = require('../models/Premium');
const Purchase = require('../models/Purchase');
const Policy = require('../models/Policy');

// @desc    Create payment record
// @route   POST /api/payments/create-order
exports.createOrder = async (req, res) => {
  try {
    const {
      amount,
      premiumId,
      policyId,
      paymentMethod = 'upi_qr',
      upiId = null,
      upiApp = null
    } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    const payment = await Payment.create({
      customer: req.user._id,
      premium: premiumId || null,
      purchase: policyId || null,
      amount,
      paymentMethod,
      upiId,
      upiApp,
      transactionId,
      status: 'pending'
    });

    res.status(201).json({
      _id: payment._id,
      amount: amount,
      currency: 'INR',
      transactionId,
      paymentMethod,
      upiId,
      upiApp
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, policyId, transactionId, paymentMethod, upiId, upiApp } = req.body;

    // Update payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.status = 'completed';
    if (transactionId) payment.transactionId = transactionId;
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (upiId) payment.upiId = upiId;
    if (upiApp) payment.upiApp = upiApp;
    await payment.save();

    // If payment is for a premium, mark it as paid
    if (payment.premium) {
      const premium = await Premium.findById(payment.premium);
      if (premium && premium.status !== 'paid') {
        premium.status = 'paid';
        premium.paidDate = new Date();
        await premium.save();
      }
    }

    // If policyId provided, create a purchase
    if (policyId) {
      const policy = await Policy.findById(policyId);
      if (policy && policy.status === 'active') {
        const existingPurchase = await Purchase.findOne({
          customer: req.user._id,
          policy: policyId,
          status: 'active'
        });

        if (!existingPurchase) {
          const startDate = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + policy.duration);

          const purchase = await Purchase.create({
            customer: req.user._id,
            policy: policyId,
            startDate,
            endDate
          });

          const premiums = [];
          for (let i = 0; i < policy.duration; i++) {
            const dueDate = new Date(startDate);
            dueDate.setMonth(dueDate.getMonth() + i);
            premiums.push({
              purchase: purchase._id,
              customer: req.user._id,
              amount: policy.premiumAmount,
              dueDate,
              status: i === 0 ? 'paid' : 'pending',
              paidDate: i === 0 ? new Date() : null
            });
          }
          await Premium.insertMany(premiums);

          payment.purchase = purchase._id;
          await payment.save();
        }
      }
    }

    res.json({
      _id: payment._id,
      status: 'completed',
      message: 'Payment completed successfully'
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my payment history
// @route   GET /api/payments
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ customer: req.user._id })
      .populate('premium')
      .populate({
        path: 'purchase',
        populate: { path: 'policy', select: 'title type' }
      })
      .sort('-createdAt');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
