import { ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { pctBadgeClasses } from "@/lib/utils";
import { CURRENT_STUDENT, ATTENDANCE_RECORDS, SUBJECT_LIST } from "@/data/mock";

interface Row {
  subject: string;
  total: number;
  present: number;
  absent: number;
  pct: number;
}

export default function MyAttendancePage() {
  const myRecords = ATTENDANCE_RECORDS.filter((r) => r.studentId === CURRENT_STUDENT.id);

  const rows: Row[] = SUBJECT_LIST.map((subject) => {
    const records = myRecords.filter((r) => r.subject === subject);
    const present = records.filter((r) => r.status === "present" || r.status === "late").length;
    const absent = records.filter((r) => r.status === "absent").length;
    return {
      subject,
      total: records.length,
      present,
      absent,
      pct: records.length ? Math.round((present / records.length) * 100) : 0,
    };
  }).filter((r) => r.total > 0);

  const columns: Column<Row>[] = [
    { header: "Subject", accessor: (r) => <span className="font-medium text-ink">{r.subject}</span> },
    { header: "Total Classes", accessor: (r) => r.total },
    { header: "Present", accessor: (r) => <span className="text-teal-700 font-medium">{r.present}</span> },
    { header: "Absent", accessor: (r) => <span className="text-clay-600 font-medium">{r.absent}</span> },
    {
      header: "Percentage",
      accessor: (r) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pctBadgeClasses(r.pct)}`}>{r.pct}%</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="My Attendance" description="Your attendance broken down by subject." />
      <DataTable
        columns={columns}
        rows={rows}
        keyField={(r) => r.subject}
        emptyState={
          <EmptyState icon={ClipboardCheck} title="No attendance yet" description="Your attendance records will show up here." />
        }
      />
    </div>
  );
}
