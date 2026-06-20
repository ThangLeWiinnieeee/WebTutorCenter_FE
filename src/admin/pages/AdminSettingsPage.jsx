import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import settingsService from "@/services/settingsService";

const AdminSettingsPage = () => {
  const [form, setForm] = useState({
    address: "",
    phone: "",
    email: "",
    facebookLink: "",
    zaloLink: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    settingsService
      .getFooter()
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          const d = res.data.data;
          setForm({
            address: d.address || "",
            phone: d.phone || "",
            email: d.email || "",
            facebookLink: d.facebookLink || "",
            zaloLink: d.zaloLink || "",
          });
        }
      })
      .catch(() => {
        toast.error("Không tải được cấu hình chân trang");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.address || !form.phone || !form.email) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }

    setSaving(true);
    settingsService
      .updateFooter(form)
      .then((res) => {
        if (res.data?.success) {
          toast.success("Đã lưu thông tin cấu hình");
        } else {
          toast.error(res.data?.message || "Lỗi lưu cấu hình");
        }
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Không lưu được cấu hình");
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleChange = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e3a5f] text-white">
          <SettingsIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Cấu hình chân trang (Footer)</h1>
          <p className="text-sm text-slate-500">
            Quản lý thông tin liên hệ hiển thị ở chân trang đối với khách truy cập
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Địa chỉ liên hệ *
              </label>
              <Input
                type="text"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
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
                  type="text"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="Ví dụ: 093 143 9203"
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-emerald-200"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email hỗ trợ *
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
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
                  onChange={(e) => handleChange("facebookLink", e.target.value)}
                  placeholder="Ví dụ: https://facebook.com/webtutor"
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-emerald-200"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Link Zalo liên hệ
                </label>
                <Input
                  type="url"
                  value={form.zaloLink}
                  onChange={(e) => handleChange("zaloLink", e.target.value)}
                  placeholder="Ví dụ: https://zalo.me/0931439203"
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-emerald-200"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button
              type="submit"
              disabled={saving}
              className="h-11 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700 gap-1.5 shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Lưu cấu hình
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
