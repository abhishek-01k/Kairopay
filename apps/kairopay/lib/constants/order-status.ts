export const ORDER_STATUS = {
  CREATED: "created",
  PENDING: "pending",
  COMPLETED: "completed",
  VERIFIED: "verified",
  FAILED: "failed",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
