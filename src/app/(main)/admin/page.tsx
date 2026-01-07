'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, Server, AlertTriangle, TrendingUp, 
  Search, Filter, Mail, CreditCard, XCircle, CheckCircle,
  BarChart3, Clock, RefreshCw, Eye, Edit, Gift
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  // Simulated data - replace with actual API calls
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUsers([
        {
          id: 'user_1',
          email: 'alice@example.com',
          displayName: 'Alice Johnson',
          plan: 'business',
          status: 'active',
          sites: 8,
          mrr: 35,
          signupDate: Date.now() - 45 * 24 * 60 * 60 * 1000,
          lastLogin: Date.now() - 2 * 60 * 60 * 1000,
          usage: { sites: 8, bandwidth: 125 * 1024 * 1024 * 1024 }
        },
        {
          id: 'user_2',
          email: 'bob@startup.com',
          displayName: 'Bob Smith',
          plan: 'premium',
          status: 'active',
          sites: 22,
          mrr: 75,
          signupDate: Date.now() - 120 * 24 * 60 * 60 * 1000,
          lastLogin: Date.now() - 30 * 60 * 1000,
          usage: { sites: 22, bandwidth: 580 * 1024 * 1024 * 1024 }
        },
        {
          id: 'user_3',
          email: 'charlie@freelance.io',
          displayName: 'Charlie Brown',
          plan: 'basic',
          status: 'trial',
          sites: 2,
          mrr: 0,
          signupDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
          lastLogin: Date.now() - 1 * 60 * 60 * 1000,
          usage: { sites: 2, bandwidth: 15 * 1024 * 1024 * 1024 }
        },
        {
          id: 'user_4',
          email: 'diana@agency.com',
          displayName: 'Diana Prince',
          plan: 'business',
          status: 'past_due',
          sites: 12,
          mrr: 35,
          signupDate: Date.now() - 200 * 24 * 60 * 60 * 1000,
          lastLogin: Date.now() - 48 * 60 * 60 * 1000,
          usage: { sites: 12, bandwidth: 210 * 1024 * 1024 * 1024 }
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const stats = {
    totalUsers: users.length,
    activeSubscriptions: users.filter(u => u.status === 'active').length,
    mrr: users.reduce((sum, u) => sum + u.mrr, 0),
    churnRate: 2.3,
    avgSitesPerUser: users.length ? (users.reduce((sum, u) => sum + u.sites, 0) / users.length).toFixed(1) : 0,
    trialsActive: users.filter(u => u.status === 'trial').length,
    pastDue: users.filter(u => u.status === 'past_due').length,
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    const colors: {[key: string]: string} = {
      active: 'bg-green-100 text-green-800',
      trial: 'bg-blue-100 text-blue-800',
      past_due: 'bg-red-100 text-red-800',
      canceled: 'bg-slate-100 text-slate-800',
    };
    return colors[status] || colors.canceled;
  };

  const getPlanColor = (plan: string) => {
    const colors: {[key: string]: string} = {
      basic: 'text-blue-600',
      business: 'text-purple-600',
      premium: 'text-amber-600',
    };
    return colors[plan] || 'text-slate-600';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 -mx-8 -mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 text-sm">JustHostIt Operations Center</p>
          </div>
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-8 -mx-8 mb-8">
        <div className="flex gap-6">
          {['overview', 'users', 'billing', 'support'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-2 border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 text-sm">Total Users</span>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{stats.totalUsers}</div>
                <div className="text-xs text-green-600 mt-1">+12% this month</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 text-sm">MRR</span>
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900">${stats.mrr}</div>
                <div className="text-xs text-green-600 mt-1">+8% this month</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 text-sm">Active Trials</span>
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{stats.trialsActive}</div>
                <div className="text-xs text-slate-600 mt-1">Converting at 45%</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 text-sm">Churn Rate</span>
                  <TrendingUp className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{stats.churnRate}%</div>
                <div className="text-xs text-green-600 mt-1">-0.5% vs last month</div>
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Action Required
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-slate-900">{stats.pastDue} Past Due Subscriptions</p>
                      <p className="text-sm text-slate-600">Users with failed payments need follow-up</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors">
                    Review
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-900">{stats.trialsActive} Trials Ending Soon</p>
                      <p className="text-sm text-slate-600">Reach out to convert to paid plans</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                    Contact
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-slate-900">All Systems Operational</p>
                      <p className="text-sm text-slate-600">99.98% uptime this month</p>
                    </div>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Healthy</span>
                </div>
              </div>
            </div>

            {/* Plan Distribution */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Plan Distribution</h2>
                <div className="space-y-3">
                  {['basic', 'business', 'premium'].map(plan => {
                    const count = users.filter(u => u.plan === plan).length;
                    const percentage = users.length ? (count / users.length) * 100 : 0;
                    return (
                      <div key={plan}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={`capitalize font-medium ${getPlanColor(plan)}`}>{plan}</span>
                          <span className="text-slate-600">{count} users ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${plan === 'basic' ? 'bg-blue-500' : plan === 'business' ? 'bg-purple-500' : 'bg-amber-500'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors text-left">
                    <Gift className="w-5 h-5 text-blue-600" />
                    <span className="text-slate-900">Grant Free Month</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors text-left">
                    <Mail className="w-5 h-5 text-purple-600" />
                    <span className="text-slate-900">Send Bulk Email</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors text-left">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    <span className="text-slate-900">Export Analytics</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors text-left">
                    <Server className="w-5 h-5 text-red-600" />
                    <span className="text-slate-900">Server Health Check</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users by email or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="past_due">Past Due</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">User</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Plan</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Sites</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">MRR</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Last Login</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-900">{user.displayName}</div>
                          <div className="text-sm text-slate-600">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`capitalize font-medium ${getPlanColor(user.plan)}`}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-900">{user.sites}</td>
                      <td className="px-6 py-4 text-slate-900 font-medium">${user.mrr}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {Math.floor((Date.now() - user.lastLogin) / (60 * 60 * 1000))}h ago
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Billing Overview</h2>
            <p className="text-slate-600">Billing management interface would go here...</p>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Support Tickets</h2>
            <p className="text-slate-600">Support ticket system would go here...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
