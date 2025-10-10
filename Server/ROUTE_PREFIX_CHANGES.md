# Route Prefix Changes

## Summary
Removed `/api` prefix from individual route files and consolidated all routes under `/api` in main index.js.

## Changes Made

### Before
Routes were mounted with full path in `index.js`:
```javascript
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
// etc...
```

Route files defined paths without prefix:
```javascript
router.post('/register', register);  // Full path: /api/auth/register
```

Swagger docs included full path:
```javascript
/**
 * @swagger
 * /api/auth/register:
 */
```

### After
All routes mounted under `/api` in `index.js`:
```javascript
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', productRoutes);
// etc...
```

Route files define paths WITH their prefix:
```javascript
router.post('/auth/register', register);  // Full path: /api/auth/register
```

Swagger docs WITHOUT `/api` prefix (Swagger base URL is `/api`):
```javascript
/**
 * @swagger
 * /auth/register:
 */
```

## Updated Files

### index.js
- Changed all `app.use('/api/xxx', ...)` to `app.use('/api', ...)`

### Route Files
All route files updated to include their prefix in path definitions:

1. **authRoutes.js** - Prefix: `/auth/`
   - `/auth/register`
   - `/auth/login`
   - `/auth/logout`
   - `/auth/refresh-token`

2. **userRoutes.js** - Prefix: `/users/`
   - `/users/register`
   - `/users/login`
   - `/users/list`
   - `/users/:id`

3. **adminRoutes.js** - Prefix: `/admin/`
   - All admin routes now start with `/admin/`

4. **productRoutes.js** - Prefix: `/products/`
   - All product routes now start with `/products/`

5. **shippingRoutes.js** - Prefix: `/shipping/`
   - All shipping routes now start with `/shipping/`

6. **chatRoutes.js** - Prefix: `/chat/`
   - All chat routes now start with `/chat/`

7. **zalopayRoutes.js** - Prefix: `/zalopay/`
   - All zalopay routes now start with `/zalopay/`

8. **contractRoutes.js** - Prefix: `/contracts/`
   - All contract routes now start with `/contracts/`

9. **depositRoutes.js** - Prefix: `/deposit/`
   - `/deposit/vehicle`
   - `/deposit/:orderId/confirm`
   - `/deposit/:orderId/cancel`

10. **profileRoutes.js** - Prefix: `/profile/`
    - All profile routes now start with `/profile/`

## Benefits

1. **Cleaner Swagger documentation** - Base URL is set to `/api`, so all paths in Swagger UI automatically show under `/api`
2. **Consistent structure** - All routes follow same pattern
3. **Easier maintenance** - Route prefixes are explicit in route files
4. **Better organization** - Clear separation of concerns

## Testing

All existing endpoints still work with same URLs:
- `POST /api/auth/register` ✓
- `GET /api/products` ✓
- `POST /api/deposit/vehicle` ✓
- `GET /api/admin/stats` ✓
- etc.

The change is transparent to API consumers - all URLs remain the same.

