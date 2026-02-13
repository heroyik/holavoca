import { Suspense } from "react";
import ReviewQuizLoader from "@/components/ReviewQuizLoader";

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="flex-center" style={{ height: '100vh' }}>Loading Review Session...</div>}>
      <ReviewQuizLoader />
    </Suspense>
  );
}
