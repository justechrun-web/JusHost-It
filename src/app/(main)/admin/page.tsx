'use client';

import React, { useState, useEffect } from 'react';
import { Users, Server, DollarSign, Activity, TrendingUp, AlertTriangle, Search, Settings, BarChart3, Database, HardDrive, Cpu, Zap, XCircle, CheckCircle, Clock, Mail, Phone } from 'lucide-react';

// Simulated API - Replace with actual backend calls
const fetchDashboardData = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    overview: {
      totalCustomers: 47,
      activeSubscriptions: 42,
      totalSites: 156,
      monthlyRevenue: 1680,
      averageRevenuePerUser: 40,
      churnRate: 4.2
    },
    nodes: [
      { id: 'node-1', name: 'jushostit-gcp-us-east1', status: 'healthy', sites: 35, cpu: 45, memory: 62, disk: 58, uptime: 99.98 },
      { id: 'node-2', name: 'jushostit-gcp-us-central1', status: 'healthy', sites: 42, cpu: 52, memory: 71, disk: 64, uptime: 99.95 },
      { id: 'node-3', name: 'jushostit-gcp-us-west1', status: 'healthy', sites: 38, cpu: 48, memory: 65, disk: 61, uptime: 99.97 },
      { id: 'node-4', name: 'jushostit-gcp-europe-west1', status: 'warning', sites: 41, cpu: 78, memory: 84, disk: 73, uptime: 99.89 }
    ],
    recentCustomers: [
      { id: 'cust-1', name: 'Sarah Chen', email: 'sarah@techstartup.io', plan: 'Business', sites: 3, status: 'active', joined: '2025-01-08', mrr: 35 },
      { id: 'cust-2', name: 'Marcus Rodriguez', email: 'm.rodriguez@consulting.com', plan: 'Premium', sites: 5, status: 'active', joined: '2025-01-07', mrr: 75 },
      { id: 'cust-3', name: 'Emily Watson', email: 'emily.w@agency.net', plan: 'Business', sites: 4, status: 'active', joined: '2025-01-06', mrr: 35 },
      { id: 'cust-4', name: 'James Park', email: 'jpark@freelance.dev', plan: 'Basic', sites: 1, status: 'trial', joined: '2025-01-05', mrr: 0 },
      { id: 'cust-5', name: 'Lisa Anderson', email: 'lisa@photographer.com', plan: 'Basic', sites: 2, status: 'active', joined: '2025-01-04', mrr: 15 }
    ],
    alerts: [
      { id: 'alert-1', severity: 'warning', message: 'Node 4 CPU usage above 75%', time: '5 minutes ago', node: 'europe-west1' },
      { id: 'alert-2', severity: 'info', message: 'Automated backup completed for 156 sites', time: '2 hours ago', node: 'all' },
      { id: 'alert-3', severity: 'warning', message: 'SSL renewal pending for 3 certificates', time: '4 hours ago', node: 'us-central1' }
    ],
    usageMetrics: {
      totalBandwidth: 2847,
      totalStorage: 438,
      avgSiteUptime: 99.94,
      apiRequests: 45823
    }
  };
};

const AdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

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

  const getStatusColor = (status:string) => {
    switch(status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      case 'active': return 'text-green-500';
      case 'trial': return 'text-blue-500';
      case 'suspended': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getUtilizationColor = (value:number) => {
    if (value >= 80) return 'bg-red-500';
    if (value >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getSeverityColor = (severity:string) => {
    switch(severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredCustomers = data?.recentCustomers.filter((customer:any) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
      {/* Header */}
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
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Activity className="w-4 h-4" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
          {['overview', 'customers', 'nodes', 'alerts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-blue-100" />
                  <span className="text-blue-100 text-sm font-medium">Active</span>
                </div>
                <div className="text-4xl font-bold text-white mb-2">{data.overview.totalCustomers}</div>
                <div className="text-blue-100 text-sm">Total Customers</div>
                <div className="mt-4 flex items-center gap-2 text-blue-100 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+8 this month</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-green-100" />
                  <span className="text-green-100 text-sm font-medium">MRR</span>
                </div>
                <div className="text-4xl font-bold text-white mb-2">${data.overview.monthlyRevenue}</div>
                <div className="text-green-100 text-sm">Monthly Recurring Revenue</div>
                <div className="mt-4 flex items-center gap-2 text-green-100 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12% vs last month</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <Server className="w-8 h-8 text-purple-100" />
                  <span className="text-purple-100 text-sm font-medium">Live</span>
                </div>
                <div className="text-4xl font-bold text-white mb-2">{data.overview.totalSites}</div>
                <div className="text-purple-100 text-sm">Active Sites</div>
                <div className="mt-4 flex items-center gap-2 text-purple-100 text-sm">
                  <Activity className="w-4 h-4" />
                  <span>{data.usageMetrics.avgSiteUptime}% uptime</span>
                </div>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="text-slate-400 text-sm mb-1">ARPU</div>
                <div className="text-2xl font-bold text-white">${data.overview.averageRevenuePerUser}</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="text-slate-400 text-sm mb-1">Churn Rate</div>
                <div className="text-2xl font-bold text-white">{data.overview.churnRate}%</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="text-slate-400 text-sm mb-1">Bandwidth</div>
                <div className="text-2xl font-bold text-white">{data.usageMetrics.totalBandwidth} GB</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="text-slate-400 text-sm mb-1">Storage</div>
                <div className="text-2xl font-bold text-white">{data.usageMetrics.totalStorage} GB</div>
              </div>
            </div>

            {/* Nodes Overview */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Server className="w-6 h-6 text-blue-400" />
                  Infrastructure Health
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.nodes.map((node:any) => (
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
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Memory</span>
                          <span>{node.memory}%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full ${getUtilizationColor(node.memory)} transition-all`} style={{width: `${node.memory}%`}}></div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 mt-2">
                        Uptime: {node.uptime}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customers by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Customer List */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Sites</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">MRR</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredCustomers.map((customer:any) => (
                      <tr key={customer.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{customer.name}</div>
                            <div className="text-sm text-slate-400">{customer.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300">
                            {customer.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{customer.sites}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {customer.status === 'active' ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : customer.status === 'trial' ? (
                              <Clock className="w-4 h-4 text-blue-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className={`text-sm ${getStatusColor(customer.status)}`}>
                              {customer.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">${customer.mrr}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{customer.joined}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Nodes Tab */}
        {activeTab === 'nodes' && (
          <div className="space-y-6">
            {data.nodes.map((node:any) => (
              <div key={node.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${node.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                      <h3 className="text-xl font-bold text-white">{node.name}</h3>
                    </div>
                    <p className="text-slate-400 text-sm">Hosting {node.sites} active sites</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    node.status === 'healthy' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {node.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                      <Cpu className="w-4 h-4" />
                      <span className="text-sm font-medium">CPU Usage</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">{node.cpu}%</div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full ${getUtilizationColor(node.cpu)} transition-all`} style={{width: `${node.cpu}%`}}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                      <Database className="w-4 h-4" />
                      <span className="text-sm font-medium">Memory Usage</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">{node.memory}%</div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full ${getUtilizationColor(node.memory)} transition-all`} style={{width: `${node.memory}%`}}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                      <HardDrive className="w-4 h-4" />
                      <span className="text-sm font-medium">Disk Usage</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">{node.disk}%</div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full ${getUtilizationColor(node.disk)} transition-all`} style={{width: `${node.disk}%`}}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">Uptime: <span className="text-white font-medium">{node.uptime}%</span></span>
                  </div>
                  <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">
                    View Logs
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {data.alerts.map((alert:any) => (
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
                  <button className="text-sm font-medium hover:underline">
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Customer Details</h2>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
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
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300">
                      {selectedCustomer.plan}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      {selectedCustomer.status === 'active' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-blue-500" />
                      )}
                      <span className={getStatusColor(selectedCustomer.status)}>
                        {selectedCustomer.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Active Sites</p>
                    <p className="text-white font-medium">{selectedCustomer.sites}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">MRR</p>
                    <p className="text-white font-medium">${selectedCustomer.mrr}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Joined</p>
                    <p className="text-white font-medium">{selectedCustomer.joined}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Mail className="w-4 h-4" />
                  Send Email
                </button>
                <button className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Phone className="w-4 h-4" />
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;