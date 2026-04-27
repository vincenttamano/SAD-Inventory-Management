# DENTAL CLINIC INVENTORY MANAGEMENT SYSTEM

## TABLE DOCUMENTATION

**Generated:** 2026-04-27  
**Database:** Supabase (PostgreSQL)  
**System:** Dental Clinic IMS

---

## TABLE OF CONTENTS

1. [User](#user-table)
2. [Inventory](#inventory-table)
3. [Patient](#patient-table)
4. [Usage](#usage-table)
5. [Transaction](#transaction-table)
6. [StockAlerts](#stockalerts-table)

---

## USER TABLE

**Purpose:** Stores clinic staff credentials and roles. Serves as the authentication source for the application.

**Primary Key:** `user_id` (BIGINT, auto-generated)

**Columns:**

| Column     | Type   | Constraints                 | Description                                                               |
| ---------- | ------ | --------------------------- | ------------------------------------------------------------------------- |
| `user_id`  | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for each user                                           |
| `email`    | TEXT   | NOT NULL                    | Staff email address; used for login                                       |
| `username` | TEXT   |                             | Alternate login identifier                                                |
| `role`     | TEXT   |                             | User role: `admin`, `staff`, or `manager`                                 |
| `password` | TEXT   |                             | Plaintext password (⚠️ **SECURITY NOTE:** Should be hashed in production) |

**Key Relationships:**

- Referenced by: `Inventory.restockedBy`
- Referenced by: `Patient.recordedBy`
- Referenced by: `Usage.recordedBy`
- Referenced by: `Transaction.performed_by`

**Authentication Flow:**

- Login accepts either `email` OR `username`
- Password is verified against plaintext value (direct comparison)
- ⚠️ **TODO:** Implement password hashing (bcrypt or similar) before production

**RLS Status:** Public read access enabled for development (login functionality)

---

## INVENTORY TABLE

**Purpose:** Tracks all dental supplies, materials, and equipment. Central to stock management, reordering, and expiration tracking.

**Primary Key:** `item_id` (BIGINT, auto-generated)

**Columns:**

| Column            | Type                     | Constraints                 | Description                                                 |
| ----------------- | ------------------------ | --------------------------- | ----------------------------------------------------------- |
| `item_id`         | BIGINT                   | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for inventory item                        |
| `itemName`        | TEXT                     |                             | Name/description of the item                                |
| `quantity`        | BIGINT                   |                             | Current stock level (validated ≥ 0 by trigger)              |
| `unitType`        | TEXT                     |                             | Unit of measurement: `unit`, `pack`, `box`, `ml`, `g`, etc. |
| `price`           | DOUBLE PRECISION         |                             | Cost per unit (used in analytics)                           |
| `expirationDate`  | DATE                     |                             | Expiration date for perishable items                        |
| `lowStockWarning` | BIGINT                   |                             | Threshold for stock alerts                                  |
| `dateCreated`     | TIMESTAMP WITH TIME ZONE | DEFAULT now()               | Timestamp of record creation                                |
| `restockedBy`     | BIGINT                   | FK → User.user_id           | User who last restocked the item                            |
| `lastRestocked`   | TIMESTAMP WITH TIME ZONE |                             | Timestamp of most recent restock                            |

**Key Relationships:**

- Foreign Key: `restockedBy` → `User.user_id` (tracks who restocked)
- Referenced by: `Usage.itemUsage`
- Referenced by: `Transaction.item_id`
- Referenced by: `StockAlerts.item_id`

**Database Triggers:**

1. **prevent_negative_quantity** (BEFORE UPDATE)
   - Blocks quantity updates that would go below 0
   - Raises exception: "Stock cannot go below 0"

2. **log_inventory_transaction** (AFTER UPDATE OF quantity)
   - Auto-logs restock and adjustment transactions
   - Types: `restock` (increase) or `adjustment` (decrease)

3. **log_low_stock** (AFTER UPDATE)
   - Inserts into `StockAlerts` when quantity ≤ `lowStockWarning`
   - Only fires on threshold crossing (not on every update)

4. **log_inventory_deletion** (BEFORE DELETE)
   - Logs `expired_removal` transaction before item is deleted
   - Captures remaining quantity at deletion

**Workflow Example:**

```
Admin adds 50 units of "Composite Resin"
  → trigger: log_inventory_transaction
  → Transaction record created: type='restock', qty_change=+50

Quantity drops to 5 (below warning threshold of 10)
  → trigger: log_low_stock
  → StockAlerts record created: item_id=X, current_qty=5, threshold=10

Item expires, admin deletes it
  → trigger: log_inventory_deletion (fires BEFORE delete)
  → Transaction record created: type='expired_removal', qty_change=-5
```

---

## PATIENT TABLE

**Purpose:** Records patient treatment information and consent. Links usage records to specific patient encounters.

**Primary Key:** `patient_id` (BIGINT, auto-generated)

**Columns:**

| Column           | Type    | Constraints                 | Description                          |
| ---------------- | ------- | --------------------------- | ------------------------------------ |
| `patient_id`     | BIGINT  | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for patient record |
| `date`           | DATE    | NOT NULL                    | Date of treatment/procedure          |
| `procedure`      | TEXT    |                             | Type of procedure performed          |
| `patientName`    | TEXT    |                             | Patient's name (for record tracking) |
| `patientConsent` | BOOLEAN |                             | Consent flag for treatment           |
| `recordedBy`     | BIGINT  | FK → User.user_id           | User who recorded this patient visit |

**Key Relationships:**

- Foreign Key: `recordedBy` → `User.user_id` (staff who recorded visit)
- Referenced by: `Usage.patientUsage` (supplies used in this patient's treatment)

**Business Logic:**

- One patient record = one visit/treatment session
- Links supply usage to specific patient encounters
- Supports compliance tracking via `patientConsent` field

**Example:**

```
Patient: John Doe
Date: 2026-04-27
Procedure: Root Canal
recordedBy: user_id 2 (Dr. Smith)
patientConsent: true
  → Later, Usage records reference this patient_id
     (dentist used 2x Composite Resin, 1x Anesthetic, etc.)
```

---

## USAGE TABLE

**Purpose:** Records consumption/usage of inventory items for specific patient treatments. Central to cost tracking and supply depletion.

**Primary Key:** `usage_id` (BIGINT, auto-generated)

**Columns:**

| Column          | Type                     | Constraints                      | Description                                   |
| --------------- | ------------------------ | -------------------------------- | --------------------------------------------- |
| `usage_id`      | BIGINT                   | PRIMARY KEY, AUTO_INCREMENT      | Unique identifier for usage record            |
| `itemUsage`     | BIGINT                   | NOT NULL, FK → Inventory.item_id | Which inventory item was used                 |
| `patientUsage`  | BIGINT                   | FK → Patient.patient_id          | Which patient this was used for               |
| `quantityUsed`  | BIGINT                   |                                  | Amount consumed                               |
| `unit`          | TEXT                     |                                  | Unit of measurement (e.g., `ml`, `unit`, `g`) |
| `productName`   | TEXT                     |                                  | Name of the product used                      |
| `pricePerUsage` | DOUBLE PRECISION         |                                  | Cost per unit at time of usage                |
| `usageDate`     | TIMESTAMP WITH TIME ZONE | DEFAULT now()                    | When the item was used                        |
| `recordedBy`    | BIGINT                   | FK → User.user_id                | Staff member who recorded usage               |

**Key Relationships:**

- Foreign Key: `itemUsage` → `Inventory.item_id` (which item was used)
- Foreign Key: `patientUsage` → `Patient.patient_id` (which patient)
- Foreign Key: `recordedBy` → `User.user_id` (who recorded it)
- Referenced by: `Transaction.usage_id` (consumption transactions)

**Database Triggers:**

1. **check_stock_availability** (BEFORE INSERT)
   - Validates requested `quantityUsed` ≤ available `Inventory.quantity`
   - Raises exception if insufficient stock
   - Prevents overselling/negative inventory

2. **fill_usage_details** (BEFORE INSERT)
   - Auto-populates `unit` and `productName` from Inventory record
   - Auto-copies `price` to `pricePerUsage` at time of usage
   - Reduces data duplication

3. **deduct_inventory** (AFTER INSERT)
   - Automatically decrements `Inventory.quantity` by `quantityUsed`
   - Happens after usage is recorded (ensures transaction log is complete)

4. **log_usage_transaction** (AFTER INSERT)
   - Inserts `consumption` transaction into Transaction table
   - Captures quantity change, before/after amounts, and cost

**Workflow Example:**

```
Dentist records usage for patient treatment:
  INSERT INTO Usage (itemUsage=5, patientUsage=3, quantityUsed=2, ...)

  → trigger: check_stock_availability
     (validates Inventory.item_id=5 has ≥2 units available)

  → trigger: fill_usage_details
     (auto-fills unit='ml', productName='Composite Resin', pricePerUsage=45.00)

  → trigger: deduct_inventory
     (UPDATE Inventory SET quantity = quantity - 2 WHERE item_id=5)

  → trigger: log_usage_transaction
     (INSERT Transaction: type='consumption', item_id=5, quantity_change=-2)
```

---

## TRANSACTION TABLE

**Purpose:** Audit log for all inventory movements. Immutable record of every quantity change (restock, usage, adjustment, expiration).

**Primary Key:** `transaction_id` (BIGINT, auto-generated)

**Columns:**

| Column             | Type                     | Constraints                                                          | Description                                      |
| ------------------ | ------------------------ | -------------------------------------------------------------------- | ------------------------------------------------ |
| `transaction_id`   | BIGINT                   | PRIMARY KEY, AUTO_INCREMENT                                          | Unique transaction identifier                    |
| `transaction_type` | TEXT                     | CHECK IN ['restock', 'consumption', 'adjustment', 'expired_removal'] | Type of movement                                 |
| `item_id`          | BIGINT                   | FK → Inventory.item_id                                               | Which inventory item                             |
| `usage_id`         | BIGINT                   | FK → Usage.usage_id                                                  | Usage record (if applicable)                     |
| `performed_by`     | BIGINT                   | FK → User.user_id                                                    | Staff who performed action                       |
| `quantity_change`  | INTEGER                  | NOT NULL                                                             | Change amount (positive = gain, negative = loss) |
| `quantity_before`  | INTEGER                  | NOT NULL                                                             | Stock level before this transaction              |
| `quantity_after`   | INTEGER                  | NOT NULL                                                             | Stock level after this transaction               |
| `notes`            | TEXT                     |                                                                      | Additional context/reason                        |
| `created_at`       | TIMESTAMP WITH TIME ZONE | DEFAULT now()                                                        | When transaction occurred                        |

**Transaction Types:**

| Type              | Trigger Source   | Meaning                         |
| ----------------- | ---------------- | ------------------------------- |
| `restock`         | Inventory UPDATE | Manual addition of stock        |
| `consumption`     | Usage INSERT     | Item used for patient treatment |
| `adjustment`      | Inventory UPDATE | Manual quantity correction      |
| `expired_removal` | Inventory DELETE | Item deleted due to expiration  |

**Key Relationships:**

- Foreign Key: `item_id` → `Inventory.item_id`
- Foreign Key: `usage_id` → `Usage.usage_id` (only for consumption)
- Foreign Key: `performed_by` → `User.user_id`

**Immutability:**

- Records are **auto-generated by triggers** (not inserted manually)
- Never updated or deleted (provides audit trail)
- Always contains before/after quantities for verification

**Analytics Examples:**

```sql
-- Total consumption this month
SELECT SUM(quantity_change) FROM Transaction
WHERE transaction_type = 'consumption'
AND created_at >= '2026-04-01';

-- Restock frequency for item
SELECT COUNT(*) FROM Transaction
WHERE transaction_type = 'restock' AND item_id = 5;

-- Track who uses most supplies
SELECT performed_by, COUNT(*) FROM Transaction
WHERE transaction_type = 'consumption'
GROUP BY performed_by ORDER BY COUNT DESC;
```

---

## STOCKALERTS TABLE

**Purpose:** Alert registry for items falling below stock thresholds. Tracks when alerts are triggered for inventory management attention.

**Primary Key:** `alert_id` (BIGINT, auto-generated)

**Columns:**

| Column                | Type                     | Constraints                 | Description                              |
| --------------------- | ------------------------ | --------------------------- | ---------------------------------------- |
| `alert_id`            | BIGINT                   | PRIMARY KEY, AUTO_INCREMENT | Unique alert identifier                  |
| `item_id`             | BIGINT                   | FK → Inventory.item_id      | Which item triggered alert               |
| `itemName`            | TEXT                     |                             | Item name (denormalized for readability) |
| `current_quantity`    | INTEGER                  |                             | Stock level when alert triggered         |
| `low_stock_threshold` | INTEGER                  |                             | Threshold defined in Inventory           |
| `alerted_at`          | TIMESTAMP WITH TIME ZONE | DEFAULT now()               | When alert was created                   |

**Key Relationships:**

- Foreign Key: `item_id` → `Inventory.item_id`

**Generation Logic:**

- Auto-created by `log_low_stock` trigger on Inventory
- Fires when: `NEW.quantity ≤ lowStockWarning AND OLD.quantity > lowStockWarning`
- Only fires on **threshold crossing** (not on every update below threshold)
- Prevents duplicate alerts for same item

**Example Scenario:**

```
Inventory Item: Composite Resin
  lowStockWarning: 10 units
  Current quantity: 15 units

Usage: 8 units consumed
  → New quantity: 7 units (7 ≤ 10 AND 15 > 10)
  → StockAlerts record created:
     item_id=5, itemName='Composite Resin',
     current_qty=7, threshold=10, alerted_at=NOW()

Usage: 2 more units consumed
  → New quantity: 5 units
  → NO new alert (already below threshold)

Restock: +20 units added
  → New quantity: 25 units
  → No alert (threshold no longer crossed)
```

**Dashboard Use:**

- Display all active alerts (current_quantity ≤ threshold)
- Prioritize reordering based on alert timestamp
- Track alert frequency to adjust thresholds

---

## RELATIONSHIPS DIAGRAM

```
User (user_id)
  ├─ ← Inventory.restockedBy
  ├─ ← Patient.recordedBy
  ├─ ← Usage.recordedBy
  └─ ← Transaction.performed_by

Inventory (item_id)
  ├─ ← Usage.itemUsage → Patient (patient_id)
  ├─ ← Transaction.item_id
  └─ ← StockAlerts.item_id

Patient (patient_id)
  └─ ← Usage.patientUsage

Usage (usage_id)
  └─ ← Transaction.usage_id
```

---

## KEY DESIGN PRINCIPLES

1. **Audit Trail:**
   - Every inventory change logged in Transaction table
   - Cannot be deleted (immutable history)
   - Tracks who made change and when

2. **Data Integrity:**
   - Triggers enforce business rules (no negative stock, etc.)
   - Foreign keys prevent orphaned records
   - Automatic calculations (deductions, totals)

3. **Cost Tracking:**
   - `pricePerUsage` captured at time of consumption
   - Historical accuracy (price changes don't retroactively affect old records)
   - Enables accurate cost-of-goods-sold calculations

4. **Role-Based Access:**
   - User.role determines dashboard views and permissions
   - Staff: can only record usage
   - Admin: can restock, adjust, delete items

5. **Patient Privacy:**
   - Patient names tracked with usage
   - Enables compliance audits
   - `patientConsent` field for legal compliance

---

## MIGRATION NOTES

**For Production Deployment:**

1. **Password Security:**
   - Implement bcrypt hashing in User table
   - Update Login component to use hashed comparison
   - Do NOT store plaintext passwords

2. **RLS Policies:**
   - Replace public read access with authenticated-only policies
   - Implement row-level security for patient data
   - Restrict admin operations to admin users

3. **Column Constraints:**
   - Add NOT NULL to columns that should be required
   - Add UNIQUE constraint to email in User table
   - Add CHECK constraints for role values

4. **Indices:**
   - Add index on User.email and User.username (frequent login queries)
   - Add index on Usage.patientUsage (patient treatment history)
   - Add index on Transaction.created_at (audit log queries)

---

**Last Updated:** 2026-04-27  
**System Status:** Development (RLS in permissive mode, plaintext passwords)
