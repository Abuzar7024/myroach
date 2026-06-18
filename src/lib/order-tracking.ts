import type { Order, OrderStatus, OrderStatusUpdate } from "@/types";

const FLOW: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Order placed",
  confirmed: "Order confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export interface TrackingStep {
  id: string;
  label: string;
  description?: string;
  at?: string;
  completed: boolean;
  active: boolean;
}

function sortEvents(events: OrderStatusUpdate[]): OrderStatusUpdate[] {
  return [...events].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

function inferHistory(order: Order): OrderStatusUpdate[] {
  const events: OrderStatusUpdate[] = [
    {
      status: "pending",
      at: order.createdAt,
      by: "system",
      note: "We received your order.",
    },
  ];

  const idx = FLOW.indexOf(order.status);
  if (idx > 0) {
    for (let i = 1; i <= idx; i += 1) {
      const status = FLOW[i];
      events.push({
        status,
        at: order.updatedAt,
        by: "admin",
        note:
          status === "shipped" && order.trackingNumber
            ? `Tracking ID: ${order.trackingNumber}`
            : undefined,
        trackingNumber: status === "shipped" ? order.trackingNumber : undefined,
      });
    }
  }

  if (order.status === "cancelled" || order.status === "refunded") {
    events.push({
      status: order.status,
      at: order.updatedAt,
      by: "admin",
    });
  }

  return events;
}

export function getOrderTrackingEvents(order: Order): OrderStatusUpdate[] {
  if (order.statusHistory?.length) return sortEvents(order.statusHistory);
  return inferHistory(order);
}

export function buildOrderTrackingSteps(order: Order): TrackingStep[] {
  const events = getOrderTrackingEvents(order);
  const eventByStatus = new Map<OrderStatus, OrderStatusUpdate>();
  events.forEach((event) => eventByStatus.set(event.status, event));

  if (order.status === "cancelled" || order.status === "refunded") {
    const placed = eventByStatus.get("pending") ?? events[0];
    const terminal = eventByStatus.get(order.status) ?? events[events.length - 1];
    return [
      {
        id: "placed",
        label: STATUS_LABELS.pending,
        description: placed?.note ?? "Your order was received.",
        at: placed?.at,
        completed: true,
        active: false,
      },
      {
        id: order.status,
        label: STATUS_LABELS[order.status],
        description: terminal?.note ?? "Updated by MY ROACH team.",
        at: terminal?.at,
        completed: true,
        active: true,
      },
    ];
  }

  const currentIdx = FLOW.indexOf(order.status);
  return FLOW.map((status, index) => {
    const event = eventByStatus.get(status);
    const completed = currentIdx >= index && currentIdx !== -1;
    const active = order.status === status;
    let description = event?.note;
    if (status === "shipped" && order.trackingNumber) {
      description = `Tracking ID: ${order.trackingNumber}`;
    } else if (!description && completed) {
      description = "Updated from admin panel.";
    } else if (!completed) {
      description = "Waiting for update.";
    }

    return {
      id: status,
      label: STATUS_LABELS[status],
      description,
      at: event?.at,
      completed,
      active,
    };
  });
}
