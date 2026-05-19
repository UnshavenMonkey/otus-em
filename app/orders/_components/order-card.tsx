import { ImageOff, PackageCheck } from "lucide-react";

import { orderDateFormatter } from "@/app/orders/_components/constants";
import type { OrderCardProps } from "@/app/orders/_components/types";
import {
  getOrderItems,
  getOrderProductQuantity,
  getOrderQuantity,
  getOrderStatusLabel,
  getOrderTotal,
} from "@/app/orders/_components/utils";
import type { OrderStatus } from "@/lib/api/types";
import { formatCurrency } from "@/lib/formatters";

export function OrderCard({
  order,
  statusOptions,
  canUpdateStatus,
  onStatusChange,
}: OrderCardProps) {
  const items = getOrderItems(order);

  return (
    <article className="rounded-lg border bg-card">
      <div className="grid gap-4 border-b p-5 md:grid-cols-[minmax(0,1fr)_220px_160px] md:items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-semibold">
            <PackageCheck
              className="size-5 text-muted-foreground"
              aria-hidden="true"
            />
            <span>Заказ #{order.id.slice(0, 8)}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {orderDateFormatter.format(new Date(order.createdAt))}
          </p>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium">Статус</span>
          <select
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
            value={order.status}
            onChange={(event) =>
              onStatusChange(order.id, event.target.value as OrderStatus)
            }
            disabled={!canUpdateStatus}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {getOrderStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>

        <div className="md:text-right">
          <p className="text-sm text-muted-foreground">
            {getOrderQuantity(order)} товар(ов)
          </p>
          <p className="mt-1 text-xl font-semibold">
            {formatCurrency(getOrderTotal(order))}
          </p>
        </div>
      </div>

      <div className="divide-y">
        {items.length ? (
          items.map((item) => (
            <div
              className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_110px_140px] sm:items-center"
              key={item.id}
            >
              <div className="flex min-w-0 gap-3">
                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                  {item.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="h-full w-full object-cover"
                      src={item.photo}
                      alt={item.name}
                    />
                  ) : (
                    <ImageOff
                      className="size-5 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {item.category?.name ?? "Без категории"}
                  </p>
                  <h3 className="mt-1 line-clamp-2 text-sm font-medium">
                    {item.name}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-muted-foreground sm:text-center">
                {getOrderProductQuantity(item)} шт.
              </p>
              <p className="font-medium sm:text-right">
                {formatCurrency(item.price * getOrderProductQuantity(item))}
              </p>
            </div>
          ))
        ) : (
          <p className="p-4 text-sm text-muted-foreground">
            Сервер не вернул список товаров для этого заказа.
          </p>
        )}
      </div>
    </article>
  );
}
