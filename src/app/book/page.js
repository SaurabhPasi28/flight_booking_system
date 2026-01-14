import { Suspense } from "react";
import BookClient from "@/components/BookClient";

export default function BookNowPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading booking page...</div>}>
      <BookClient />
    </Suspense>
  );
}
