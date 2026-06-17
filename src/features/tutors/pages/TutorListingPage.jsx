import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams, Link } from "react-router-dom";
import TutorFilters from "@/features/tutors/components/TutorFilters";
import TutorCard from "@/features/tutors/components/TutorCard";
import TopTutorCard from "@/features/tutors/components/TopTutorCard";
import TutorPagination from "@/features/tutors/components/TutorPagination";
import { searchTutorsThunk, getTopTutorsThisMonthThunk } from "@/features/tutors/store/tutorThunks";

const LIMIT = 10;

export default function TutorListingPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { searchResults, topTutorsThisMonth, totalResults, currentPage, filters, loading } = useSelector(
    (state) => state.tutors
  );

  const [localFilters, setLocalFilters] = useState(() => {
    // Initialize filters from URL or Redux state
    const subject = searchParams.get("subject");
    const fromRedux = filters || {};
    return subject ? { ...fromRedux, subject } : fromRedux;
  });
  const [page, setPage] = useState(1);

  // Fetch top tutors this month on mount
  useEffect(() => {
    dispatch(getTopTutorsThisMonthThunk(10));
  }, [dispatch]);

  // Fetch results when filters or page changes
  useEffect(() => {
    dispatch(
      searchTutorsThunk({
        filters: localFilters,
        page,
        limit: LIMIT,
      })
    );
  }, [dispatch, localFilters, page]);

  const handleFilterChange = (newFilters) => {
    setLocalFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const totalPages = Math.ceil(totalResults / LIMIT);

  // Đang lọc/tìm kiếm thì ẩn danh sách gợi ý "Gia Sư Hàng Đầu Tháng Này"
  const hasActiveFilters = Object.keys(localFilters).some((k) => localFilters[k]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tìm Gia Sư</h1>
        <p className="text-gray-600 mt-2">
          Tìm kiếm giáo viên gia sư phù hợp với nhu cầu của bạn
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="md:col-span-1">
          <TutorFilters filters={localFilters} onFilterChange={handleFilterChange} />
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          {/* Top Tutors This Month Section — ẩn khi đang lọc/tìm kiếm */}
          {!hasActiveFilters && topTutorsThisMonth && topTutorsThisMonth.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Gia Sư Hàng Đầu Tháng Này</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {topTutorsThisMonth.map((tutor) => (
                  <Link key={tutor.id} to={`/tutors/${tutor.id}`}>
                    <TopTutorCard tutor={tutor} />
                  </Link>
                ))}
              </div>
              <hr className="my-8" />
            </div>
          )}

          {/* Results Info */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              Tìm thấy <span className="font-bold text-gray-900">{totalResults}</span> gia sư
            </p>
            {loading && <p className="text-sm text-gray-500">Đang tải...</p>}
          </div>

          {/* Tutor List */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Không tìm thấy gia sư phù hợp</p>
              <Link to="/" className="text-green-600 hover:underline">
                Quay lại trang chủ
              </Link>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 gap-4 mb-8">
                {searchResults.map((tutor) => (
                  <Link key={tutor.id} to={`/tutors/${tutor.id}`}>
                    <TutorCard tutor={tutor} />
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <TutorPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
