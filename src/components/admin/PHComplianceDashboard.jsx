// Philippines Compliance Dashboard Component
import React, { useState, useEffect } from 'react';
import { phPayroll } from '../../utils/ph_payroll';
import { phEmployeeApi } from '../../services/api';

export default function PHComplianceDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalGrossPay: 0,
    totalDeductions: 0,
    totalNetPay: 0,
    sssContributions: 0,
    philhealthContributions: 0,
    pagibigContributions: 0,
    birTax: 0
  });
  
  const [recentRequests, setRecentRequests] = useState([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load employees using authenticated API
      const empData = await phEmployeeApi.getAll();
      
      if (empData.success) {
        const activeEmployees = empData.employees.filter(emp => emp.status === 'Active');
        setStats(prev => ({
          ...prev,
          totalEmployees: empData.employees.length,
          activeEmployees: activeEmployees.length
        }));
      } else {
        console.error('Failed to load employees:', empData.error);
      }
      
      // Load recent leave requests
      const leaveResponse = await fetch('/api/ph/leave/requests?status=Pending&limit=5');
      const leaveData = await leaveResponse.json();
      
      if (leaveData.success) {
        setRecentRequests(leaveData.requests);
      }
      
      // Load upcoming holidays
      const holidayResponse = await fetch('/api/ph/attendance/holidays');
      const holidayData = await holidayResponse.json();
      
      if (holidayData.success) {
        const today = new Date();
        const upcoming = holidayData.holidays.filter(holiday => 
          new Date(holiday.holiday_date) >= today
        ).slice(0, 3);
        setUpcomingHolidays(upcoming);
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePayrollForPeriod = async (startDate, endDate) => {
    try {
      const response = await fetch('/api/ph/payroll/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_date: startDate, end_date: endDate })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStats(prev => ({
          ...prev,
          totalGrossPay: data.totals.total_gross_salary,
          totalDeductions: data.totals.total_deductions,
          totalNetPay: data.totals.total_net_salary,
          sssContributions: data.totals.total_sss_employee,
          philhealthContributions: data.totals.total_philhealth,
          pagibigContributions: data.totals.total_pagibig_employee,
          birTax: data.totals.total_bir_tax
        }));
      }
    } catch (error) {
      console.error('Error calculating payroll:', error);
    }
  };

  if (loading) {
    return (
      <div className="premium-card">
        <div className="card-header">
          <h2 className="card-title">🇵🇭 Philippines Compliance Dashboard</h2>
          <p className="card-subtitle">Loading compliance data...</p>
        </div>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="ph-compliance-dashboard">
      {/* Header */}
      <div className="premium-card fade-in-up">
        <div className="card-header">
          <div>
            <h1 className="card-title">🇵🇭 Philippines Compliance Dashboard</h1>
            <p className="card-subtitle">Labor Law Compliant Payroll & Attendance System</p>
          </div>
          <div className="card-icon">📊</div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="premium-card fade-in-up">
          <div className="card-header">
            <h3 className="card-title">Total Employees</h3>
            <div className="card-icon">👥</div>
          </div>
          <div className="kpi-value">{stats.totalEmployees}</div>
          <div className="kpi-label">Active: {stats.activeEmployees}</div>
        </div>

        <div className="premium-card fade-in-up">
          <div className="card-header">
            <h3 className="card-title">Gross Pay</h3>
            <div className="card-icon">💰</div>
          </div>
          <div className="kpi-value">{phPayroll.formatCurrency(stats.totalGrossPay)}</div>
          <div className="kpi-label">Current Period</div>
        </div>

        <div className="premium-card fade-in-up">
          <div className="card-header">
            <h3 className="card-title">Total Deductions</h3>
            <div className="card-icon">📉</div>
          </div>
          <div className="kpi-value">{phPayroll.formatCurrency(stats.totalDeductions)}</div>
          <div className="kpi-label">SSS + PhilHealth + Pag-IBIG + Tax</div>
        </div>

        <div className="premium-card fade-in-up">
          <div className="card-header">
            <h3 className="card-title">Net Pay</h3>
            <div className="card-icon">💵</div>
          </div>
          <div className="kpi-value">{phPayroll.formatCurrency(stats.totalNetPay)}</div>
          <div className="kpi-label">After Deductions</div>
        </div>
      </div>

      {/* Government Contributions Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="premium-card fade-in-up">
          <div className="card-header">
            <h3 className="card-title">Government Contributions</h3>
            <div className="card-icon">🏛️</div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">SSS Employee</span>
              <span className="font-semibold">{phPayroll.formatCurrency(stats.sssContributions)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">PhilHealth</span>
              <span className="font-semibold">{phPayroll.formatCurrency(stats.philhealthContributions)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Pag-IBIG Employee</span>
              <span className="font-semibold">{phPayroll.formatCurrency(stats.pagibigContributions)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">BIR Tax Withholding</span>
              <span className="font-semibold">{phPayroll.formatCurrency(stats.birTax)}</span>
            </div>
          </div>
        </div>

        <div className="premium-card fade-in-up">
          <div className="card-header">
            <h3 className="card-title">Upcoming Holidays</h3>
            <div className="card-icon">🎉</div>
          </div>
          <div className="space-y-3">
            {upcomingHolidays.length > 0 ? (
              upcomingHolidays.map((holiday, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium">{holiday.holiday_name}</div>
                    <div className="text-sm text-gray-400">{phPayroll.formatDate(holiday.holiday_date)}</div>
                  </div>
                  <span className="px-2 py-1 bg-blue-600 text-xs rounded-full">
                    {holiday.holiday_type}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-4">
                No upcoming holidays
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Leave Requests */}
      <div className="premium-card fade-in-up">
        <div className="card-header">
          <h3 className="card-title">Recent Leave Requests</h3>
          <div className="card-icon">📋</div>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.length > 0 ? (
                recentRequests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <div>
                        <div className="font-medium">{request.full_name}</div>
                        <div className="text-sm text-gray-400">{request.employee_code}</div>
                      </div>
                    </td>
                    <td>
                      <span className="px-2 py-1 bg-blue-600 text-xs rounded-full">
                        {request.leave_name}
                      </span>
                    </td>
                    <td>{request.start_date_formatted}</td>
                    <td>{request.end_date_formatted}</td>
                    <td>{request.total_days}</td>
                    <td>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        request.status === 'Approved' ? 'bg-green-600' :
                        request.status === 'Rejected' ? 'bg-red-600' :
                        'bg-yellow-600'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm">View</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-gray-400 py-8">
                    No recent leave requests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="premium-card fade-in-up">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
          <div className="card-icon">⚡</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/admin/employees'}
          >
            Manage Employees
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.href = '/admin/attendance'}
          >
            View Attendance
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.href = '/admin/payroll'}
          >
            Calculate Payroll
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.href = '/admin/requests'}
          >
            Review Requests
          </button>
        </div>
      </div>
    </div>
  );
}
