"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { openAuthModal } = useAuth();

  useEffect(() => {
    openAuthModal("login");
    router.replace("/?auth=login");
  }, [router, openAuthModal]);

  return null;
}
