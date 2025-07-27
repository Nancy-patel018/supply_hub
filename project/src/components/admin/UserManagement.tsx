import React, { useState } from 'react';
import { Search, Filter, Edit, Trash2, Plus, UserCheck, UserX, Eye } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([
    { id: '1', name: 'Raj Kumar', email: 'raj@example.com', role: 'vendor', status: 'active', joined: '2025-01-01', orders: 25 },
    { id: '2', name: 'Green Valley Farms', email: 'green@example.com', role: 'supplier', status: 'active', joined: '2024-12-15', orders: 142 },
    { id: '3', name: 'Express Delivery', email: 'express@example.com', role: 'transporter', status: 'active', joined: '2024-11-20', deliveries: 89 },
    { id: '4', name: 'Priya Foods', email: 'priya@example.com', role: 'vendor', status: 'inactive', joined: '2025-01-05', orders: 8 },
    { id: '5', name: 'Fresh Harvest Co.', email: 'fresh@example.com', role: 'supplier', status: 'pending', joined: '2025-01-10', orders: 0 },
    { id: '6', name: 'Quick Transport', email: 'quick@example.com', role: 'transporter', status: 'active', joined: '2024-10-10', deliveries: 156 }
  ]);

  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const roles = ['all', 'vendor', 'supplier', 'transporter'];
  const statuses = ['all', 'active', 'inactive', 'pending'];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'vendor':
        return 'bg-blue-100 text-blue-800';
      case 'supplier':
        return 'bg-green-100 text-green-800';
      case 'transporter':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = (userId: string, newStatus: string) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
          <Plus className="w-5 h-5" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-5 h-5" />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
          <div className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'vendor').length}</div>
          <div className="text-sm text-gray-600">Vendors</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
          <div className="text-2xl font-bold text-green-600">{users.filter(u => u.role === 'supplier').length}</div>
          <div className="text-sm text-gray-600">Suppliers</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
          <div className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'transporter').length}</div>
          <div className="text-sm text-gray-600">Transporters</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
          <div className="text-2xl font-bold text-yellow-600">{users.filter(u => u.status === 'pending').length}</div>
          <div className="text-sm text-gray-600">Pending Approval</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.joined}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.role === 'transporter' ? `${user.deliveries || 0} deliveries` : `${user.orders} orders`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-800" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      {user.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(user.id, 'active')}
                            className="text-green-600 hover:text-green-800"
                            title="Approve"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(user.id, 'inactive')}
                            className="text-red-600 hover:text-red-800"
                            title="Reject"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {user.status === 'active' && (
                        <button
                          onClick={() => handleStatusUpdate(user.id, 'inactive')}
                          className="text-red-600 hover:text-red-800"
                          title="Deactivate"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                      {user.status === 'inactive' && (
                        <button
                          onClick={() => handleStatusUpdate(user.id, 'active')}
                          className="text-green-600 hover:text-green-800"
                          title="Activate"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}