import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import ContractTemplate from "../components/ContractTemplate";
import { copyContract, printContract } from "../utils/contractActions";

// Trang hợp đồng mẫu độc lập — đích của lối tắt ở chân trang.
// Trang xem và in hợp đồng gia sư mẫu.
const ContractTemplatePage = () => {
  const contentRef = useRef(null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/classes"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Về danh sách lớp cần gia sư
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Hợp đồng mẫu giao (nhận) lớp</h1>
          <p className="mt-1 text-sm text-slate-500">
            Bạn có thể sao chép hoặc in hợp đồng ra để điền thông tin và ký tên.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => copyContract(contentRef.current)}
            className="h-10 gap-1.5 rounded-lg border-slate-300 px-3.5 text-slate-700"
          >
            <Copy className="h-4 w-4" />
            Sao chép
          </Button>
          <Button
            type="button"
            onClick={() => printContract(contentRef.current)}
            className="h-10 gap-1.5 rounded-lg bg-emerald-600 px-3.5 font-semibold text-white hover:bg-emerald-700"
          >
            <Printer className="h-4 w-4" />
            In hợp đồng
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <ContractTemplate innerRef={contentRef} />
      </div>
    </div>
  );
};

export default ContractTemplatePage;
