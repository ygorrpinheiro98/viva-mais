"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function StravaCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      handleCallback(code);
    } else {
      setError("Código de autorização não encontrado");
      setStatus("error");
    }
  }, [searchParams]);

  const handleCallback = async (code: string) => {
    try {
      const response = await fetch("/api/strava/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        setStatus("success");
        setTimeout(() => router.push("/dashboard/strava"), 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Erro ao conectar com Strava");
        setStatus("error");
      }
    } catch (err) {
      setError("Erro de conexão");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        {status === "connecting" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold">Conectando com Strava...</h2>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-500">Conectado com sucesso!</h2>
            <p className="text-muted-foreground mt-2">Redirecionando...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-500">Erro na conexão</h2>
            <p className="text-muted-foreground mt-2">{error}</p>
            <button
              onClick={() => router.push("/dashboard/strava")}
              className="mt-6 px-6 py-3 rounded-full bg-primary text-white font-medium"
            >
              Voltar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
