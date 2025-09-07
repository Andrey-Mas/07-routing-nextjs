import { useState, useEffect } from "react";

/**
 * Проста реалізація debounce-хука.
 * @param value Значення, яке треба "задебаунсити"
 * @param delay Час у мс (за замовчуванням 500мс)
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
