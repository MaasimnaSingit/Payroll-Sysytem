const express = require('express');
const PDFDocument = require('pdfkit');
const archiver = require('archiver');
const { requireRole } = require('../middleware/auth');
const dbOf = (req)=>req.app.get('db');

function currency(n){ return `₱ ${Number(n||0).toFixed(2)}`; }
function hours(n){ return (Number(n||0)).toFixed(2); }

module.exports = (() => {
  const router = express.Router();

  router.get('/zip', requireRole('ADMIN_HR'), async (req,res)=>{
    const db = dbOf(req);
    const { from, to } = req.query||{};
    if(!from||!to) return res.status(400).json({error:'from & to required (YYYY-MM-DD)'});

    const settings = Object.fromEntries(
      db.prepare(`SELECT key,value FROM settings WHERE key IN ('company_name','company_address','company_contact')`).all()
        .map(r=>[r.key,r.value])
    );

    const rows = db.prepare(`
      SELECT a.employee_id, a.work_date, a.time_in, a.time_out, a.break_minutes,
             a.regular_hours, a.overtime_hours, a.hours_worked, a.daily_pay,
             e.employee_code, e.name, e.department, e.employment_type, e.base_rate
      FROM attendance a
      JOIN employees e ON e.id=a.employee_id
      WHERE a.work_date BETWEEN ? AND ?
      ORDER BY e.employee_code ASC, a.work_date ASC
    `).all(from,to);

    const byEmp = new Map();
    for (const r of rows) {
      let g = byEmp.get(r.employee_id);
      if(!g){
        g = { meta: {
          employee_id:r.employee_id, code:r.employee_code, name:r.name, dept:r.department,
          type:r.employment_type, rate:Number(r.base_rate||0)
        }, lines:[], totals:{reg:0,ot:0,total:0,gross:0} };
        byEmp.set(r.employee_id, g);
      }
      g.lines.push({
        date:r.work_date, in:r.time_in, out:r.time_out, br:r.break_minutes||0,
        reg:Number(r.regular_hours||0), ot:Number(r.overtime_hours||0),
        total:Number(r.hours_worked||0), pay:Number(r.daily_pay||0)
      });
      g.totals.reg+=Number(r.regular_hours||0);
      g.totals.ot+=Number(r.overtime_hours||0);
      g.totals.total+=Number(r.hours_worked||0);
      g.totals.gross+=Number(r.daily_pay||0);
    }

    res.setHeader('Content-Type','application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="payslips_${from}_to_${to}.zip"`);

    const archive = archiver('zip', { zlib:{ level:9 }});
    archive.on('error', err=>{ try{ res.status(500).end(String(err)); }catch{} });
    archive.pipe(res);

    for (const [empId, g] of byEmp.entries()){
      const doc = new PDFDocument({ size:'A4', margin:40 });
      const chunks=[];
      doc.on('data', d=>chunks.push(d));
      await new Promise((resolve)=>{
        doc.fontSize(16).text(settings.company_name || 'Your Company, Inc.');
        doc.fontSize(9).fillColor('#555').text(settings.company_address || '', { lineGap:2 });
        doc.fontSize(9).fillColor('#555').text(settings.company_contact || '');
        doc.moveDown(0.8).fillColor('#000');

        doc.fontSize(12).text(`Payslip: ${from} → ${to}`);
        doc.moveDown(0.5);
        doc.fontSize(11).text(`${g.meta.code} — ${g.meta.name}`);
        doc.fontSize(9).fillColor('#555').text(`${g.meta.dept || ''} • ${g.meta.type} • Base ${currency(g.meta.rate)}`);
        doc.moveDown(0.6).fillColor('#000');

        const startX = 40, startY = 180;
        doc.fontSize(9).text('Date', startX, startY);
        doc.text('In', startX+90, startY);
        doc.text('Out', startX+120, startY);
        doc.text('Break', startX+160, startY, { width:40, align:'right' });
        doc.text('Reg', startX+210, startY, { width:40, align:'right' });
        doc.text('OT', startX+260, startY, { width:40, align:'right' });
        doc.text('Total', startX+310, startY, { width:40, align:'right' });
        doc.text('Pay', startX+370, startY, { width:80, align:'right' });
        doc.moveTo(startX, startY+12).lineTo(515, startY+12).stroke();

        let y = startY + 20;
        for (const l of g.lines){
          if (y > 720) { doc.addPage(); y = 60; }
          doc.fontSize(9);
          doc.text(l.date, startX, y);
          doc.text(l.in||'—', startX+90, y);
          doc.text(l.out||'—', startX+120, y);
          doc.text(l.br, startX+160, y, { width:40, align:'right' });
          doc.text(hours(l.reg), startX+210, y, { width:40, align:'right' });
          doc.text(hours(l.ot), startX+260, y, { width:40, align:'right' });
          doc.text(hours(l.total), startX+310, y, { width:40, align:'right' });
          doc.text(currency(l.pay), startX+370, y, { width:80, align:'right' });
          y += 16;
        }

        doc.moveDown(0.5);
        doc.moveTo(startX, y+4).lineTo(515, y+4).stroke();
        doc.fontSize(10).text('Totals', startX, y+10);
        doc.fontSize(10).text(hours(g.totals.reg), startX+210, y+10, { width:40, align:'right' });
        doc.fontSize(10).text(hours(g.totals.ot), startX+260, y+10, { width:40, align:'right' });
        doc.fontSize(10).text(hours(g.totals.total), startX+310, y+10, { width:40, align:'right' });
        doc.fontSize(10).text(currency(g.totals.gross), startX+370, y+10, { width:80, align:'right' });

        doc.end(); doc.on('end', resolve);
      });
      const buf = Buffer.concat(chunks);
      const safeName = `${g.meta.code || ('EMP'+empId)}`.replace(/[^\w\-]+/g,'_');
      archive.append(buf, { name: `${safeName}_${from}_to_${to}.pdf` });
    }
    archive.finalize();
  });

  return router;
})();


