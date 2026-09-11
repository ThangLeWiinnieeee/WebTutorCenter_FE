import { startTransition, useEffect, useState } from "react";

import settingsService from "@/services/settingsService";

// Đọc một nguồn cấu hình công khai dùng chung từ database.
const useSiteSettings = () => {
  const [state, setState] = useState({ data: {}, loading: true, error: false });

  useEffect(() => {
    let active = true;

    const refresh = () => {
      settingsService
        .getFooter()
        .then((response) => {
          if (!active) return;
          const data = response.data?.data;
          startTransition(() => {
            setState({ data: data || {}, loading: false, error: !data });
          });
        })
        .catch(() => {
          if (active) setState((current) => ({ ...current, loading: false, error: true }));
        });
    };

    refresh();
    window.addEventListener("focus", refresh);

    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return state;
};

export default useSiteSettings;
