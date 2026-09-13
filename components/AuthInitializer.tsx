"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export default function AuthInitializer() {
  const loadSession = useAuthStore((state) => state.loadSession);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return null;
}
