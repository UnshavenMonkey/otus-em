"use client";

import {
  ClipboardList,
  ImageOff,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ButtonVariants, buttonVariants } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { AppRoutes } from "@/lib/routes";
import {
  getOrders,
  ORDER_STATUSES,
  subscribeToOrdersChange,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from "@/lib/orders";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
});

const ALL_STATUSES_FILTER = "Все";
type StatusFilter = OrderStatus | typeof ALL_STATUSES_FILTER;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>(ALL_STATUSES_FILTER);
  const totalOrders = orders.length;
  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + order.total, 0),
    [orders]
  );
  const filteredOrders = useMemo(
    () =>
      statusFilter === ALL_STATUSES_FILTER
        ? orders
        : orders.filter((order) => order.status === statusFilter),
    [orders, statusFilter]
  );

  useEffect(() => {
    function syncOrders() {
      setOrders(getOrders());
    }

    syncOrders();

    return subscribeToOrdersChange(syncOrders);
  }, []);

  function handleStatusChange(orderId: string, status: OrderStatus) {
    updateOrderStatus(orderId, status);
    setOrders(getOrders());
  }

  return (
    <main className="flex flex-1 justify-center px-6 py-10">
      <section className="w-full max-w-6xl">
        <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Покупки
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              Заказы
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              История оформленных заказов со списком товаров, суммой и текущим
              статусом.
            </p>
          </div>

          <Link
            className={buttonVariants({ variant: ButtonVariants.Outline })}
            href={AppRoutes.Home}
          >
            <ShoppingBag aria-hidden="true" />
            В каталог
          </Link>
        </div>

        {orders.length ? (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-5">
                <p className="text-sm text-muted-foreground">Всего заказов</p>
                <p className="mt-2 text-2xl font-semibold">{totalOrders}</p>
              </div>
              <div className="rounded-lg border bg-card p-5">
                <p className="text-sm text-muted-foreground">Общая стоимость</p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-end sm:justify-between">
              <label className="w-full space-y-2 sm:max-w-xs">
                <span className="text-sm font-medium">Фильтр по статусу</span>
                <select
                  className="h-10 w-full cursor-pointer rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                >
                  <option value={ALL_STATUSES_FILTER}>
                    {ALL_STATUSES_FILTER}
                  </option>
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-sm text-muted-foreground">
                Показано: {filteredOrders.length} из {totalOrders}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {filteredOrders.length ? (
                filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                  />
                ))
              ) : (
                <div className="rounded-lg border bg-card p-8 text-center">
                  <ClipboardList
                    className="mx-auto size-8 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <h2 className="mt-4 text-base font-semibold">
                    Заказов с таким статусом нет
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Выберите другой статус или покажите все заказы.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-lg border bg-card p-10 text-center">
            <ClipboardList
              className="mx-auto size-10 text-muted-foreground"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-lg font-semibold">Заказов пока нет</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Оформите корзину, и заказ появится на этой странице.
            </p>
            <Link
              className={buttonVariants({ className: "mt-5" })}
              href={AppRoutes.Cart}
            >
              <ShoppingBag aria-hidden="true" />
              Перейти в корзину
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

function OrderCard({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}) {
  return (
    <article className="rounded-lg border bg-card">
      <div className="grid gap-4 border-b p-5 md:grid-cols-[minmax(0,1fr)_220px_160px] md:items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-semibold">
            <PackageCheck className="size-5 text-muted-foreground" aria-hidden="true" />
            <span>Заказ #{order.id.slice(0, 8)}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {dateFormatter.format(new Date(order.createdAt))}
          </p>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium">Статус</span>
          <select
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={order.status}
            onChange={(event) =>
              onStatusChange(order.id, event.target.value as OrderStatus)
            }
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <div className="md:text-right">
          <p className="text-sm text-muted-foreground">
            {order.quantity} товар(ов)
          </p>
          <p className="mt-1 text-xl font-semibold">
            {formatCurrency(order.total)}
          </p>
        </div>
      </div>

      <div className="divide-y">
        {order.items.map((item) => (
          <div
            className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_110px_140px] sm:items-center"
            key={item.productId}
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
                  {item.categoryName ?? "Без категории"}
                </p>
                <h3 className="mt-1 line-clamp-2 text-sm font-medium">
                  {item.name}
                </h3>
              </div>
            </div>

            <p className="text-sm text-muted-foreground sm:text-center">
              {item.quantity} шт.
            </p>
            <p className="font-medium sm:text-right">
              {formatCurrency(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
