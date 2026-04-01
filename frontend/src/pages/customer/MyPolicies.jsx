import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiFileText } from 'react-icons/fi';

const MyPolicies = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const { data } = await axios.get('/api/purchases');
        setPurchases(data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchPurchases();
  }, []);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  const currentPurchases = purchases.filter(p => p.status === 'active');
  const pastPurchases = purchases.filter(p => p.status !== 'active');
  const displayedPurchases = activeTab === 'current' ? currentPurchases : pastPurchases;

  return (
    <div>
      <div className="page-header">
        <h1>My Policies</h1>
        <p>View your purchased insurance policies</p>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <button 
          className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`} 
          onClick={() => setActiveTab('current')}
          style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'current' ? '2px solid var(--primary-color)' : 'none', cursor: 'pointer', fontWeight: activeTab === 'current' ? 600 : 400, color: activeTab === 'current' ? 'var(--primary-color)' : 'var(--text-secondary)' }}
        >
          Current Policies
        </button>
        <button 
          className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`} 
          onClick={() => setActiveTab('past')}
          style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'past' ? '2px solid var(--primary-color)' : 'none', cursor: 'pointer', fontWeight: activeTab === 'past' ? 600 : 400, color: activeTab === 'past' ? 'var(--primary-color)' : 'var(--text-secondary)' }}
        >
          Past Policies
        </button>
      </div>

      {displayedPurchases.length === 0 ? (
        <div className="empty-state">
          <FiFileText />
          <h3>No {activeTab} policies found</h3>
          <p>{activeTab === 'current' ? 'Browse available policies to get started' : 'You have no expired or cancelled policies'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Policy</th>
                <th>Type</th>
                <th>Premium</th>
                <th>Paid Premiums</th>
                <th>Unpaid Premiums</th>
                <th>Next Due Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedPurchases.map(p => (
                <tr key={p._id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.policy?.title}</td>
                  <td>{p.policy?.type}</td>
                  <td>₹{p.premiumAmount || (p.policy && p.policy.premiumAmount) || 0}</td>
                  <td>{p.paidPremiums || 0}</td>
                  <td>{p.unpaidPremiums || 0}</td>
                  <td>{p.nextDueDate ? new Date(p.nextDueDate).toLocaleDateString() : 'Paid Up'}</td>
                  <td>{new Date(p.endDate).toLocaleDateString()}</td>
                  <td><span className={`badge ${p.status}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyPolicies;
