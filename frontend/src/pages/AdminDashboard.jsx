import { useState, useEffect } from 'react';
import AdminUploadForm from '../components/AdminUploadForm';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { role, token } = useAuth();
  const [activeTab, setActiveTab] = useState('add_product');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (activeTab === 'view_orders' && role === 'admin') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchOrders(); // Refetch orders directly from the database to guarantee UI is completely synced
      } else {
        const data = await response.json();
        alert(data.msg || data.error || "Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("An error occurred while deleting the order.");
    }
  };

  if (role !== 'admin') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="admin-dashboard">
      <h1 className="admin-title">Admin Dashboard</h1>
      
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'add_product' ? 'active' : ''}`}
          onClick={() => setActiveTab('add_product')}
        >
          Add Product
        </button>
        <button 
          className={`tab-btn ${activeTab === 'view_orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('view_orders')}
        >
          View Orders
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'add_product' && <AdminUploadForm />}
        
        {activeTab === 'view_orders' && (
          <div className="orders-container glass-panel">
            <h2>Recent Orders</h2>
            {loadingOrders ? (
              <p>Loading orders...</p>
            ) : orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              <div className="table-responsive">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Customer Email</th>
                      <th>Shipping Info</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        <td>{order.user_email}</td>
                        <td>
                          <strong>{order.phone || 'N/A'}</strong><br/>
                          {order.address || 'No address'}<br/>
                          PIN: {order.pincode || 'N/A'}
                        </td>
                        <td>
                          <ul className="order-items-list">
                            {order.items.map(item => (
                              <li key={item.id}>
                                {item.quantity}x {item.product_name} (Size: {item.size})
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td>₹{order.total_amount.toFixed(2)}</td>
                        <td>
                          <strong>{order.payment_method ? order.payment_method.toUpperCase() : 'N/A'}</strong>
                        </td>
                        <td>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDeleteOrder(order.id)}
                            style={{ backgroundColor: '#ff4444', color: 'white', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
