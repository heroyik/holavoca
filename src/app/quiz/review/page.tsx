import { Suspense } from "react";
import ReviewQuizLoader from "@/components/ReviewQuizLoader";

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="flex-center" style={{ minHeight: '100vh', fontWeight: '800', color: 'var(--duo-blue)' }}>Cargando Repaso...</div>}>
      <ReviewQuizLoader />
    </Suspense>
  );
}
