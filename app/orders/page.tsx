import { Suspense } from "react";
import OrdersContent from "@/app/orders/_components/orders-content";

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-6">Загрузка заказов...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
