import { useState, useEffect, useCallback } from "react";

const IN_TAB_STORAGE_EVENT = "fittrack:localstorage";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));

      window.dispatchEvent(
        new CustomEvent(IN_TAB_STORAGE_EVENT, { detail: { key, value: valueToStore } })
      );
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };

    const handleInTabStorageChange = (e: Event) => {
      const ce = e as CustomEvent<{ key: string; value: T }>;
      if (ce.detail?.key === key) setStoredValue(ce.detail.value);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(IN_TAB_STORAGE_EVENT, handleInTabStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(IN_TAB_STORAGE_EVENT, handleInTabStorageChange);
    };
  }, [key]);

  return [storedValue, setValue] as const;
}