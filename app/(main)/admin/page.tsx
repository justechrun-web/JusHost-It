
'use client';

import React, { useState, useEffect } from 'react';
import { Users, Server, DollarSign, Activity, TrendingUp, AlertTriangle, Search, Settings, Database, HardDrive, Cpu, Zap, XCircle, CheckCircle, Clock, Mail, Phone, Download, MessageSquare, Bell, BellOff } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const fetchDashboardData = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    overview: { totalCustomers: 47, activeSubscriptions: 42, totalSites: 156, monthlyRevenue: 1680, averageRevenuePerUser: 40, churnRate: 4.2 },
    nodes: [
      { id: 'node-1', name: 'jushostit-gcp-us-east1', status: 'healthy', sites: 35, cpu: 45, memory: 62, disk: 58, uptime: 99.98 },
      { id: 'node-2', name: 'jushostit-gcp-us-central1', status: 'healthy', sites: 42, cpu: 52, memory: 71, disk: 64, uptime: 99.95 },
      { id: 'node-3', name: 'jushostit-gcp-us-west1', status: 'healthy', sites: 38, cpu: 48, memory: 65, disk: 61, uptime: 99.97 },
      { id: 'node-4', name: 'jushostit-gcp-europe-west1', status: 'warning', sites: 41, cpu: 78, memory: 84, disk: 73, uptime: 99.89 }
    ],
    customers: [
      { id: 'c1', name: 'Sarah Chen', email: 'sarah@techstartup.io', plan: 'Business', sites: 3, status: 'active', joined: '2025-01-08', mrr: 35, bandwidth: 45, storage: 12, tickets: 2 },
      { id: 'c2', name: 'Marcus Rodriguez', email: 'm.rodriguez@consulting.com', plan: 'Premium', sites: 5, status: 'active', joined: '2025-01-07', mrr: 75, bandwidth: 89, storage: 28, tickets: 0 },
      { id: 'c3', name: 'Emily Watson', email: 'emily.w@agency.net', plan: 'Business', sites: 4, status: 'active', joined: '2025-01-06', mrr: 35, bandwidth: 67, storage: 18, tickets: 1 },
      { id: 'c4', name: 'James Park', email: 'jpark@freelance.dev', plan: 'Basic', sites: 1, status: 'trial', joined: '2025-01-05', mrr: 0, bandwidth: 12, storage: 3, tickets: 3 },
      { id: 'c5', name: 'Lisa Anderson', email: 'lisa@photographer.com', plan: 'Basic', sites: 2, status: 'active', joined: '2025-01-04', mrr: 15, bandwidth: 34, storage: 8, tickets: 1 }
    ],
    alerts: [
      { id: 'a1', severity: 'warning', message: 'Node 4 CPU usage above 75%', time: '5 minutes ago', node: 'europe-west1', email_sent: true },
      { id: 'a2', severity: 'info', message: 'Automated backup completed for 156 sites', time: '2 hours ago', node: 'all', email_sent: false },
      { id: 'a3', severity: 'warning', message: 'SSL renewal pending for 3 certificates', time: '4 hours ago', node: 'us-central1', email_sent: true }
    ],
    tickets: [
      { id: 't1', customer: 'James Park', email: 'jpark@freelance.dev', subject: 'Site not loading after update', status: 'open', priority: 'high', created: '2 hours ago', responses: 1 },
      { id: 't2', customer: 'Sarah Chen', email: 'sarah@techstartup.io', subject: 'Need help with SSL setup', status: 'pending', priority: 'medium', created: '5 hours ago', responses: 2 }
    ],
    historicalRevenue: [
      { month: 'Jul', revenue: 980, customers: 28 },
      { month: 'Aug', revenue: 1120, customers: 32 },
      { month: 'Sep', revenue: 1295, customers: 37 },
      { month: 'Oct', revenue: 1435, customers: 41 },
      { month: 'Nov', revenue: 1540, customers: 44 },
      { month: 'Dec', revenue: 1610, customers: 46 },
      { month: 'Jan', revenue: 1680, customers: 47 }
    ],
    usageMetrics: { totalBandwidth: 2847, totalStorage: 438, avgSiteUptime: 99.94, apiRequests: 45823 }
  };
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [exportingCSV, setExportingCSV] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const dashboardData = await fetchDashboardData();
      setData(dashboardData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    setExportingCSV(true);
    const headers = ['Name', 'Email', 'Plan', 'Sites', 'Status', 'MRR', 'Bandwidth', 'Storage', 'Tickets', 'Joined'];
    const rows = data.customers.map(c => [c.name, c.email, c.plan, c.sites, c.status, c.mrr, c.bandwidth, c.storage, c.tickets, c.joined]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jushostit-customers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    setTimeout(() => setExportingCSV(false), 1000);
  };

  const getStatusColor = (status) => {
    const colors = { healthy: 'text-green-500', warning: 'text-yellow-500', critical: 'text-red-500', active: 'text-green-500', trial: 'text-blue-500', open: 'text-red-500', pending: 'text-yellow-500' };
    return colors[status] || 'text-gray-500';
  };

  const getUtilizationColor = (value) => value >= 80 ? 'bg-red-500' : value >= 60 ? 'bg-yellow-500' : 'bg-green-500';

  const getSeverityColor = (severity) => {
    const colors = { critical: 'bg-red-100 text-red-800 border-red-200', warning: 'bg-yellow-100 text-yellow-800 border-yellow-200', info: 'bg-blue-100 text-blue-800 border-blue-200' };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = { high: 'bg-red-500/20 text-red-300', medium: 'bg-yellow-500/20 text-yellow-300', low: 'bg-blue-500/20 text-blue-300' };
    return colors[priority] || 'bg-gray-500/20 text-gray-300';
  };

  const filteredCustomers = data?.customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-slate-400">JusHostIt Platform Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setEmailAlerts(!emailAlerts)} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${emailAlerts ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>
                {emailAlerts ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                Alerts {emailAlerts ? 'On' : 'Off'}
              </button>
              <button onClick={loadData} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors">
                <Activity className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-8 bg-slate-800/50 p-1 rounded-lg border border-slate-700 overflow-x-auto">
          {['overview', 'analytics', 'customers', 'nodes', 'tickets', 'alerts'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md font-medium transition-all whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-blue-100" />
                  <span className="text-blue-100 text-sm font-medium">Active</span>
                </div>
                <div className="text-4xl font-bold text-white mb-2">{data.overview.totalCustomers}</div>
                <div className="text-blue-100 text-sm">Total Customers</div>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-green-100" />
                  <span className="text-green-100 text-sm font-medium">MRR</span>
                </div>
                <div className="text-4xl font-bold text-white mb-2">${data.overview.monthlyRevenue}</div>
                <div className="text-green-100 text-sm">Monthly Revenue</div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <Server className="w-8 h-8 text-purple-100" />
                  <span className="text-purple-100 text-sm font-medium">Live</span>
                </div>
                <div className="text-4xl font-bold text-white mb-2">{data.overview.totalSites}</div>
                <div className="text-purple-100 text-sm">Active Sites</div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Server className="w-6 h-6 text-blue-400" />
                Infrastructure Health
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.nodes.map((node) => (
                  <div key={node.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${node.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                        <span className="text-white font-medium text-sm">{node.name}</span>
                      </div>
                      <span className="text-slate-400 text-sm">{node.sites} sites</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>CPU</span>
                          <span>{node.cpu}%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full ${getUtilizationColor(node.cpu)} transition-all`} style={{width: `${node.cpu}%`}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Revenue Growth</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.historicalRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" placeholder="Search customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <button onClick={exportToCSV} disabled={exportingCSV} className="px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center gap-2">
                <Download className="w-5 h-5" />
                {exportingCSV ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Plan</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">MRR</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-900/30">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">{customer.name}</div>
                        <div className="text-sm text-slate-400">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300">{customer.plan}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${getStatusColor(customer.status)}`}>{customer.status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">${customer.mrr}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => setSelectedCustomer(customer)} className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-400" />
                Support Tickets
              </h2>
              <div className="space-y-4">
                {data.tickets.map((ticket) => (
                  <div key={ticket.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                          <span className="text-slate-400 text-sm">{ticket.created}</span>
                        </div>
                        <h3 className="text-white font-medium mb-1">{ticket.subject}</h3>
                        <p className="text-slate-400 text-sm">{ticket.customer}</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">Respond</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {data.alerts.map((alert) => (
              <div key={alert.id} className={`rounded-xl p-4 border ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">{alert.message}</p>
                      <div className="flex items-center gap-3 text-sm opacity-75">
                        <span>{alert.time}</span>
                        <span>•</span>
                        <span>Node: {alert.node}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Customer Details</h2>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">Name</p>
                <p className="text-white font-medium">{selectedCustomer.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Email</p>
                <p className="text-white font-medium">{selectedCustomer.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Plan</p>
                <p className="text-white font-medium">{selectedCustomer.plan}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">MRR</p>
                <p className="text-white font-medium">${selectedCustomer.mrr}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
