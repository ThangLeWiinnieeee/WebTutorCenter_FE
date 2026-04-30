import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Users } from "lucide-react";

const AdminDashboardPage = () => {
  const { pendingTutors } = useSelector((state) => state.admin);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Tổng quan</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/admin/tutors"
          className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-[#1e3a5f]/30 transition-all"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
            <Users className="h-6 w-6 text-amber-700" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{pendingTutors.length}</p>
            <p className="text-sm text-slate-500">Hồ sơ chờ duyệt</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
