'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, CreditCard, Target, Calendar, Download } from 'lucide-react';

const mrrData = [
    { month: 'Jan', mrr: 450, newMrr: 180, churnedMrr: 30 },
    { month: 'Feb', mrr: 590, newMrr: 210, churnedMrr: 70 },
    { month: 'Mar', mrr: 780, newMrr: 250, churnedMrr: 60 },
    { month: 'Apr', mrr: 920, newMrr: 200, churnedMrr: 60 },
    { month: 'May', mrr: 1100, newMrr: 240, churnedMrr: 60 },
    { month: 'Jun', mrr: 1320, newMrr: 280, churnedMrr: 60 },
  ];

  const userGrowthData = [
    { month: 'Jan', total: 28, new: 12, churned: 2 },
    { month: 'Feb', total: 38, new: 14, churned: 4 },
    { month: 'Mar', total: 48, new: 15, churned: 5 },
    { month: 'Apr', total: 56, new: 13, churned: 5 },
    { month: 'May', total: 67, new: 16, churned: 5 },
    { month: 'Jun', total: 78, new: 17, churned: 6 },
  ];

  const planDistribution = [
    { name: 'Basic', value: 28, revenue: 420 },
    { name: 'Business', value: 35, revenue: 1225 },
    { name: 'Premium', value: 15, revenue: 1125 },
  ];

  const conversionData = [
    { stage: 'Visitors', count: 2450, rate: 100 },
    { stage: 'Sign-ups', count: 245, rate: 10 },
    { stage: 'Trials', count: 196, rate: 8 },
    { stage: 'Paid', count: 88, rate: 3.6 },
  ];

  const cohortData = [
    { cohort: 'Jan 2026', month0: 100, month1: 92, month2: 87, month3: 82, month4: 79, month5: 76 },
    { cohort: 'Feb 2026', month0: 100, month1: 94, month2: 89, month3: 85, month4: 82, month5: null },
    { cohort: 'Mar 2026', month0: 100, month1: 95, month2: 91, month3: 88, month4: null, month5: null },
    { cohort: 'Apr 2026', month0: 100, month1: 96, month2: 92, month3: null, month4: null, month5: null },
    { cohort: 'May 2026', month0: 100, month1: 97, month2: null, month3: null, month4: null, month5: null },
    { cohort: 'Jun 2026', month0: 100, month1: null, month2: null, month3: null, month4: null, month5: null },
  ];

  const metrics = {
    mrr: 1320,
    mrrGrowth: 16.4,
    arr: 15840,
    ltv: 945,
    cac: 180,
    ltvCacRatio: 5.25,
    churnRate: 7.7,
    trialConversion: 44.9,
    avgRevenuePerUser: 17.95,
    grossMargin: 77,
  };

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

const MetricCard = ({ title, value, change, icon: Icon, trend, prefix = '', suffix = '' }) => (
    <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted-foreground text-sm font-medium">{title}</span>
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </span>
        {change && (
          <span className={`text-sm font-medium flex items-center gap-1 ${
            trend === 'up' ? 'text-success-foreground' : 'text-destructive'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {change}%
          </span>
        )}
      </div>
    </div>
  );

export function ResourceMetrics() {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Business intelligence and growth metrics</p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-ring"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Monthly Recurring Revenue"
            value={metrics.mrr}
            change={metrics.mrrGrowth}
            trend="up"
            icon={DollarSign}
            prefix="$"
          />
          <MetricCard
            title="Annual Run Rate"
            value={metrics.arr}
            change={8.5}
            trend="up"
            icon={Target}
            prefix="$"
          />
          <MetricCard
            title="Churn Rate"
            value={metrics.churnRate}
            change={0.5}
            trend="down"
            icon={TrendingDown}
            suffix="%"
          />
          <MetricCard
            title="LTV:CAC Ratio"
            value={metrics.ltvCacRatio}
            icon={TrendingUp}
            prefix=""
            suffix=":1"
          />
        </div>

        {/* MRR Growth Chart */}
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">MRR Growth</h2>
              <p className="text-sm text-muted-foreground">Monthly recurring revenue over time</p>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">Total MRR</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-muted-foreground">New MRR</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-muted-foreground">Churned MRR</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mrrData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                formatter={(value) => `$${value}`}
              />
              <Line type="monotone" dataKey="mrr" stroke="hsl(var(--chart-1))" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="newMrr" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="churnedMrr" stroke="hsl(var(--chart-5))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-6">User Growth</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="new" fill="hsl(var(--chart-2))" name="New Users" radius={[8, 8, 0, 0]} />
                <Bar dataKey="churned" fill="hsl(var(--chart-5))" name="Churned" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-6">Plan Distribution</h2>
            <div className="flex items-center gap-8">
              <ResponsiveContainer width="50%" height={250}>
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-4">
                {planDistribution.map((plan, index) => (
                  <div key={plan.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium" style={{ color: COLORS[index] }}>{plan.name}</span>
                      <span className="text-muted-foreground">{plan.value} users</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>Revenue: ${plan.revenue}</span>
                      <span>{((plan.value / planDistribution.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{ 
                          width: `${(plan.value / planDistribution.reduce((a, b) => a + b.value, 0)) * 100}%`,
                          backgroundColor: COLORS[index]
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Conversion Funnel</h2>
          <div className="space-y-4">
            {conversionData.map((stage, index) => {
              const prevCount = index > 0 ? conversionData[index - 1].count : stage.count;
              const dropOff = ((prevCount - stage.count) / prevCount * 100).toFixed(1);
              
              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{stage.stage}</h3>
                        <p className="text-sm text-muted-foreground">{stage.count.toLocaleString()} users • {stage.rate}% of total</p>
                      </div>
                    </div>
                    {index > 0 && (
                      <span className="text-sm text-destructive font-medium">-{dropOff}% drop-off</span>
                    )}
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                      style={{ width: `${stage.rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Cohort Retention Analysis</h2>
          <p className="text-sm text-muted-foreground mb-4">Percentage of customers retained by signup month</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Cohort</th>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <th key={i} className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">M{i}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohortData.map((cohort) => (
                  <tr key={cohort.cohort} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium text-foreground">{cohort.cohort}</td>
                    {['month0', 'month1', 'month2', 'month3', 'month4', 'month5'].map((month) => {
                      const value = cohort[month];
                      const opacity = value ? value / 100 : 0;
                      return (
                        <td key={month} className="px-4 py-3 text-center">
                          {value !== null ? (
                            <span
                              className="inline-block px-3 py-1 rounded font-medium text-sm"
                              style={{
                                backgroundColor: `rgba(59, 130, 246, ${opacity})`,
                                color: value > 50 ? '#fff' : '#1e293b'
                              }}
                            >
                              {value}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">Customer Economics</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground">Customer LTV</span><span className="font-semibold text-foreground">${metrics.ltv}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Customer CAC</span><span className="font-semibold text-foreground">${metrics.cac}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">LTV:CAC Ratio</span><span className="font-semibold text-success-foreground">{metrics.ltvCacRatio}:1</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Payback Period</span><span className="font-semibold text-foreground">2.1 months</span></div>
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">Conversion Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground">Trial Conversion</span><span className="font-semibold text-foreground">{metrics.trialConversion}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Basic → Business</span><span className="font-semibold text-foreground">18.5%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Business → Premium</span><span className="font-semibold text-foreground">12.3%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Avg. Time to Upgrade</span><span className="font-semibold text-foreground">3.2 months</span></div>
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">Revenue Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground">ARPU</span><span className="font-semibold text-foreground">${metrics.avgRevenuePerUser}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Gross Margin</span><span className="font-semibold text-success-foreground">{metrics.grossMargin}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Net Revenue Retention</span><span className="font-semibold text-foreground">112%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Quick Ratio</span><span className="font-semibold text-success-foreground">4.2x</span></div>
            </div>
          </div>
        </div>
    </div>
  );
};
