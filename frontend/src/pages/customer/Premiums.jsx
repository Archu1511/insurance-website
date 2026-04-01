import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiDollarSign } from 'react-icons/fi';
import UPIPaymentModal from '../../components/UPIPaymentModal';

const Premiums = () => {
  const [premiums, setPremiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState(null); // { premiumId, amount }

  const fetchPremiums = async () => {
    try {
      const { data } = await axios.get('/api/premiums');
      setPremiums(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchPremiums(); }, []);

  const handlePayClick = (premium) => {
    setPaymentModal({ premiumId: premium._id, amount: premium.amount });
  };

  const handlePaymentSuccess = () => {
    setPaymentModal(null);
    toast.success('Premium paid successfully!');
    fetchPremiums();
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  const groupedPremiums = premiums.reduce((acc, current) => {
    const key = current.purchase?._id || 'unknown';
    if (!acc[key]) {
      acc[key] = {
        policyTitle: current.purchase?.policy?.title || 'Unknown Policy',
        policyType: current.purchase?.policy?.type || '',
        premiums: []
      };
    }
    acc[key].premiums.push(current);
    return acc;
  }, {});

  Object.values(groupedPremiums).forEach(group => {
    group.premiums.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  });

  return (
    <div>
      <div className="page-header">
        <h1>Premium Payments</h1>
        <p>Manage and pay your policy premiums via UPI</p>
      </div>

      {premiums.length === 0 ? (
        <div className="empty-state">
          <FiDollarSign />
          <h3>No premiums found</h3>
          <p>Purchase a policy to see your premiums</p>
        </div>
      ) : (
        <div>
          {Object.values(groupedPremiums).map((group, idx) => (
            <div key={idx} style={{ marginBottom: '2rem', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', color: 'var(--primary-color)' }}>
                {group.policyTitle} {group.policyType && <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'normal'}}>({group.policyType})</span>}
              </h3>
              <div className="table-container" style={{ margin: 0, boxShadow: 'none' }}>
                <table style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Paid Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.premiums.map(p => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 500 }}>₹{p.amount}</td>
                        <td>{new Date(p.dueDate).toLocaleDateString()}</td>
                        <td>{p.paidDate ? new Date(p.paidDate).toLocaleDateString() : '—'}</td>
                        <td><span className={`badge ${p.status}`}>{p.status}</span></td>
                        <td>
                          {p.status !== 'paid' && (
                            <button className="btn btn-success btn-sm" onClick={() => handlePayClick(p)}>Pay via UPI</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPI Payment Modal */}
      {paymentModal && (
        <UPIPaymentModal
          amount={paymentModal.amount}
          premiumId={paymentModal.premiumId}
          onSuccess={handlePaymentSuccess}
          onClose={() => setPaymentModal(null)}
        />
      )}
    </div>
  );
};

export default Premiums;
