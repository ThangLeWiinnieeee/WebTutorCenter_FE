import { useEffect, useState } from "react";
import axiosInstance from "@/services/axiosInstance";
import API_ENDPOINTS from "@/constants/apiEndpoints";

// Hook lấy danh sách môn học đang bật từ backend, dùng cho các form chọn môn.
const useSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
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
