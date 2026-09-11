import { useEffect, useState } from "react";

// Trả về `value` sau khi nó ngừng thay đổi trong `delay` ms.
// Dùng cho ô tìm kiếm: gõ xong mới gọi API, thay vì gọi theo từng ký tự.
export const useDebouncedValue = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export default useDebouncedValue;
