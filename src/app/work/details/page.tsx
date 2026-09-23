"use client";

import React, { Suspense } from "react";
import PengalamanDetailPage from "@/app/pengalaman/details/page";

export default function WorkDetailsForwarder() {
  return (
    <Suspense fallback={<div style={{ padding: "3rem", textAlign: "center" }}>Memuat detail...</div>}>
      <PengalamanDetailPage />
    </Suspense>
  );
}
