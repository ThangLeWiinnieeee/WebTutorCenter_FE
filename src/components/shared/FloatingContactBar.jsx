import { Phone } from "lucide-react";

export default function FloatingContactBar() {
  const phoneNumber = "09xxxxxxxx"; // Thay thế bằng số điện thoại thực tế
  const phoneLink = `tel:${phoneNumber}`;

  return (
    <a
      href={phoneLink}
      className="fixed bottom-8 left-8 z-50 flex items-center gap-3 bg-gradient-to-r from-orange-400 to-orange-500 px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
    >
      {/* Icon phone */}
      <div className="bg-white/20 p-2.5 rounded-full group-hover:bg-white/30 transition">
        <Phone className="w-6 h-6 text-white" />
      </div>
      
      {/* Phone number */}
      <span className="text-white font-semibold text-lg hidden sm:inline">
        {phoneNumber}
      </span>
    </a>
  );
}
