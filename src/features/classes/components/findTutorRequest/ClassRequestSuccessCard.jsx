import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

// Màn hình xác nhận sau khi đăng lớp thành công (chỉ hiện ở luồng đăng mới).
const ClassRequestSuccessCard = ({ classCode, onCreateNew }) => (
  <div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-lg shadow-emerald-100/50">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
      <CheckCircle2 className="h-7 w-7" />
    </div>
    <h1 className="text-2xl font-bold text-slate-900">Đăng lớp thành công</h1>
    <p className="mt-2 text-slate-600">
      Mã lớp của bạn: <span className="font-semibold">{classCode}</span>
    </p>
    <p className="mt-3 text-sm text-slate-500">
      Bạn có thể tạo thêm yêu cầu khác bất cứ lúc nào — mỗi lớp là một tin đăng riêng.
    </p>
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
      <Button className="h-11 rounded-xl bg-emerald-600 px-6 text-white hover:bg-emerald-700" asChild>
        <Link to="/classes">Xem danh sách lớp cần gia sư</Link>
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-11 rounded-xl border-emerald-200 px-6 text-emerald-800 hover:bg-emerald-50"
        onClick={onCreateNew}
      >
        Tạo yêu cầu mới
      </Button>
    </div>
  </div>
);

export default ClassRequestSuccessCard;
