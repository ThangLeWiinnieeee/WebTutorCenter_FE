import { Link } from "react-router-dom";
import { GraduationCap, Search, ArrowRight } from "lucide-react";

export default function HomeCTA() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-blue-700 py-16 md:py-20">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <h2
          data-aos="fade-up"
          className="text-3xl md:text-4xl font-bold text-white"
        >
          Sẵn sàng bắt đầu hành trình học tập?
        </h2>
        <p
          data-aos="fade-up"
          data-aos-delay="100"
          className="mx-auto mt-4 max-w-2xl text-lg text-emerald-50"
        >
          Đăng tin tìm gia sư để nhận báo giá phù hợp, hoặc trở thành gia sư và
          bắt đầu nhận lớp ngay hôm nay.
        </p>

        <div
          data-aos="zoom-in"
          data-aos-delay="200"
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/find-tutor"
            className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 font-semibold text-emerald-700 shadow-lg transition hover:bg-emerald-50"
          >
            <Search className="h-5 w-5" />
            Đăng tin tìm gia sư
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/register-tutor"
            className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white/10 px-8 py-3.5 font-semibold text-white ring-1 ring-white/40 backdrop-blur transition hover:bg-white/20"
          >
            <GraduationCap className="h-5 w-5" />
            Trở thành gia sư
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
