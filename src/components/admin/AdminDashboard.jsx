import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminShell from '../layout/AdminShell.jsx';
import EmployeesPage from './EmployeesPage.jsx';
import AttendancePage from './AttendancePage.jsx';
import PayrollPage from './PayrollPage.jsx';

export default function AdminDashboard() {
  return (
    <Routes>
      <Route element={<AdminShell />}>
        <Route index element={<Navigate to="employees" replace />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="payroll" element={<PayrollPage />} />
      </Route>
    </Routes>
  );
}