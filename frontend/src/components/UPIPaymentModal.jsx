import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiX } from 'react-icons/fi';

const UPIPaymentModal = ({ amount, premiumId, policyId, onSuccess, onClose }) => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [paymentId, setPaymentId] = useState(null);

  const handlePayment = async () => {
    try {
      // Create payment record
      const { data } = await axios.post('/api/payments/create-order', {
        amount,
        premiumId: premiumId || null,
        policyId: policyId || null
      });

      setPaymentId(data._id);
      setPaymentStatus('loading');
      setTimeLeft(20);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment');
    }
  };

  // Countdown timer
  useEffect(() => {
    if (paymentStatus !== 'loading') return;

    const timer = setTimeout(() => {
      completePayment();
    }, 5000);

    return () => clearTimeout(timer);
  }, [paymentStatus]);

  const completePayment = async () => {
    try {
      await axios.post('/api/payments/verify', {
        paymentId,
        policyId: policyId || null
      });

      setPaymentStatus('success');
      setTimeout(() => {
        onSuccess && onSuccess();
      }, 200);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
      setPaymentStatus(null);
    }
  };

  // Success screen
  if (paymentStatus === 'success') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal upi-modal" onClick={(e) => e.stopPropagation()}>
          <div className="upi-success">
            <div className="upi-success-icon">
              <FiCheckCircle />
            </div>
            <h2>Payment Successful!</h2>
            <p className="upi-success-amount">₹{amount}</p>
            <div className="upi-success-details">
              <span>Payment Completed</span>
            </div>
            <button className="btn btn-primary upi-done-btn" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading screen (20 seconds)
  if (paymentStatus === 'loading') {
    return (
      <div className="modal-overlay">
        <div className="modal upi-modal" onClick={(e) => e.stopPropagation()}>
          <div className="payment-loading">
            <div className="loading-spinner"></div>
            <h2>Processing Payment</h2>
            <p className="payment-amount">₹{amount}</p>
            <p className="loading-message">Processing your payment...</p>
          </div>
        </div>
      </div>
    );
  }

  // Initial payment button screen
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal upi-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="upi-modal-header">
          <div>
            <h2>Make Payment</h2>
            <p className="upi-modal-amount">Pay <strong>₹{amount}</strong></p>
          </div>
          <button className="upi-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Content */}
        <div className="upi-content">
          <div className="payment-info">
            <div className="payment-info-icon">✓</div>
            <h3>Confirm Payment</h3>
            <p>Click the button below to complete your payment</p>
            <p className="payment-highlight">Amount: ₹{amount}</p>
          </div>

          <button
            className="btn btn-primary upi-pay-btn"
            onClick={handlePayment}
          >
            {`Pay ₹${amount}`}
          </button>
        </div>

        {/* Footer */}
        <div className="upi-footer">
          <div className="upi-secure">
            ⚡ Instant Processing
          </div>
        </div>
      </div>
    </div>
  );
};

export default UPIPaymentModal;
