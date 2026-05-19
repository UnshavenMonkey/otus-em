import { Suspense } from "react";
import PageContent from "./_components/page-content";

export default function Home() {
  return (
    <Suspense fallback={<div className="p-6">Загрузка заказов...</div>}>
      <PageContent />
    </Suspense>
  );
}