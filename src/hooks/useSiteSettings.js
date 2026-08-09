import { startTransition, useEffect, useState } from "react";

import { DEFAULT_FOOTER } from "@/constants/footer";
import settingsService from "@/services/settingsService";

// Đọc một nguồn cấu hình công khai dùng chung từ database.
const useSiteSettings = () => {
  const [state, setState] = useState({ data: DEFAULT_FOOTER, loading: true, error: false });

  useEffect(() => {
    let active = true;

    settingsService
      .getFooter()
      .then((response) => {
        if (!active) return;
        const data = response.data?.data;
        startTransition(() => {
          setState({ data: { ...DEFAULT_FOOTER, ...data }, loading: false, error: !data });
        });
      })
      .catch(() => {
        if (active) setState((current) => ({ ...current, loading: false, error: true }));
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
};

export default useSiteSettings;
