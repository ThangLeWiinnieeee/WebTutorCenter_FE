import { CONTRACT_CENTER as C } from "../constants";

// Ô trống để điền tay khi in ra.
const Blank = ({ w = "8rem", children }) => (
  <span
    className="contract-blank inline-block border-b border-dotted border-slate-400 align-bottom"
    style={{ minWidth: w }}
  >
    {children}
  </span>
);

// Ô điền trong hợp đồng mẫu: hiện giá trị hoặc để trống có gạch chân.
const Field = ({ label, value, blankWidth = "16rem" }) => (
  <p className="contract-row my-1.5">
    <span className="font-medium">{label}:</span>{" "}
    {value ? <span className="font-semibold text-slate-900">{value}</span> : <Blank w={blankWidth} />}
  </p>
);

// Nội dung hợp đồng giao/nhận lớp; `classCode` được điền sẵn khi mở từ trang chi tiết lớp.
const ContractTemplate = ({ classCode, innerRef }) => {
  return (
    <div
      ref={innerRef}
      className="contract-document mx-auto max-w-3xl bg-white text-[13.5px] leading-relaxed text-slate-800 [font-family:'Times_New_Roman',Times,serif]"
    >
      <h1 className="text-center text-xl font-bold uppercase text-slate-900">Hợp đồng giao ( nhận ) lớp</h1>
      <p className="contract-note text-center italic text-red-700">
        Lưu ý: Vui lòng đọc kỹ các Điều khoản dưới đây
      </p>

      <p className="my-3">
        Hôm nay, ngày <Blank w="3.5rem" /> tháng <Blank w="3.5rem" /> năm <Blank w="4.5rem" />
      </p>

      {/* Bên A — trung tâm (điền sẵn thông tin Bên A) */}
      <div className="contract-party">
        <h3 className="my-2 font-bold text-slate-900">Bên A</h3>
        <Field label="Họ và tên" value={C.representative} />
        <Field label="Địa chỉ" value={C.address} />
        <Field label="Email" value={C.email} />
        <Field label="Đại diện cho trung tâm gia sư" value={C.name} />
      </div>

      {/* Bên B — gia sư (để trống cho gia sư điền) */}
      <div className="contract-party">
        <h3 className="my-2 font-bold text-slate-900">Bên B</h3>
        <Field label="Họ và tên" value={null} />
        <Field label="Năm sinh" value={null} blankWidth="10rem" />
        <Field label="Nghề nghiệp" value={null} />
        <Field label="Điện thoại" value={null} blankWidth="12rem" />
        <Field label="Địa chỉ thường trú" value={null} />
        <p className="contract-row my-1.5">
          <span className="font-medium">Sẽ là người có trách nhiệm giảng dạy lớp mã số:</span>{" "}
          {classCode ? (
            <span className="font-semibold text-slate-900">#{classCode}</span>
          ) : (
            <Blank w="10rem" />
          )}
        </p>
      </div>

      <p className="my-3">
        Chúng tôi thoả thuận ký kết HỢP ĐỒNG GIAO (NHẬN) LỚP và cam kết làm đúng những điều khoản sau đây:
      </p>
      <p className="my-3">
        Vì quyền lợi và uy tín lâu dài của cả hai bên, kính mong Giáo Viên, Sinh Viên đọc kỹ hợp đồng này
        trước khi nhận lớp.
      </p>

      {/* Các hình thức nhận lớp */}
      <h2 className="mt-6 text-base font-bold uppercase text-slate-900">Các hình thức nhận lớp</h2>
      <ol className="my-2 list-decimal space-y-2 pl-6">
        <li>
          Gia sư đến trực tiếp văn phòng {C.name} tại địa chỉ: {C.address} để ký hợp đồng, đóng phí nhận lớp
          và nhận giấy giới thiệu trực tiếp.
        </li>
        <li>
          Gia sư nhận lớp qua hình thức online. Gia sư sẽ gửi phí nhận lớp qua các tài khoản ngân hàng của
          trung tâm cung cấp bên trên. Giấy giới thiệu và hợp đồng sẽ được gửi qua tài khoản gia sư tại
          website {C.website}.
        </li>
      </ol>
      <p className="my-3">
        Gia sư nhận lớp qua một trong hai hình thức trên đều sẽ chấp hành theo các điều khoản của hợp đồng
        giao (nhận) lớp dưới đây:
      </p>

      {/* Bên B — nghĩa vụ gia sư */}
      <h2 className="mt-6 text-base font-bold text-slate-900">Bên B : Phía gia sư</h2>

      <div className="contract-clause my-2.5">
        <strong>Điều 1:</strong> Gia sư khi nhận lớp sẽ đóng phí trước khi nhận lớp cho trung tâm khoản phí
        như sau:
        <ul className="my-2 list-disc space-y-1.5 pl-6">
          <li>
            Đóng 25% của học phí tháng đầu tiên đối với các môn năng khiếu, nghệ thuật, thể thao, ngoại ngữ,
            tin học, giáo dục trẻ đặc biệt.
          </li>
          <li>
            Đóng 25 - 30% của học phí tháng đầu tiên đối với các môn học văn hóa từ cấp tiểu học đến THPT
            (toán, lý, hóa, sinh, văn, tiểu học …)
          </li>
        </ul>
      </div>

      <p className="contract-clause my-2.5">
        <strong>Điều 2:</strong> Khi đến gặp phụ huynh, Bên B vui lòng xuất trình với phụ huynh, Giấy giới
        thiệu (bắt buộc).
      </p>

      <p className="contract-clause my-2.5">
        <strong>Điều 3:</strong> Sau khi trung tâm cung cấp số điện thoại và địa chỉ của phụ huynh – học viên,
        Bên B phải alo hẹn gặp ngay. Khi gặp sự cố (vì bất cứ lý do gì mà không tiến hành học: không dạy ngay,
        lùi ngày học, hay bất kỳ một lý do nào dù nhỏ nhất) phải báo cho Bên A khi bạn đang ở nhà phụ huynh
        hoặc vừa ra khỏi nhà phụ huynh. Các bạn gọi theo số điện thoại này từ Thứ 2 - Chủ nhật 24/24:{" "}
        {C.hotline1} hoặc {C.hotline2}
      </p>

      <p className="contract-clause my-2.5">
        <strong>Điều 4:</strong> Bên B phải có trách nhiệm giữ lại Phiếu thu của ngân hàng cẩn thận, nếu có sự
        cố xảy ra chúng sẽ là chứng từ để trung tâm giải quyết hoàn phí.
      </p>

      <p className="contract-clause my-2.5">
        <strong>Điều 5:</strong> Sau 1 tháng đầu tiên, hợp đồng này chấm dứt. Nếu trong tháng đầu lỗi do phụ
        huynh học viên, trung tâm sẽ giải quyết cho gia sư dựa vào từ thời điểm nhận lớp đến thời điểm gia sư
        báo sự cố.
      </p>

      {/* Bên A — nghĩa vụ trung tâm */}
      <h2 className="mt-6 text-base font-bold text-slate-900">Bên A : Phía trung tâm gia sư {C.name}</h2>

      <p className="contract-clause my-2.5">
        <strong>Điều 6:</strong> Sau khi nhận phí Bên A sẽ cung cấp địa chỉ, số điện thoại của PHHS trên giấy
        giới thiệu và gọi điện báo thông tin của Bên B cho Phụ huynh.
      </p>

      <div className="contract-clause my-2.5">
        <strong>Điều 7:</strong> Tùy theo từng trường hợp cụ thể Bên A sẽ giải quyết hoàn phí như sau:
        <ol className="my-2 list-decimal space-y-2 pl-6">
          <li>
            Nếu Phụ Huynh không cho con học, học viên không học (Trung tâm sẽ cử người xác minh thông tin
            trong vòng từ 2 đến 7 ngày): <strong>Bên A hoàn lại 100% phí.</strong>
          </li>
          <li>
            Nếu Bên B: Dạy không đạt, học sinh không hiểu hoặc các trường hợp gia sư thiếu trách nhiệm (chỉ áp
            dụng khi chưa nhận lương): <strong>Bên A thu 10% của học phí.</strong>
          </li>
          <li>
            Nếu Bên B: Thay đổi bất kỳ điều khoản ban đầu (PH đồng ý mà Bên B không dạy, đi trễ về sớm, hẹn
            phụ huynh mà không đến đúng hẹn, tự ý gọi lại phụ huynh đổi lịch hẹn, lấy lý do xa quá, tăng
            lương, hoặc đau ốm, có người thân nhập viện trả lớp, tự ý thương lượng mức lương khi phụ huynh yêu
            cầu, tăng số buổi dạy, tăng số học sinh so với hợp đồng ban đầu, không liên hệ phụ huynh ngay dẫn
            đến tình trạng mất lớp, dạy vài buổi đòi phụ huynh đóng tiền …):
            <ul className="my-2 list-disc space-y-1.5 pl-6">
              <li>Vi phạm Điều 2 hoặc Điều 3 của hợp đồng.</li>
              <li>Nói không đúng sự thật (nhờ Phụ Huynh báo với Bên A, nói không chính xác).</li>
              <li>Báo với Phụ huynh đóng phí nhận lớp cho trung tâm.</li>
            </ul>
            <strong>Bên A không hoàn trả phí.</strong>
          </li>
        </ol>
      </div>

      {/* Chữ ký hai bên */}
      <div className="contract-signatures mt-9 flex justify-between gap-6 text-center">
        <div className="flex-1">
          <p className="contract-sign-role font-bold">Bên B</p>
          <p className="contract-sign-hint italic text-slate-500">(Chữ ký bên B)</p>
        </div>
        <div className="flex-1">
          <p className="contract-sign-role font-bold">Bên A</p>
          <p className="contract-sign-hint italic text-slate-500">(Chữ ký bên A)</p>
        </div>
      </div>
    </div>
  );
};

export default ContractTemplate;
