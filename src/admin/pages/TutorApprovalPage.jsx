import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, RefreshCw, Loader2, CheckCircle2 } from "lucide-react";

import { getPendingTutorsThunk } from "@/admin/store/adminThunks";
import TutorApprovalCard from "@/admin/components/TutorApprovalCard";
import { Button } from "@/components/ui/button";

const TutorApprovalPage = () => {
  const dispatch = useDispatch();
  const { pendingTutors, loading, actionLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getPendingTutorsThunk());
  }, [dispatch]);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Xét duyệt gia sư</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Danh sách hồ sơ đang chờ xét duyệt ({pendingTutors.length})
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch(getPendingTutorsThunk())}
          disabled={loading}
          className="gap-1.5"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Làm mới
        </Button>
      </div>

      {/* Content */}
      {loading && pendingTutors.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f] mx-auto mb-3" />
            <p className="text-sm text-slate-500">Đang tải danh sách...</p>
          </div>
        </div>
      ) : pendingTutors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">
            Không có hồ sơ chờ duyệt
          </h3>
          <p className="text-sm text-slate-500">
            Tất cả hồ sơ gia sư đã được xử lý.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {pendingTutors.map((tutor) => (
            <TutorApprovalCard
              key={tutor.id}
              tutor={tutor}
              isActioning={actionLoading === tutor.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorApprovalPage;
