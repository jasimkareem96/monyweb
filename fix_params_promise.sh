#!/bin/bash
# Script to fix all params Promise issues in Next.js 14 App Router

# Files that need fixing
files=(
  "app/api/admin/disputes/[id]/resolve/route.ts"
  "app/api/admin/verifications/[id]/reject/route.ts"
  "app/api/admin/verifications/[id]/approve/route.ts"
  "app/api/orders/[id]/upload-payment-proof/route.ts"
  "app/api/orders/[id]/upload-delivery-proof/route.ts"
  "app/api/orders/[id]/confirm-received/route.ts"
  "app/api/orders/[id]/dispute/route.ts"
  "app/api/orders/[id]/start-processing/route.ts"
  "app/api/admin/users/[id]/unblock/route.ts"
  "app/api/admin/users/[id]/block/route.ts"
  "app/api/orders/[id]/cancel/route.ts"
  "app/api/orders/[id]/confirm/route.ts"
  "app/api/orders/[id]/rate/route.ts"
  "app/api/notifications/[id]/read/route.ts"
  "app/api/offers/[id]/toggle/route.ts"
  "app/api/admin/offers/[id]/toggle/route.ts"
  "app/api/admin/users/[id]/verify/route.ts"
)

echo "Files to fix: ${#files[@]}"
