import { useEffect, useState } from "react";
import axiosInstance from "@/services/axiosInstance";
import API_ENDPOINTS from "@/constants/apiEndpoints";

// Lấy danh sách tên môn học đang bật từ DB (nguồn duy nhất, admin quản lý).
// Dùng cho các form chọn môn (đăng ký gia sư, sửa hồ sơ...).
const useSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    // loading khởi tạo đã là true → không set lại đồng bộ trong effect (tránh cascading render)
    axiosInstance
      .get(API_ENDPOINTS.SUBJECTS.LIST)
      .then((res) => {
        if (active) setSubjects(res.data?.data?.subjects ?? []);
      })
      .catch(() => {
        if (active) setSubjects([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { subjects, loading };
};

export default useSubjects;
