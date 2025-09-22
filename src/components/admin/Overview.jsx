import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function useKpi() {
  const [k, setK] = useState({ loading: true, data: null });
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch('http://localhost:8080/api/ph/employees');
        const j = await r.json();
        if (!alive) return;
        // Transform employee data to KPI format
        const employees = Array.isArray(j) ? j : (j.employees || []);
        const activeEmployees = employees.filter(emp => emp.status === 'Active').length;
        const presentToday = employees.length; // Simplified for now
        setK({ 
          loading: false, 
          data: { 
            activeEmployees,
            presentToday,
            pendingRequests: 0,
            otHoursThisPeriod: 0
          } 
        });
      } catch {
        setK({ loading: false, data: {} });
      }
    })();
    return () => { alive = false; };
  }, []);
  return k;
}

const pick = (obj, keys, d=0) => {
  const key = keys.find(k => obj && obj[k] != null);
  return key != null ? obj[key] : d;
};

export default function Overview(){
  const { loading, data } = useKpi();

  const activeEmployees   = pick(data, ['activeEmployees','active_employees']) || 0;
  const presentToday      = pick(data, ['presentToday','present_today']) || 0;
  const pendingRequests   = pick(data, ['pendingRequests','pending_requests']) || 0;
  const otHoursThisPeriod = pick(data, ['otHoursThisPeriod','ot_hours_period']) || 0;
  const grossThisPeriod   = pick(data, ['grossThisPeriod','gross_period']);

  // Clean production data
  const kpiData = [
    {
      label: 'Active Employees',
      value: loading ? '—' : activeEmployees,
      delta: activeEmployees > 0 ? 'Ready' : 'Add your first employee',
      icon: '👥',
      trend: activeEmployees > 0 ? 'up' : 'neutral'
    },
    {
      label: 'Present Today',
      value: loading ? '—' : presentToday,
      delta: presentToday > 0 ? 'Today' : 'No attendance yet',
      icon: '✅',
      trend: 'down'
    },
    {
      label: 'Pending Requests',
      value: loading ? '—' : pendingRequests,
      delta: pendingRequests > 0 ? 'Needs attention' : 'All caught up',
      icon: '⏳',
      trend: pendingRequests > 0 ? 'up' : 'neutral'
    },
    {
      label: 'OT Hours (Period)',
      value: loading ? '—' : `${Number(otHoursThisPeriod).toFixed(1)}h`,
      delta: otHoursThisPeriod > 0 ? 'This period' : 'No overtime yet',
      icon: '⏰',
      trend: otHoursThisPeriod > 0 ? 'up' : 'neutral'
    }
  ];

  return (
    <div className="content-area">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 fade-in-up">
        <div>
          <div className="text-sm text-tertiary font-semibold uppercase tracking-wider mb-2">Dashboard</div>
          <h1 className="text-3xl font-bold text-primary mb-2" style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Dashboard Overview
          </h1>
          <div className="text-tertiary">
            {activeEmployees === 0 ? 
              "Welcome! Get started by adding your first employee to begin tracking attendance and payroll." : 
              "Welcome back! Here's your payroll and attendance summary."
            }
          </div>
        </div>
        {typeof (data && (data.paid ?? undefined)) === 'boolean' && (
          <span className={`badge ${data.paid ? 'badge-success' : 'badge-warning'}`}>
            {data.paid ? 'Paid' : 'Unpaid'}
          </span>
        )}
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        {kpiData.map((kpi, index) => (
          <div key={index} className="kpi-card fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
            <div className="kpi-header">
              <div className="kpi-title">{kpi.label}</div>
              <div className="kpi-icon">{kpi.icon}</div>
            </div>
            <div className="kpi-value">{kpi.value}</div>
            <div className={`kpi-delta ${kpi.trend === 'down' ? 'negative' : kpi.trend === 'neutral' ? 'neutral' : ''}`}>
              {kpi.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Get Started Section - Show when no employees */}
      {activeEmployees === 0 && (
        <div className="premium-card fade-in-up mb-8">
          <div className="card-header">
            <div>
              <h3 className="card-title">🚀 Get Started</h3>
              <p className="card-subtitle">Set up your payroll system in just a few steps</p>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-surface-2 border border-line">
                <div className="text-2xl mb-2">👥</div>
                <h4 className="font-semibold mb-2">1. Add Employees</h4>
                <p className="text-sm text-tertiary mb-3">Start by adding your team members with their basic information and employment details.</p>
                <a href="/admin/employees" className="btn btn-primary btn-sm">Add Employee</a>
              </div>
              <div className="text-center p-4 rounded-lg bg-surface-2 border border-line">
                <div className="text-2xl mb-2">⏰</div>
                <h4 className="font-semibold mb-2">2. Track Attendance</h4>
                <p className="text-sm text-tertiary mb-3">Set up attendance tracking for clock in/out and monitor work hours.</p>
                <a href="/admin/attendance" className="btn btn-secondary btn-sm">Setup Attendance</a>
              </div>
              <div className="text-center p-4 rounded-lg bg-surface-2 border border-line">
                <div className="text-2xl mb-2">💰</div>
                <h4 className="font-semibold mb-2">3. Run Payroll</h4>
                <p className="text-sm text-tertiary mb-3">Calculate and process payroll with Philippines-compliant deductions.</p>
                <a href="/admin/payroll" className="btn btn-secondary btn-sm">Run Payroll</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="premium-card fade-in-up">
          <div className="card-header">
            <div>
              <h3 className="card-title">Payroll Trend (Last 6 Months)</h3>
              <p className="card-subtitle">Monthly payroll distribution</p>
            </div>
            <div className="card-icon">📊</div>
          </div>
          <div className="chart">
            {Array.isArray(data?.trend) && data.trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trend}>
                  <XAxis dataKey="label" tickLine={false} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="gross" stroke="#6366f1" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <div className="empty-state-title">No Data Available</div>
                <div className="empty-state-description">Payroll data will appear here once available</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="premium-card fade-in-up">
          <div className="card-header">
            <div>
              <h3 className="card-title">Paid vs Pending This Period</h3>
              <p className="card-subtitle">Payment status distribution</p>
            </div>
            <div className="card-icon">🥧</div>
          </div>
          <div className="chart">
            {Array.isArray(data?.paidSplit) && data.paidSplit.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={data.paidSplit}
                    innerRadius={70} 
                    outerRadius={100} 
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🥧</div>
                <div className="empty-state-title">No Data Available</div>
                <div className="empty-state-description">Payment data will appear here once available</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="actions-row">
        <a className="btn btn-primary" href="/admin/attendance">
          <div>
            <div className="font-semibold">Go to Attendance</div>
            <div className="text-sm opacity-80">Track employee hours</div>
          </div>
        </a>
        <a className="btn btn-secondary" href="/admin/payroll">
          <div>
            <div className="font-semibold">Go to Payroll</div>
            <div className="text-sm opacity-80">Process payments</div>
          </div>
        </a>
        <a className="btn btn-secondary" href="/admin/requests">
          <div>
            <div className="font-semibold">Review Requests</div>
            <div className="text-sm opacity-80">Approve pending items</div>
          </div>
        </a>
      </div>
    </div>
  );
}

function BrandLogo(){
  const [logo,setLogo]=React.useState(null);
  React.useEffect(()=>{ (async()=>{ try{ const r=await fetch('/api/settings'); const j=await r.json(); setLogo(j.company_logo_path||null); }catch{} })(); },[]);
  if(!logo) return null;
  return <img src={logo} alt="logo" style={{height:22, borderRadius:6}}/>;
}

function KpiCard({ title, value }) {
  return (
    <div className="panel" style={{ padding: 16 }}>
      <div className="lbl">{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1, marginTop: 6 }}>{value}</div>
    </div>
  );
}


