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
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
        Tại Sao Chọn WebTutorCenter
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        {INTRO_SECTIONS.map((section) => {
          const IconComponent = ICON_MAP[section.icon] || Star;
          return (
            <div
              key={section.id}
              className="bg-white rounded-lg p-8 border border-gray-200 hover:border-green-300 transition-colors"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <IconComponent className="w-8 h-8 text-green-600" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {section.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">{section.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
