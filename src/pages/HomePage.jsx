import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import AOS from "aos";
import { Sparkles, Clock } from "lucide-react";
import HeroSearchBar from "@/features/tutors/components/HeroSearchBar";
import TopTutorCard from "@/features/tutors/components/TopTutorCard";
import TopThisMonthTutors from "@/features/tutors/components/TopThisMonthTutors";
import IntroSections from "@/components/home/IntroSections";
import HomeCTA from "@/components/home/HomeCTA";
import FloatingContactBar from "@/components/shared/FloatingContactBar";
import { getTopTutorsThunk, getNewTutorsThunk } from "@/features/tutors/store/tutorThunks";

export default function HomePage() {
  const dispatch = useDispatch();
  const { topTutors, newTutors, loading } = useSelector((state) => state.tutors);

  useEffect(() => {
    // Fetch top 10 tutors by totalClassesAccepted
    dispatch(getTopTutorsThunk(10));
    // Fetch newest tutors (past 30 days)
    dispatch(getNewTutorsThunk({ days: 30, limit: 10 }));
  }, [dispatch]);

  // Tính lại vị trí trigger animation sau khi danh sách gia sư load xong
  useEffect(() => {
    AOS.refresh();
  }, [loading, topTutors.length, newTutors.length]);

  return (
    <div className="min-h-screen bg-white">
      {/* Section 1: Hero Search */}
      <section id="home" className="relative overflow-hidden bg-linear-to-br from-emerald-50 via-white to-blue-50">
        <HeroSearchBar />
      </section>

      {/* Section 2 & 3: Top Tutors + Sidebar (2 columns on desktop, stacked on mobile) */}
      <section id="tutors" className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Top Tutors - Left side (2 columns) */}
          <div className="md:col-span-2">
            <div className="mb-12">
              <div className="mb-6 flex items-center gap-2" data-aos="fade-right">
                <Sparkles className="h-6 w-6 text-emerald-500" />
                <h2 className="text-2xl font-bold text-gray-900">Top Gia Sư</h2>
              </div>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Đang tải...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {topTutors.slice(0, 6).map((tutor, index) => (
                    <Link
                      key={tutor.id}
                      to={`/tutors/${tutor.id}`}
                      data-aos="fade-up"
                      data-aos-delay={`${(index % 2) * 100}`}
                    >
                      <TopTutorCard tutor={tutor} />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-6 flex items-center gap-2" data-aos="fade-right">
                <Clock className="h-6 w-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-gray-900">Gia Sư Mới</h2>
              </div>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Đang tải...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {newTutors.slice(0, 6).map((tutor, index) => (
                    <Link
                      key={tutor.id}
                      to={`/tutors/${tutor.id}`}
                      data-aos="fade-up"
                      data-aos-delay={`${(index % 2) * 100}`}
                    >
                      <TopTutorCard tutor={tutor} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Right side */}
          <div className="md:col-span-1" data-aos="fade-left">
            <TopThisMonthTutors tutors={topTutors.slice(0, 10)} />
          </div>
        </div>
      </section>

      {/* Sections 4-7: Intro Content */}
      <section id="about" className="bg-gray-50 py-12 md:py-16">
        <IntroSections />
      </section>

      {/* Final CTA */}
      <HomeCTA />

      {/* Floating Contact Bar */}
      <FloatingContactBar />
    </div>
  );
}
