# Vehicle Deposit System

## Overview
This system handles vehicle category products differently from battery products. Vehicles require in-person meetings and use a deposit system instead of shipping.

## Key Differences

### Battery Products (Original Flow)
- Full payment through wallet
- Shipping via GHN
- Contract required
- Status: pending → confirmed → shipped → delivered

### Vehicle Products (New Flow)
- Deposit payment (500,000 VND)
- In-person meeting required
- No shipping involved
- No contract required for deposit
- Status: deposit → delivered (after admin confirms)

## Backend Implementation

### 1. Order Model Update
**File**: `src/models/Order.js`

Added new status: `"deposit"` to the enum list.

```javascript
status: { 
  type: String, 
  enum: ["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded", "deposit"], 
  default: "pending" 
}
```

### 2. Deposit Controller
**File**: `src/controllers/depositController.js`

Three main endpoints:

#### `createVehicleDeposit(req, res)`
- Validates product is category "vehicle"
- Checks wallet balance (requires 500k VND)
- Deducts deposit from buyer wallet
- Creates wallet transaction log
- Creates order with status "deposit"
- Sets product status to "inactive" (temporarily until admin confirms)

#### `confirmDepositTransaction(req, res)` - Admin only
- Verifies order is in "deposit" status
- Updates order status to "delivered"
- Marks product as "sold"
- Called after staff confirms both parties completed transaction

#### `cancelDeposit(req, res)` - Admin only
- Refunds deposit to buyer
- Updates order status to "cancelled"
- Reactivates product (status back to "active")
- Logs refund transaction

### 3. Deposit Routes
**File**: `src/routes/depositRoutes.js`

- `POST /api/deposit/vehicle` - Create deposit (authenticated user)
- `PATCH /api/deposit/:orderId/confirm` - Confirm transaction (admin only)
- `PATCH /api/deposit/:orderId/cancel` - Cancel and refund (admin only)

### 4. Updated Main Server
**File**: `src/index.js`

Added deposit routes:
```javascript
import depositRoutes from './routes/depositRoutes.js';
app.use('/api/deposit', depositRoutes);
```

## Frontend Implementation (Mobile)

### 1. ProductDetailScreen Update
**File**: `WDP301-MB/app/screens/ProductDetailScreen.tsx`

Conditional button rendering based on category:
- **Vehicle**: Shows "Đặt cọc" (Deposit) button → navigates to VehicleDepositScreen
- **Battery/Other**: Shows "Mua" (Buy) button → navigates to ConfirmOrder

```tsx
{product.category === 'vehicle' ? (
  <TouchableOpacity style={styles.depositButton} onPress={() => navigate('VehicleDeposit', { product })}>
    <Ionicons name="wallet" size={20} color="#fff" />
    <Text style={styles.depositButtonText}>Đặt cọc</Text>
  </TouchableOpacity>
) : (
  <TouchableOpacity style={styles.buyInlineButton} onPress={() => navigate('ConfirmOrder', { product })}>
    <Ionicons name="cart" size={20} color="#fff" />
    <Text style={styles.buyInlineText}>Mua</Text>
  </TouchableOpacity>
)}
```

### 2. Vehicle Deposit Screen
**File**: `WDP301-MB/app/screens/VehicleDepositScreen.tsx`

New screen for vehicle deposits:
- Shows product summary
- Displays deposit amount (500k VND)
- Shows current wallet balance
- Buyer information form (name, phone, address)
- Validates wallet balance before submission
- Creates deposit order via API

## Workflow

### Buyer Flow
1. Browse vehicle products
2. Click "Đặt cọc" on product detail
3. Fill in contact information
4. System checks wallet balance
5. Confirms deposit payment (500k VND deducted)
6. Receives confirmation message
7. Waits for admin to arrange meeting

### Admin Flow
1. Receives deposit notification
2. Contacts both buyer and seller
3. Arranges in-person meeting time/location
4. Staff supervises transaction
5. After successful completion:
   - Calls `PATCH /api/deposit/{orderId}/confirm`
   - Product marked as "sold"
   - Order status: "delivered"

### Cancellation Flow
1. If transaction falls through
2. Admin calls `PATCH /api/deposit/{orderId}/cancel`
3. Buyer receives full refund
4. Product reactivated for sale

## API Endpoints Summary

### User Endpoints
```
POST /api/deposit/vehicle
Body: {
  product_id: string,
  seller_id: string,
  buyer_name: string,
  buyer_phone: string,
  buyer_address: string
}
Response: {
  success: true,
  message: "Đặt cọc thành công...",
  data: {
    orderId, orderNumber, depositAmount, productTitle, status, note
  }
}
```

### Admin Endpoints
```
PATCH /api/deposit/:orderId/confirm
Body: { notes?: string }
Response: { success: true, message: "...", data: {...} }

PATCH /api/deposit/:orderId/cancel
Body: { reason?: string }
Response: { success: true, message: "...", data: { refundAmount, newBalance } }
```

## Database Changes

### Order Document (when deposit)
```javascript
{
  orderNumber: "DEPOSIT-{timestamp}",
  status: "deposit",
  finalAmount: 500000, // Only deposit amount
  shippingFee: 0,
  shipping: { method: "in-person" },
  payment: { method: "wallet", status: "paid" },
  notes: "Vehicle deposit order - In-person meeting required..."
}
```

### Wallet Transaction Log
```javascript
{
  userId: buyerId,
  type: "payment",
  amount: 500000,
  description: "Đặt cọc xe {productTitle}",
  reference: "DEPOSIT-{productId}",
  metadata: { productId, sellerId, depositAmount }
}
```

## Testing Checklist

- [ ] Create vehicle product
- [ ] View vehicle on mobile (shows "Đặt cọc" button)
- [ ] Click deposit with insufficient balance (shows error)
- [ ] Top up wallet
- [ ] Successfully create deposit (500k deducted)
- [ ] Check order status = "deposit"
- [ ] Check product status = "inactive"
- [ ] Admin confirms transaction
- [ ] Check order status = "delivered"
- [ ] Check product status = "sold"
- [ ] Test cancellation/refund flow

## Notes

- Deposit amount is fixed at 500,000 VND
- No contract signing required for deposit (handled offline)
- Product temporarily inactive during deposit period
- Full payment happens in-person at meeting
- System only tracks deposit, not final payment
- Admin must manually confirm or cancel within reasonable timeframe

