"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

    useEffect(() => {
        // Middleware already checks for authentication cookies
        // Page renders only if authenticated

    }, []);

  return null;
}
