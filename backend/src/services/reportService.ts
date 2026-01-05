import { attendanceService } from './attendanceService';
import { classService } from './classService';
import { studentService } from './studentService';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import { format } from 'date-fns';

export const reportService = {
  async generateAttendanceCSV(filters: {
    classId?: string;
    studentId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const records = await attendanceService.getAttendanceRecords(filters);
    
    const fields = [
      { label: 'Date', value: (row: any) => format(new Date(row.date), 'yyyy-MM-dd') },
      { label: 'Student Name', value: (row: any) => `${row.student.firstName} ${row.student.lastName}` },
      { label: 'Student Email', value: 'student.email' },
      { label: 'Status', value: 'status' },
      { label: 'Check In', value: (row: any) => row.checkInTime ? format(new Date(row.checkInTime), 'HH:mm:ss') : '-' },
      { label: 'Check Out', value: (row: any) => row.checkOutTime ? format(new Date(row.checkOutTime), 'HH:mm:ss') : '-' },
      { label: 'Notes', value: 'notes' }
    ];

    const json2csvParser = new Parser({ fields });
    return json2csvParser.parse(records);
  },

  async generateAttendancePDF(filters: {
    classId?: string;
    studentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Buffer> {
    const records = await attendanceService.getAttendanceRecords(filters);
    const summary = await attendanceService.getAttendanceSummary(filters);
    
    let title = 'Attendance Report';
    if (filters.classId) {
      const cls = await classService.findById(filters.classId);
      if (cls) title += ` - ${cls.name} (${cls.section})`;
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text(title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Period: ${filters.startDate || 'Beginning'} to ${filters.endDate || 'Today'}`, { align: 'center' });
      doc.moveDown();

      // Summary Section
      doc.fontSize(16).text('Summary');
      doc.fontSize(12).text(`Attendance Rate: ${summary.attendanceRate}%`);
      doc.text(`Total Days: ${summary.totalDays}`);
      doc.text(`Present: ${summary.present}`);
      doc.text(`Absent: ${summary.absent}`);
      doc.text(`Late: ${summary.late}`);
      doc.text(`Excused: ${summary.excused}`);
      doc.moveDown();

      // Table Header
      const tableTop = 300;
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Date', 50, tableTop);
      doc.text('Student', 150, tableTop);
      doc.text('Status', 350, tableTop);
      doc.text('Check In', 450, tableTop);

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
      doc.font('Helvetica').fontSize(10);

      let currentY = tableTop + 25;
      records.forEach((record: any) => {
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }
        
        doc.text(format(new Date(record.date), 'yyyy-MM-dd'), 50, currentY);
        doc.text(`${record.student.firstName} ${record.student.lastName}`, 150, currentY);
        doc.text(record.status, 350, currentY);
        doc.text(record.checkInTime ? format(new Date(record.checkInTime), 'HH:mm') : '-', 450, currentY);
        
        currentY += 20;
      });

      doc.end();
    });
  }
};
