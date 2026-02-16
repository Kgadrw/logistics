# Application Routes

## Main Routes (App.tsx)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Redirect | Redirects to `/client/login` |
| `/client/login` | ClientLoginPage | Client login page |
| `/warehouse/login` | WarehouseLoginPage | Warehouse login page |
| `/admin/login` | AdminLoginPage | Admin login page |
| `/client/*` | ClientDashboard | Client dashboard (protected) |
| `/warehouse/*` | WarehouseDashboard | Warehouse dashboard (protected) |
| `/admin/*` | AdminDashboard | Admin dashboard (protected) |
| `*` | Redirect | Catch-all redirects to `/client/login` |

---

## Client Dashboard Routes (`/client/*`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/client` | ClientShipmentsPage | Main shipments page |
| `/client/shipment/:id` | ClientShipmentDetailPage | Shipment detail page |
| `/client/history` | ClientHistoryPage | All shipments history |
| `/client/notifications` | NotificationPanel | Notifications |
| `/client/profile` | ClientProfilePage | User profile |

**Sidebar Navigation:**
- Shipments
- History
- Notifications
- Profile

---

## Warehouse Dashboard Routes (`/warehouse/*`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/warehouse` | WarehouseHomePage | Dashboard overview |
| `/warehouse/incoming` | WarehouseIncomingPage | Incoming shipments |
| `/warehouse/outgoing` | WarehouseOutgoingPage | Outgoing shipments |
| `/warehouse/history` | WarehouseHistoryPage | Shipment history |
| `/warehouse/shipment/:id` | WarehouseShipmentDetailPage | Shipment detail page |
| `/warehouse/notifications` | NotificationPanel | Notifications |
| `/warehouse/profile` | WarehouseProfilePage | User profile |

**Sidebar Navigation:**
- Dashboard
- Incoming Shipments
- Outgoing Shipments
- History
- Notifications
- Profile

---

## Admin Dashboard Routes (`/admin/*`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin` | AdminOverviewPage | Overview dashboard |
| `/admin/shipments` | AdminShipmentsPage | All shipments |
| `/admin/shipment/:id` | AdminShipmentDetailPage | Shipment detail page |
| `/admin/pricing` | AdminPricingPage | Pricing rules |
| `/admin/warehouses` | AdminUsersPage (focus="warehouse") | Warehouse management |
| `/admin/clients` | AdminUsersPage (focus="client") | Client management |
| `/admin/settings` | AdminSettingsPage | System settings |
| `/admin/notifications` | NotificationPanel | Notifications |
| `/admin/map` | Map placeholder | Shipment map (placeholder) |
| `/admin/profile` | AdminProfilePage | Admin profile |

**Sidebar Navigation:**
- Overview
- Shipments
- Pricing
- Warehouses
- Clients
- Settings
- Notifications

---

## Route Protection

All dashboard routes are protected by `ProtectedRoute` component:
- Requires authentication
- Validates user role matches the dashboard
- Redirects to appropriate login page if not authenticated or wrong role

---

## Login Routes

Each dashboard has its own login route:
- `/client/login` - For client users
- `/warehouse/login` - For warehouse users
- `/admin/login` - For admin users

After successful login, users are redirected to their respective dashboard home page.
