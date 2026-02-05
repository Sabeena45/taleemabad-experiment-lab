"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LEVELS } from "@/lib/db";

export default function ExperimentRedirect() {
  const params = useParams();
  const router = useRouter();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (redirected) return;

    fetch(`/api/experiments/${params.id}`)
      .then((res) => res.json())
      .then((exp) => {
        const level = LEVELS[exp.current_level - 1];
        router.replace(`/experiment/${params.id}/${level.path}`);
        setRedirected(true);
      })
      .catch(console.error);
  }, [params.id, router, redirected]);

  return (
    <div className="flex items-center justify-center h-48">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
