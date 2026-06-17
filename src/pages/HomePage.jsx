import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import HeroSearchBar from "@/features/tutors/components/HeroSearchBar";
import TopTutorCard from "@/features/tutors/components/TopTutorCard";
import TopThisMonthTutors from "@/features/tutors/components/TopThisMonthTutors";
import IntroSections from "@/components/home/IntroSections";
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

  return (
    <div className="min-h-screen bg-white">
      {/* Section 1: Hero Search */}
      <section id="home" className="bg-gradient-to-br from-green-50 to-blue-50 py-12 md:py-16">
        <HeroSearchBar />
      </section>

      {/* Section 2 & 3: Top Tutors + Sidebar (2 columns on desktop, stacked on mobile) */}
      <section id="tutors" className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Top Tutors - Left side (2 columns) */}
          <div className="md:col-span-2">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Gia Sư</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Đang tải...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {topTutors.slice(0, 6).map((tutor) => (
                    <Link key={tutor.id} to={`/tutors/${tutor.id}`}>
                      <TopTutorCard tutor={tutor} />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Gia Sư Mới</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Đang tải...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {newTutors.slice(0, 6).map((tutor) => (
                    <Link key={tutor.id} to={`/tutors/${tutor.id}`}>
                      <TopTutorCard tutor={tutor} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Right side */}
          <div className="md:col-span-1">
            <TopThisMonthTutors tutors={topTutors.slice(0, 10)} />
          </div>
        </div>
      </section>

      {/* Sections 4-7: Intro Content */}
      <section id="about" className="bg-gray-50 py-12 md:py-16">
        <IntroSections />
      </section>

      {/* Floating Contact Bar */}
      <FloatingContactBar />
    </div>
  );
}
