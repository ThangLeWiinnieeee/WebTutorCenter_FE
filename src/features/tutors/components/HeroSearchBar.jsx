import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Sparkles, GraduationCap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSearchBar() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const value = subject.trim();
    if (value) {
      navigate(`/tutors?subject=${encodeURIComponent(value)}`);
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 py-16">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-10 -left-10 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative text-center mb-10">
        <span
          data-aos="fade-down"
          className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-emerald-700 shadow-sm backdrop-blur"
        >
          <Sparkles className="h-4 w-4" />
          Nền tảng kết nối gia sư hàng đầu
        </span>

        <h1
          data-aos="fade-up"
          data-aos-delay="100"
          className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900"
        >
          Tìm{" "}
          <span className="bg-linear-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
            Gia Sư Phù Hợp
          </span>
        </h1>

        <p
          data-aos="fade-up"
          data-aos-delay="200"
          className="mx-auto mt-4 max-w-2xl text-lg text-gray-600"
        >
          Kết nối với hàng nghìn giáo viên gia sư chuyên nghiệp trên toàn quốc.
          Học tập linh hoạt, hiệu quả, đúng nhu cầu của bạn.
        </p>
      </div>

      <form
        data-aos="fade-up"
        data-aos-delay="300"
        onSubmit={handleSearch}
        className="relative flex flex-col md:flex-row gap-3 max-w-2xl mx-auto rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Nhập môn học (Toán, Tiếng Anh, ...)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-xl border-0 bg-transparent py-3 pl-12 pr-4 text-gray-900 focus:outline-none focus:ring-0"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="rounded-xl bg-linear-to-r from-emerald-500 to-emerald-600 px-8 text-white shadow-md transition hover:from-emerald-600 hover:to-emerald-700"
        >
          Tìm Kiếm
        </Button>
      </form>

      {/* Secondary CTAs */}
      <div
        data-aos="fade-up"
        data-aos-delay="400"
        className="mt-6 flex flex-wrap items-center justify-center gap-3"
      >
        <Link
          to="/find-tutor"
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:ring-emerald-300 hover:text-emerald-700"
        >
          <GraduationCap className="h-4 w-4" />
          Đăng tin tìm gia sư
        </Link>
        <Link
          to="/register-tutor"
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:ring-emerald-300 hover:text-emerald-700"
        >
          <ShieldCheck className="h-4 w-4" />
          Trở thành gia sư
        </Link>
      </div>
    </div>
  );
}
