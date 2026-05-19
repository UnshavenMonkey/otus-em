"use client";

import { ClipboardList, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  ALL_STATUSES_FILTER,
  ORDERS_PAGE_SIZE,
  ORDERS_SEARCH_PARAMS,
} from "@/app/orders/_components/constants";
import { OrderCard } from "@/app/orders/_components/order-card";
import type { StatusFilter } from "@/app/orders/_components/types";
import {
  getOrderStatusLabel,
  getOrderTotal,
  getStatusFilterValue,
} from "@/app/orders/_components/utils";
import { useAuth } from "@/components/auth-provider";
import { ButtonVariants, buttonVariants } from "@/components/ui/button";
import { getOrders, getRequestErrorMessage, updateOrder } from "@/lib/api";
import { ORDER_STATUSES } from "@/lib/api/constants";
import type { Order, OrderStatus } from "@/lib/api/types";
import { formatCurrency } from "@/lib/formatters";
import { AppRoutes } from "@/lib/routes";

export default function OrdersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { token, isReady } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const statusFilter = useMemo(
    () =>
      getStatusFilterValue(searchParams.get(ORDERS_SEARCH_PARAMS.Status)),
    [searchParams]
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const totalOrders = orders.length;
  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + getOrderTotal(order), 0),
    [orders]
  );
  const orderStatusOptions = useMemo(
    () =>
      Array.from(
        new Set([...ORDER_STATUSES, ...orders.map((order) => order.status)])
      ),
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
    if (!isReady) {
      return;
    }

    let isIgnored = false;

    async function loadOrders() {
      setIsLoading(true);
      setError("");

      try {
        const result = await getOrders(
          {
            status:
              statusFilter === ALL_STATUSES_FILTER
                ? undefined
                : statusFilter,
            pagination: {
              pageNumber: 1,
              pageSize: ORDERS_PAGE_SIZE,
            },
            sorting: {
              field: "createdAt",
              type: "DESC",
            },
          },
          token ?? undefined
        );

        if (!isIgnored) {
          setOrders(result.data);
        }
      } catch (caughtError) {
        if (!isIgnored) {
          setOrders([]);
          setError(
            getRequestErrorMessage(caughtError, "Не удалось загрузить заказы")
          );
        }
      } finally {
        if (!isIgnored) {
          setIsLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      isIgnored = true;
    };
  }, [isReady, statusFilter, token]);

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    if (!token) {
      setError("Нужно войти в аккаунт, чтобы изменить статус заказа.");
      return;
    }

    setError("");

    try {
      const updatedOrder = await updateOrder(token, orderId, { status });
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? updatedOrder : order
        )
      );
    } catch (caughtError) {
      setError(
        getRequestErrorMessage(caughtError, "Не удалось обновить статус заказа")
      );
    }
  }

  function handleStatusFilterChange(status: StatusFilter) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (status === ALL_STATUSES_FILTER) {
      nextSearchParams.delete(ORDERS_SEARCH_PARAMS.Status);
    } else {
      nextSearchParams.set(ORDERS_SEARCH_PARAMS.Status, status);
    }

    const query = nextSearchParams.toString();

    router.push(query ? `${pathname}?${query}` : pathname);
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

        {error ? (
          <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                className="h-32 animate-pulse rounded-lg border bg-muted"
                key={index}
              />
            ))}
          </div>
        ) : orders.length ? (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-5">
                <p className="text-sm text-muted-foreground">Всего заказов</p>
                <p className="mt-2 text-2xl font-semibold">{totalOrders}</p>
              </div>
              <div className="rounded-lg border bg-card p-5">
                <p className="text-sm text-muted-foreground">
                  Общая стоимость
                </p>
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
                    handleStatusFilterChange(event.target.value as StatusFilter)
                  }
                >
                  <option value={ALL_STATUSES_FILTER}>
                    {ALL_STATUSES_FILTER}
                  </option>
                  {orderStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {getOrderStatusLabel(status)}
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
                    statusOptions={orderStatusOptions}
                    canUpdateStatus={Boolean(token)}
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
