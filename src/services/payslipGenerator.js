// Payslip Generator Service

import { formatCurrency, formatDate } from './payrollApi';

// Company details
const COMPANY = {
    name: 'TGPS PAYROLL SYSTEM',
    address: 'Philippines',
    logo: '/logo.png'
};

// Generate payslip HTML
export function generatePayslipHtml(payroll, employee) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Payslip - ${employee.first_name} ${employee.last_name}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                }
                .payslip {
                    max-width: 800px;
                    margin: 0 auto;
                    border: 1px solid #ddd;
                    padding: 20px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #333;
                    padding-bottom: 20px;
                }
                .company-name {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .company-address {
                    font-size: 14px;
                    color: #666;
                }
                .payslip-title {
                    font-size: 18px;
                    font-weight: bold;
                    text-align: center;
                    margin: 20px 0;
                }
                .employee-info {
                    margin-bottom: 20px;
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }
                .info-label {
                    font-weight: bold;
                    color: #666;
                }
                .payroll-details {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    margin-bottom: 20px;
                }
                .section {
                    border: 1px solid #eee;
                    padding: 15px;
                    border-radius: 5px;
                }
                .section-title {
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #333;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 5px;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                    font-size: 14px;
                }
                .total-row {
                    border-top: 1px solid #ddd;
                    margin-top: 10px;
                    padding-top: 10px;
                    font-weight: bold;
                }
                .net-pay {
                    text-align: center;
                    font-size: 24px;
                    font-weight: bold;
                    margin: 20px 0;
                    padding: 20px;
                    background: #f9f9f9;
                    border-radius: 5px;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                }
                .signatures {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 40px;
                    margin-top: 60px;
                }
                .signature {
                    text-align: center;
                }
                .signature-line {
                    border-top: 1px solid #333;
                    margin-top: 40px;
                    padding-top: 5px;
                }
                @media print {
                    body {
                        padding: 0;
                    }
                    .payslip {
                        border: none;
                    }
                    .no-print {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="payslip">
                <!-- Header -->
                <div class="header">
                    <div class="company-name">${COMPANY.name}</div>
                    <div class="company-address">${COMPANY.address}</div>
                </div>

                <div class="payslip-title">PAYSLIP</div>

                <!-- Employee Information -->
                <div class="employee-info">
                    <div>
                        <div class="info-row">
                            <span class="info-label">Employee:</span>
                            <span>${employee.first_name} ${employee.last_name}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Employee ID:</span>
                            <span>${employee.employee_code}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Position:</span>
                            <span>${employee.position}</span>
                        </div>
                    </div>
                    <div>
                        <div class="info-row">
                            <span class="info-label">Pay Period:</span>
                            <span>${formatDate(payroll.period_start)} - ${formatDate(payroll.period_end)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Pay Date:</span>
                            <span>${formatDate(new Date())}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Days Worked:</span>
                            <span>${payroll.days_worked}</span>
                        </div>
                    </div>
                </div>

                <!-- Payroll Details -->
                <div class="payroll-details">
                    <!-- Earnings -->
                    <div class="section">
                        <div class="section-title">Earnings</div>
                        <div class="detail-row">
                            <span>Basic Pay</span>
                            <span>${formatCurrency(payroll.regular_pay)}</span>
                        </div>
                        <div class="detail-row">
                            <span>Overtime Pay</span>
                            <span>${formatCurrency(payroll.overtime_pay)}</span>
                        </div>
                        <div class="detail-row">
                            <span>Night Differential</span>
                            <span>${formatCurrency(payroll.night_diff_pay)}</span>
                        </div>
                        <div class="detail-row">
                            <span>Holiday Pay</span>
                            <span>${formatCurrency(payroll.holiday_pay)}</span>
                        </div>
                        <div class="total-row">
                            <span>Gross Pay</span>
                            <span>${formatCurrency(payroll.gross_pay)}</span>
                        </div>
                    </div>

                    <!-- Deductions -->
                    <div class="section">
                        <div class="section-title">Deductions</div>
                        <div class="detail-row">
                            <span>SSS Contribution</span>
                            <span>${formatCurrency(payroll.sss_ee)}</span>
                        </div>
                        <div class="detail-row">
                            <span>PhilHealth</span>
                            <span>${formatCurrency(payroll.philhealth_ee)}</span>
                        </div>
                        <div class="detail-row">
                            <span>Pag-IBIG</span>
                            <span>${formatCurrency(payroll.pagibig_ee)}</span>
                        </div>
                        <div class="detail-row">
                            <span>Withholding Tax</span>
                            <span>${formatCurrency(payroll.withholding_tax)}</span>
                        </div>
                        <div class="total-row">
                            <span>Total Deductions</span>
                            <span>${formatCurrency(payroll.total_deductions)}</span>
                        </div>
                    </div>
                </div>

                <!-- Net Pay -->
                <div class="net-pay">
                    <div>Net Pay</div>
                    <div>${formatCurrency(payroll.net_pay)}</div>
                </div>

                <!-- Government Numbers -->
                <div class="section">
                    <div class="section-title">Government Numbers</div>
                    <div class="employee-info">
                        <div>
                            <div class="info-row">
                                <span class="info-label">SSS:</span>
                                <span>${employee.sss_no}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">PhilHealth:</span>
                                <span>${employee.philhealth_no}</span>
                            </div>
                        </div>
                        <div>
                            <div class="info-row">
                                <span class="info-label">Pag-IBIG:</span>
                                <span>${employee.pagibig_no}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">TIN:</span>
                                <span>${employee.tin_no}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Signatures -->
                <div class="signatures">
                    <div class="signature">
                        <div class="signature-line">Employee Signature</div>
                    </div>
                    <div class="signature">
                        <div class="signature-line">Authorized Signature</div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="footer">
                    This is a computer-generated document. No signature is required.
                </div>
            </div>

            <!-- Print Button -->
            <div class="no-print" style="text-align: center; margin-top: 20px;">
                <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Print Payslip
                </button>
            </div>
        </body>
        </html>
    `;
}

// Generate PDF version (if needed)
export async function generatePayslipPdf(payroll, employee) {
    // TODO: Implement PDF generation using pdfkit or similar
    throw new Error('PDF generation not implemented yet');
}
