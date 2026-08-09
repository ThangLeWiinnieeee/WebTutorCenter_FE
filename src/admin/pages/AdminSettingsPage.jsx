import { useEffect, useState } from "react";
import { FileText, Loader2, PhoneCall, Save, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

import RichTextEditor from "@/admin/components/settings/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import settingsService from "@/services/settingsService";

const EMPTY_FORM = {
  address: "",
  phone: "",
  phone2: "",
  email: "",
  facebookLink: "",
  zaloLink: "",
  contractHtml: "",
};

const tabs = [
  { id: "footer", label: "Cấu hình chân trang", icon: SettingsIcon },
  { id: "classes", label: "Trang lớp cần gia sư", icon: FileText },
];

// Trang admin quản lý cấu hình công khai dùng chung của website.
const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState("footer");
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsService
      .getFooter()
      .then((response) => {
        const data = response.data?.data;
        if (data) setForm({ ...EMPTY_FORM, ...data });
      })
      .catch(() => toast.error("Không tải được cấu hình website"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.address.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error("Vui lòng điền đầy đủ địa chỉ, hotline 1 và email");
      return;
    }

    setSaving(true);
    try {
      const response = await settingsService.updateFooter(form);
      if (response.data?.success) {
        setForm({ ...EMPTY_FORM, ...response.data.data });
        toast.success("Đã lưu cấu hình website");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Không lưu được cấu hình");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
          <SettingsIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Cấu hình website</h1>
          <p className="text-sm text-slate-500">Quản lý nội dung công khai được lưu trong database</p>
        </div>
      </header>

      <nav className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex min-w-fit items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              activeTab === id
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {activeTab === "footer" ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Cấu hình chân trang (Footer)</h2>
              <p className="mt-1 text-sm text-slate-500">
                Quản lý thông tin liên hệ hiển thị ở chân trang đối với khách truy cập
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Địa chỉ liên hệ *</label>
              <Input
                type="text"
                value={form.address}
                onChange={(event) => handleChange("address", event.target.value)}
                placeholder="Ví dụ: 54 Nguyễn Lương Bằng, Hòa Khánh Bắc, Đà Nẵng"
                className="h-11 rounded-xl border-slate-200 focus-visible:ring-emerald-200"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Số điện thoại Hotline *
                </label>
                <Input
                  type="tel"
                  maxLength={20}
                  value={form.phone}
                  onChange={(event) => handleChange("phone", event.target.value)}
                  placeholder="Ví dụ: 093 143 9203"
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-emerald-200"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email hỗ trợ *</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  placeholder="Ví dụ: contact@webtutor.vn"
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-emerald-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Link Facebook Fanpage
                </label>
                <Input
                  type="url"
                  value={form.facebookLink}
                  onChange={(event) => handleChange("facebookLink", event.target.value)}
                  placeholder="Ví dụ: https://facebook.com/webtutor"
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-emerald-200"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Link Zalo liên hệ</label>
                <Input
                  type="url"
                  value={form.zaloLink}
                  onChange={(event) => handleChange("zaloLink", event.target.value)}
                  placeholder="Ví dụ: https://zalo.me/0931439203"
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-emerald-200"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Cấu hình trang lớp cần gia sư</h2>
              <p className="mt-1 text-sm text-slate-500">
                Hotline dùng chung cho trang lớp cần gia sư, trang tìm gia sư, chân trang và hợp đồng mẫu.
              </p>
            </div>

            <section className="rounded-xl bg-slate-50 p-4">
              <div className="mb-4 flex items-center gap-2">
                <PhoneCall className="h-5 w-5 text-emerald-600" />
                <h3 className="font-semibold text-slate-900">Hỗ trợ trực tiếp</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Hotline 1 *</label>
                  <Input
                    type="tel"
                    maxLength={20}
                    value={form.phone}
                    onChange={(event) => handleChange("phone", event.target.value)}
                    placeholder="Ví dụ: 093 143 9203"
                    className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-emerald-200"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    Đồng bộ với “Số điện thoại Hotline” ở cấu hình chân trang.
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Hotline 2 <span className="font-normal text-slate-400">(không bắt buộc)</span>
                  </label>
                  <Input
                    type="tel"
                    maxLength={20}
                    value={form.phone2}
                    onChange={(event) => handleChange("phone2", event.target.value)}
                    placeholder="Để trống nếu chỉ dùng một hotline"
                    className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-emerald-200"
                  />
                </div>
              </div>
            </section>

            <section>
              <div className="mb-3">
                <h3 className="font-semibold text-slate-900">Hợp đồng mẫu</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Soạn trực tiếp như văn bản Word. Các dữ liệu tự động trong dấu ngoặc nhọn sẽ lấy giá trị mới
                  nhất từ database khi hiển thị.
                </p>
              </div>
              <RichTextEditor
                value={form.contractHtml}
                onChange={(value) => handleChange("contractHtml", value)}
              />
            </section>
          </div>
        )}

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
          <Button
            type="submit"
            disabled={saving}
            className="h-11 gap-1.5 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Đang lưu..." : "Lưu cấu hình"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
