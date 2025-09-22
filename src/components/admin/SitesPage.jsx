import React, { useState } from 'react';

export default function SitesPage() {
  const [sites, setSites] = useState([
    {
      id: 1,
      name: 'Main Office',
      address: '123 Business District, Manila',
      status: 'Active',
      employees: 25
    },
    {
      id: 2,
      name: 'Branch Office',
      address: '456 Commercial Ave, Makati',
      status: 'Active',
      employees: 15
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    status: 'Active'
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (editingSite) {
      setSites(prev => prev.map(site => 
        site.id === editingSite.id ? { ...site, ...formData } : site
      ));
    } else {
      setSites(prev => [...prev, { ...formData, id: Date.now(), employees: 0 }]);
    }
    setShowForm(false);
    setEditingSite(null);
    setFormData({ name: '', address: '', status: 'Active' });
  }

  function handleEdit(site) {
    setEditingSite(site);
    setFormData({
      name: site.name,
      address: site.address,
      status: site.status
    });
    setShowForm(true);
  }

  function handleDelete(id) {
    setSites(prev => prev.filter(site => site.id !== id));
  }

  return (
    <div className="content-area">
      <div className="content-header">
        <h1 className="page-title">Sites</h1>
        <p className="page-subtitle">Manage company locations and work sites</p>
      </div>

      <div className="content-body">
        {/* Add/Edit Form */}
        {showForm && (
          <div className="premium-card mb-8">
            <div className="card-header">
              <h3 className="card-title">
                {editingSite ? 'Edit Site' : 'Add New Site'}
              </h3>
              <button 
                className="btn btn-ghost"
                onClick={() => {
                  setShowForm(false);
                  setEditingSite(null);
                  setFormData({ name: '', address: '', status: 'Active' });
                }}
              >
                Cancel
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label required">Site Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter site name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-textarea"
                  rows="3"
                  placeholder="Enter site address"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingSite ? 'Update Site' : 'Add Site'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sites List */}
        <div className="premium-card">
          <div className="card-header">
            <h3 className="card-title">Work Sites</h3>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Add Site
            </button>
          </div>
          
          {sites.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏢</div>
              <div className="empty-state-title">No sites found</div>
              <div className="empty-state-description">Add your first work site to get started</div>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Site Name</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Employees</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sites.map(site => (
                    <tr key={site.id}>
                      <td style={{ fontWeight: '600' }}>{site.name}</td>
                      <td>{site.address}</td>
                      <td>
                        <span className={`badge ${site.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                          {site.status}
                        </span>
                      </td>
                      <td>{site.employees}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleEdit(site)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleDelete(site.id)}
                            style={{ color: '#ef4444' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}