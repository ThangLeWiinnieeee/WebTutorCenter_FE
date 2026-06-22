import {
  Star,
  Users,
  Globe,
  Phone,
} from "lucide-react";
import { INTRO_SECTIONS } from "@/features/tutors/constants/introSections";

const ICON_MAP = {
  star: Star,
  users: Users,
  map: Globe,
  phone: Phone,
};

export default function IntroSections() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      <div className="text-center mb-12" data-aos="fade-up">
        <span className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
          Giá trị cốt lõi
        </span>
        <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">
          Tại Sao Chọn WebTutorCenter
        </h2>
        <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-linear-to-r from-emerald-400 to-blue-500" />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {INTRO_SECTIONS.map((section, index) => {
          const IconComponent = ICON_MAP[section.icon] || Star;
          // Card chẵn trượt từ trái, card lẻ trượt từ phải
          const aos = index % 2 === 0 ? "fade-right" : "fade-left";
          return (
            <div
              key={section.id}
              data-aos={aos}
              data-aos-delay={`${(index % 2) * 100}`}
              className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-emerald-200"
            >
              {/* Accent gradient on hover */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 scale-x-0 bg-linear-to-r from-emerald-400 to-blue-500 transition-transform duration-300 group-hover:scale-x-100" />

              {/* Icon */}
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-100 to-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-110">
                <IconComponent className="h-8 w-8" />
              </div>

              {/* Title */}
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                {section.title}
              </h3>

              {/* Description */}
              <p className="leading-relaxed text-gray-600">{section.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
