"use client";

import React, { Suspense } from "react";
import KaryaDetailPage from "@/app/karya/details/page";

export default function PublicationsDetailsForwarder() {
  return (
    <Suspense fallback={<div style={{ padding: "3rem", textAlign: "center" }}>Memuat detail publikasi ilmiah...</div>}>
      <KaryaDetailPage />
    </Suspense>
  );
}
