import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
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
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Tìm Gia Sư Phù Hợp
        </h1>
        <p className="text-lg text-gray-600">
          Kết nối với hàng nghìn giáo viên gia sư chuyên nghiệp trên toàn quốc
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Nhập môn học (Toán, Tiếng Anh, ...)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white px-8"
        >
          Tìm Kiếm
        </Button>
      </form>
    </div>
  );
}
