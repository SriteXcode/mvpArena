"use client";

import React from "react";
import dynamic from "next/dynamic";

const AuthModal = dynamic(() => import("@/components/AuthModal"), {
  ssr: false,
});

const ProfileCompletionModal = dynamic(
  () => import("@/components/ProfileCompletionModal"),
  {
    ssr: false,
  }
);

export default function ClientModals() {
  return (
    <>
      <AuthModal />
      <ProfileCompletionModal />
    </>
  );
}
