import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  ExternalLink,
  GitBranch,
  Info,
  ShieldCheck,
} from "lucide-react";

import DirectSupportCard from "../components/DirectSupportCard";
import { CONTRACT_ROUTE } from "../constants";
import { RECEIVING_FLOWS, RECEIVING_REQUIREMENTS } from "../constants/classReceivingGuide";

const controlClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2";

function FlowGuide({ flow }) {
  const [stepIndex, setStepIndex] = useState(null);
  const step = stepIndex === null ? null : flow.steps[stepIndex];
  const diagramUrl = `/diagrams/class-${flow.id}.html?theme=light`;
  const diagramSrc = `${diagramUrl}&embed=1${step ? `#focus=${step.id}` : ""}`;

  return (
    <div id="receiving-flow" className="min-w-0">
      <div className="flex flex-col justify-between gap-4 p-5 sm:p-7 lg:flex-row lg:items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{flow.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{flow.intro}</p>
        </div>
        <a
          href={diagramUrl}
          target="_blank"
          rel="noreferrer"
          className={`${controlClass} shrink-0 border border-slate-200 text-slate-700 hover:bg-slate-50`}
        >
          Mở sơ đồ lớn <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <div className="hidden border-y border-slate-100 bg-slate-50 md:block">
        <iframe
          title={`Sơ đồ ${flow.label.toLowerCase()}`}
          src={diagramSrc}
          loading="lazy"
          className="h-[520px] w-full border-0 lg:h-[580px]"
        />
      </div>
      <p className="px-5 pt-4 text-sm leading-6 text-slate-500 md:hidden">
        Chọn từng bước bên dưới để đọc hướng dẫn. Bạn cũng có thể mở sơ đồ lớn để xem các nhánh xử lý.
      </p>

      <div className="p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-900">
            {flow.id === "cancel" ? "Hướng dẫn theo trạng thái đơn" : "Hướng dẫn từng bước"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {stepIndex !== null && (
              <button
                type="button"
                onClick={() => setStepIndex(null)}
                className={`${controlClass} text-slate-600 hover:bg-slate-100`}
              >
                Xem toàn bộ
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                setStepIndex(stepIndex === null || stepIndex === flow.steps.length - 1 ? 0 : stepIndex + 1)
              }
              className={`${controlClass} bg-emerald-600 text-white hover:bg-emerald-700`}
            >
              {stepIndex === null
                ? "Xem từng bước"
                : stepIndex === flow.steps.length - 1
                  ? "Xem lại từ đầu"
                  : "Bước tiếp theo"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {flow.steps.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={stepIndex === index}
                onClick={() => setStepIndex(index)}
                className={`flex h-full w-full items-start gap-3 rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${stepIndex === index ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40"}`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${stepIndex === index ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block text-xs font-medium text-emerald-700">{item.actor}</span>
                  <span className="mt-1 block text-sm font-semibold leading-5 text-slate-800">
                    {item.title}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
        <div className="mt-5 rounded-xl bg-slate-50 p-5" aria-live="polite" aria-atomic="true">
          {step ? (
            <>
              <h4 className="font-semibold text-slate-900">{step.title}</h4>
              <p className="mt-2 text-sm leading-7 text-slate-600">{step.description}</p>
            </>
          ) : (
            <p className="text-sm leading-7 text-slate-600">
              Chọn một bước để xem chi tiết và làm nổi bật vị trí tương ứng trên sơ đồ. Các đường nét đứt thể
              hiện trường hợp ngoài luồng nhận lớp thành công.
            </p>
          )}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {flow.exceptions.map((item) => (
            <div key={item.title} className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
              <h4 className="text-sm font-semibold text-amber-900">{item.title}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ClassReceivingGuidePage() {
  const [flowId, setFlowId] = useState("apply");
  const flow = RECEIVING_FLOWS.find((item) => item.id === flowId);

  return (
    <div className="mx-auto max-w-6xl pb-6">
      <nav
        aria-label="Điều hướng trang"
        className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-500"
      >
        <Link to="/classes" className="inline-flex items-center gap-2 hover:text-emerald-700">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Lớp cần gia sư
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <span aria-current="page">Quy trình nhận lớp</span>
      </nav>
      <header className="mb-9 max-w-3xl">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
          <GitBranch className="h-4 w-4" aria-hidden="true" />
          Gia sư cần biết
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Quy trình nhận lớp
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Hiểu rõ từng bước, chủ động trong mỗi lớp học. Tìm hiểu cách ứng tuyển, phản hồi lời mời và theo dõi
          lớp từ lúc được chọn đến khi hoàn thành.
        </p>
      </header>

      <section aria-labelledby="receiving-requirements" className="mb-8">
        <h2
          id="receiving-requirements"
          className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900"
        >
          <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          Trước khi nhận lớp
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {RECEIVING_REQUIREMENTS.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <Check className="mb-3 h-5 w-5 text-emerald-600" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
        <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p>
          <strong>Được chọn chưa phải đã nhận lớp.</strong> Bạn cần chờ trung tâm duyệt trước khi được mở
          thông tin liên hệ chi tiết.
        </p>
      </div>
      <section
        aria-label="Các quy trình nhận lớp"
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div
          role="group"
          aria-label="Chọn quy trình"
          className="flex flex-wrap gap-2 border-b border-slate-100 p-3 sm:p-4"
        >
          {RECEIVING_FLOWS.map((item) => (
            <button
              type="button"
              key={item.id}
              aria-pressed={flowId === item.id}
              aria-controls="receiving-flow"
              onClick={() => setFlowId(item.id)}
              className={`${controlClass} flex-1 sm:flex-none ${flowId === item.id ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <FlowGuide key={flow.id} flow={flow} />
      </section>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <section
          className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"
          aria-labelledby="receiving-questions"
        >
          <h2 id="receiving-questions" className="text-lg font-bold text-slate-900">
            Những điều thường gặp
          </h2>
          {[
            [
              "Tôi theo dõi đơn và lời mời ở đâu?",
              "Xem các đơn ứng tuyển ở Lớp đã nhận, lời mời trực tiếp ở Lời mời dạy lớp. Kiểm tra chuông thông báo để biết kết quả được chọn, duyệt hoặc từ chối.",
            ],
            [
              "Vì sao lớp không còn nhận gia sư?",
              "Lớp có thể đã được giữ cho một đơn đang xét duyệt, đã ghép gia sư hoặc hết hạn. Lớp chưa có gia sư khi quá thời điểm bắt đầu sẽ được hệ thống đánh dấu hết hạn.",
            ],
            [
              "Có cần thanh toán ngay khi ứng tuyển không?",
              "Gửi ứng tuyển chưa xác nhận bạn đã nhận lớp. Hãy đọc thông tin phí và hợp đồng mẫu, đồng thời xác nhận hướng dẫn với trung tâm trước khi thanh toán.",
            ],
            [
              "Tôi đã xác nhận nhưng lớp chưa hoàn thành?",
              "Hệ thống cần cả gia sư và người đăng xác nhận. Hãy trao đổi với bên còn lại hoặc liên hệ trung tâm nếu cần hỗ trợ.",
            ],
          ].map(([question, answer]) => (
            <details key={question} className="border-b border-slate-100 py-4 last:border-0">
              <summary className="cursor-pointer text-sm font-semibold leading-6 text-slate-800 focus-visible:outline-emerald-600">
                {question}
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-600">{answer}</p>
            </details>
          ))}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/classes" className={`${controlClass} bg-emerald-600 text-white hover:bg-emerald-700`}>
              Tìm lớp phù hợp
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to={CONTRACT_ROUTE}
              className={`${controlClass} border border-slate-200 text-slate-700 hover:bg-slate-50`}
            >
              Đọc hợp đồng mẫu
            </Link>
          </div>
        </section>
        <DirectSupportCard />
      </div>
    </div>
  );
}
