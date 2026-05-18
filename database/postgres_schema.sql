-- Finly PostgreSQL schema (based on current TypeScript domain models)
-- PostgreSQL 14+

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------
-- ENUM types
-- ----------

CREATE TYPE asset_kind AS ENUM ('stock', 'fund');
CREATE TYPE trade_side AS ENUM ('buy', 'sell');
CREATE TYPE account_status AS ENUM ('active', 'inactive', 'closed');
CREATE TYPE fund_transaction_type AS ENUM ('subscribe', 'redeem', 'switch-in', 'switch-out');
CREATE TYPE dividend_mode AS ENUM (
  'accumulation',
  'cash',
  'cash-monthly',
  'cash-quarterly',
  'cash-semiannual',
  'cash-annual',
  'cash-irregular',
  'reinvest'
);
CREATE TYPE cash_movement_direction AS ENUM ('in', 'out');
CREATE TYPE cash_movement_method AS ENUM (
  'transfer-in',
  'transfer-out',
  'stock-buy-settlement',
  'stock-sell-settlement',
  'fund-subscribe-settlement',
  'fund-redeem-settlement',
  'fund-switch-in-settlement',
  'fund-switch-out-settlement',
  'fee',
  'tax',
  'dividend',
  'interest',
  'fx-exchange'
);
CREATE TYPE auth_provider AS ENUM ('LINE');

-- ------------------
-- Common timestamp trigger
-- ------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION set_updated_at() IS '統一更新各資料表的 updated_at 欄位';

-- ------------------
-- Core account tables
-- ------------------

CREATE TABLE users (
  uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL,
  email VARCHAR(320),
  avatar_url TEXT,
  provider auth_provider NOT NULL DEFAULT 'LINE',
  provider_user_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE users IS '登入使用者主檔';
COMMENT ON COLUMN users.uid IS '使用者唯一識別碼（UUID）';
COMMENT ON COLUMN users.username IS '使用者名稱（必填）';
COMMENT ON COLUMN users.email IS '使用者 Email（可空）';
COMMENT ON COLUMN users.avatar_url IS '使用者頭像連結（可空）';
COMMENT ON COLUMN users.provider IS '登入供應商，目前支援 LINE';
COMMENT ON COLUMN users.provider_user_id IS '第三方登入供應商的使用者識別碼（可空）';
COMMENT ON COLUMN users.created_at IS '建立時間';

CREATE TABLE auth_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_hash CHAR(64) NOT NULL UNIQUE,
  user_uid UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  target_origin TEXT NOT NULL,
  return_to TEXT NOT NULL DEFAULT '/',
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE auth_tickets IS '跨 preview 網域登入 handoff 的短效一次性票券';
COMMENT ON COLUMN auth_tickets.id IS '票券資料列唯一識別碼';
COMMENT ON COLUMN auth_tickets.ticket_hash IS '一次性 raw ticket 的 SHA-256 hash';
COMMENT ON COLUMN auth_tickets.user_uid IS '票券對應的登入使用者 UID';
COMMENT ON COLUMN auth_tickets.target_origin IS '允許消費票券的目標 origin';
COMMENT ON COLUMN auth_tickets.return_to IS '票券消費成功後導回的站內路徑';
COMMENT ON COLUMN auth_tickets.expires_at IS '票券過期時間';
COMMENT ON COLUMN auth_tickets.consumed_at IS '票券消費時間，空值代表尚未使用';
COMMENT ON COLUMN auth_tickets.created_at IS '建立時間';

CREATE TABLE brokerage_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  broker_name VARCHAR(100) NOT NULL,
  account_no VARCHAR(64),
  account_name VARCHAR(100) NOT NULL,
  base_currency VARCHAR(3),
  status account_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    base_currency IS NULL
    OR base_currency ~ '^[A-Z]{3}$'
  )
);

COMMENT ON TABLE brokerage_accounts IS '證券戶主檔';
COMMENT ON COLUMN brokerage_accounts.id IS '證券戶唯一識別碼';
COMMENT ON COLUMN brokerage_accounts.user_uid IS '所屬使用者 UID';
COMMENT ON COLUMN brokerage_accounts.broker_name IS '證券商名稱，例如永豐、富邦';
COMMENT ON COLUMN brokerage_accounts.account_no IS '證券戶號碼，可存遮罩或原始值（非必填）';
COMMENT ON COLUMN brokerage_accounts.account_name IS '使用者自訂顯示名稱（必填）';
COMMENT ON COLUMN brokerage_accounts.base_currency IS '基準幣別（ISO 4217，可空）';
COMMENT ON COLUMN brokerage_accounts.status IS '帳戶狀態：active/inactive/closed';
COMMENT ON COLUMN brokerage_accounts.created_at IS '建立時間';
COMMENT ON COLUMN brokerage_accounts.updated_at IS '最後更新時間';

CREATE TRIGGER trg_brokerage_accounts_updated_at
BEFORE UPDATE ON brokerage_accounts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE securities_cash_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  brokerage_account_id UUID NOT NULL REFERENCES brokerage_accounts(id) ON DELETE CASCADE,
  currency VARCHAR(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  account_name VARCHAR(100),
  status account_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (brokerage_account_id, currency)
);

COMMENT ON TABLE securities_cash_accounts IS '證券戶下的資金帳戶';
COMMENT ON COLUMN securities_cash_accounts.id IS '資金帳戶唯一識別碼';
COMMENT ON COLUMN securities_cash_accounts.user_uid IS '所屬使用者 UID';
COMMENT ON COLUMN securities_cash_accounts.brokerage_account_id IS '所屬證券戶 ID';
COMMENT ON COLUMN securities_cash_accounts.currency IS '資金幣別（ISO 4217）';
COMMENT ON COLUMN securities_cash_accounts.account_name IS '帳戶顯示名稱';
COMMENT ON COLUMN securities_cash_accounts.status IS '帳戶狀態：active/inactive/closed';
COMMENT ON COLUMN securities_cash_accounts.created_at IS '建立時間';
COMMENT ON COLUMN securities_cash_accounts.updated_at IS '最後更新時間';

CREATE TRIGGER trg_securities_cash_accounts_updated_at
BEFORE UPDATE ON securities_cash_accounts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------
-- Transaction tables
-- ------------------

CREATE TABLE stock_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES brokerage_accounts(id) ON DELETE CASCADE,
  trade_date TIMESTAMPTZ NOT NULL,
  side trade_side NOT NULL,
  symbol VARCHAR(32) NOT NULL,
  market VARCHAR(32),
  quantity NUMERIC(20, 6) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(20, 6) NOT NULL CHECK (unit_price >= 0),
  gross_amount NUMERIC(20, 6) NOT NULL CHECK (gross_amount >= 0),
  fee NUMERIC(20, 6) CHECK (fee >= 0),
  tax NUMERIC(20, 6) CHECK (tax >= 0),
  net_amount NUMERIC(20, 6) NOT NULL,
  currency VARCHAR(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE stock_transactions IS '股票交易主表（對應 StockTransaction）';
COMMENT ON COLUMN stock_transactions.id IS '交易唯一識別碼';
COMMENT ON COLUMN stock_transactions.user_uid IS '所屬使用者 UID';
COMMENT ON COLUMN stock_transactions.account_id IS '所屬證券戶 ID';
COMMENT ON COLUMN stock_transactions.trade_date IS '交易時間';
COMMENT ON COLUMN stock_transactions.side IS '交易方向：buy/sell';
COMMENT ON COLUMN stock_transactions.symbol IS '股票代號';
COMMENT ON COLUMN stock_transactions.market IS '股票市場（例如 TWSE/NASDAQ）';
COMMENT ON COLUMN stock_transactions.quantity IS '交易數量（股數）';
COMMENT ON COLUMN stock_transactions.unit_price IS '每股成交價';
COMMENT ON COLUMN stock_transactions.gross_amount IS '原始成交金額（未扣費用/稅）';
COMMENT ON COLUMN stock_transactions.fee IS '手續費';
COMMENT ON COLUMN stock_transactions.tax IS '稅額';
COMMENT ON COLUMN stock_transactions.net_amount IS '實際扣款或入帳金額';
COMMENT ON COLUMN stock_transactions.currency IS '交易幣別（ISO 4217）';
COMMENT ON COLUMN stock_transactions.note IS '備註';
COMMENT ON COLUMN stock_transactions.created_at IS '建立時間';
COMMENT ON COLUMN stock_transactions.updated_at IS '最後更新時間';

CREATE TRIGGER trg_stock_transactions_updated_at
BEFORE UPDATE ON stock_transactions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE fund_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES brokerage_accounts(id) ON DELETE CASCADE,
  trade_date TIMESTAMPTZ NOT NULL,
  side trade_side NOT NULL,
  fund_code VARCHAR(64) NOT NULL,
  nav_date TIMESTAMPTZ,
  transaction_type fund_transaction_type,
  dividend_mode dividend_mode,
  quantity NUMERIC(20, 6) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(20, 6) NOT NULL CHECK (unit_price >= 0),
  gross_amount NUMERIC(20, 6) NOT NULL CHECK (gross_amount >= 0),
  fee NUMERIC(20, 6) CHECK (fee >= 0),
  tax NUMERIC(20, 6) CHECK (tax >= 0),
  net_amount NUMERIC(20, 6) NOT NULL,
  currency VARCHAR(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE fund_transactions IS '基金交易主表（對應 FundTransaction）';
COMMENT ON COLUMN fund_transactions.id IS '交易唯一識別碼';
COMMENT ON COLUMN fund_transactions.user_uid IS '所屬使用者 UID';
COMMENT ON COLUMN fund_transactions.account_id IS '所屬證券戶 ID';
COMMENT ON COLUMN fund_transactions.trade_date IS '交易時間';
COMMENT ON COLUMN fund_transactions.side IS '交易方向：buy/sell';
COMMENT ON COLUMN fund_transactions.fund_code IS '基金代碼';
COMMENT ON COLUMN fund_transactions.nav_date IS '基金淨值日';
COMMENT ON COLUMN fund_transactions.transaction_type IS '基金交易類型：subscribe/redeem/switch-in/switch-out';
COMMENT ON COLUMN fund_transactions.dividend_mode IS '基金配息方式：accumulation/cash/cash-monthly/cash-quarterly/cash-semiannual/cash-annual/cash-irregular/reinvest';
COMMENT ON COLUMN fund_transactions.quantity IS '交易數量（基金單位數）';
COMMENT ON COLUMN fund_transactions.unit_price IS '每單位價格';
COMMENT ON COLUMN fund_transactions.gross_amount IS '原始成交金額（未扣費用/稅）';
COMMENT ON COLUMN fund_transactions.fee IS '手續費';
COMMENT ON COLUMN fund_transactions.tax IS '稅額';
COMMENT ON COLUMN fund_transactions.net_amount IS '實際扣款或入帳金額';
COMMENT ON COLUMN fund_transactions.currency IS '交易幣別（ISO 4217）';
COMMENT ON COLUMN fund_transactions.note IS '備註';
COMMENT ON COLUMN fund_transactions.created_at IS '建立時間';
COMMENT ON COLUMN fund_transactions.updated_at IS '最後更新時間';

CREATE TRIGGER trg_fund_transactions_updated_at
BEFORE UPDATE ON fund_transactions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------
-- Cash ledger movements
-- ------------------

CREATE TABLE cash_account_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  brokerage_account_id UUID NOT NULL REFERENCES brokerage_accounts(id) ON DELETE CASCADE,
  cash_account_id UUID NOT NULL REFERENCES securities_cash_accounts(id) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ NOT NULL,
  direction cash_movement_direction NOT NULL,
  method cash_movement_method NOT NULL,
  amount NUMERIC(20, 6) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  balance_after NUMERIC(20, 6),
  related_asset_type asset_kind,
  stock_transaction_id UUID REFERENCES stock_transactions(id) ON DELETE SET NULL,
  fund_transaction_id UUID REFERENCES fund_transactions(id) ON DELETE SET NULL,
  related_asset_code VARCHAR(64),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (
    (stock_transaction_id IS NULL AND fund_transaction_id IS NULL)
    OR (stock_transaction_id IS NOT NULL AND fund_transaction_id IS NULL AND related_asset_type = 'stock')
    OR (stock_transaction_id IS NULL AND fund_transaction_id IS NOT NULL AND related_asset_type = 'fund')
  )
);

COMMENT ON TABLE cash_account_movements IS '資金異動流水帳（對應 CashAccountMovement）';
COMMENT ON COLUMN cash_account_movements.id IS '資金異動唯一識別碼';
COMMENT ON COLUMN cash_account_movements.user_uid IS '所屬使用者 UID';
COMMENT ON COLUMN cash_account_movements.brokerage_account_id IS '所屬證券戶 ID';
COMMENT ON COLUMN cash_account_movements.cash_account_id IS '所屬資金帳戶 ID';
COMMENT ON COLUMN cash_account_movements.occurred_at IS '異動發生時間';
COMMENT ON COLUMN cash_account_movements.direction IS '異動方向：in/out';
COMMENT ON COLUMN cash_account_movements.method IS '異動方式（轉入、交割、費用、配息等）';
COMMENT ON COLUMN cash_account_movements.amount IS '異動金額，固定正數';
COMMENT ON COLUMN cash_account_movements.currency IS '異動幣別（ISO 4217）';
COMMENT ON COLUMN cash_account_movements.balance_after IS '異動後餘額';
COMMENT ON COLUMN cash_account_movements.related_asset_type IS '關聯資產類型：stock/fund';
COMMENT ON COLUMN cash_account_movements.stock_transaction_id IS '關聯股票交易 ID（對應 stock_transactions.id）';
COMMENT ON COLUMN cash_account_movements.fund_transaction_id IS '關聯基金交易 ID（對應 fund_transactions.id）';
COMMENT ON COLUMN cash_account_movements.related_asset_code IS '關聯標的代號（股票 symbol 或基金 fund_code）';
COMMENT ON COLUMN cash_account_movements.note IS '備註';
COMMENT ON COLUMN cash_account_movements.created_at IS '建立時間';
COMMENT ON COLUMN cash_account_movements.updated_at IS '最後更新時間';

CREATE TRIGGER trg_cash_account_movements_updated_at
BEFORE UPDATE ON cash_account_movements
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ----------
-- Indexes
-- ----------

-- Accounts and cash accounts
CREATE UNIQUE INDEX uq_brokerage_accounts_user_broker_account_no_not_null
  ON brokerage_accounts (user_uid, broker_name, account_no)
  WHERE account_no IS NOT NULL;
COMMENT ON INDEX uq_brokerage_accounts_user_broker_account_no_not_null IS '僅在戶號有值時，限制同使用者同券商下戶號不可重複';

ALTER TABLE users
  ADD CONSTRAINT users_provider_provider_user_id_key
  UNIQUE (provider, provider_user_id);
COMMENT ON CONSTRAINT users_provider_provider_user_id_key ON users IS '限制同登入供應商下的 provider_user_id 不可重複';

CREATE INDEX idx_auth_tickets_expires_at
  ON auth_tickets (expires_at);
COMMENT ON INDEX idx_auth_tickets_expires_at IS '加速清理過期 auth handoff 票券';

CREATE INDEX idx_auth_tickets_user_uid
  ON auth_tickets (user_uid);
COMMENT ON INDEX idx_auth_tickets_user_uid IS '加速依使用者查詢 auth handoff 票券';

CREATE INDEX idx_brokerage_accounts_user_uid
  ON brokerage_accounts (user_uid);
COMMENT ON INDEX idx_brokerage_accounts_user_uid IS '加速依使用者查詢證券戶';

CREATE INDEX idx_cash_accounts_brokerage_account_id
  ON securities_cash_accounts (brokerage_account_id);
COMMENT ON INDEX idx_cash_accounts_brokerage_account_id IS '加速依證券戶查詢資金帳戶';

CREATE INDEX idx_cash_accounts_user_uid
  ON securities_cash_accounts (user_uid);
COMMENT ON INDEX idx_cash_accounts_user_uid IS '加速依使用者查詢資金帳戶';

-- Transaction query patterns (current UI: by account / symbol / side / trade date)
CREATE INDEX idx_stock_transactions_account_trade_date
  ON stock_transactions (account_id, trade_date DESC);
COMMENT ON INDEX idx_stock_transactions_account_trade_date IS '加速依帳戶查股票交易並按交易日排序';

CREATE INDEX idx_stock_transactions_user_trade_date
  ON stock_transactions (user_uid, trade_date DESC);
COMMENT ON INDEX idx_stock_transactions_user_trade_date IS '加速依使用者查股票交易並按交易日排序';

CREATE INDEX idx_stock_transactions_side_trade_date
  ON stock_transactions (side, trade_date DESC);
COMMENT ON INDEX idx_stock_transactions_side_trade_date IS '加速依買賣方向篩選股票交易';

CREATE INDEX idx_stock_transactions_symbol_trade_date
  ON stock_transactions (symbol, trade_date DESC);
COMMENT ON INDEX idx_stock_transactions_symbol_trade_date IS '加速股票代號查詢';

CREATE INDEX idx_fund_transactions_account_trade_date
  ON fund_transactions (account_id, trade_date DESC);
COMMENT ON INDEX idx_fund_transactions_account_trade_date IS '加速依帳戶查基金交易並按交易日排序';

CREATE INDEX idx_fund_transactions_user_trade_date
  ON fund_transactions (user_uid, trade_date DESC);
COMMENT ON INDEX idx_fund_transactions_user_trade_date IS '加速依使用者查基金交易並按交易日排序';

CREATE INDEX idx_fund_transactions_side_trade_date
  ON fund_transactions (side, trade_date DESC);
COMMENT ON INDEX idx_fund_transactions_side_trade_date IS '加速依買賣方向篩選基金交易';

CREATE INDEX idx_fund_transactions_fund_code_trade_date
  ON fund_transactions (fund_code, trade_date DESC);
COMMENT ON INDEX idx_fund_transactions_fund_code_trade_date IS '加速基金代碼查詢';

-- Cash movement query patterns
CREATE INDEX idx_cash_movements_cash_account_occurred_at
  ON cash_account_movements (cash_account_id, occurred_at DESC);
COMMENT ON INDEX idx_cash_movements_cash_account_occurred_at IS '加速依資金帳戶查詢流水帳並按時間排序';

CREATE INDEX idx_cash_movements_brokerage_occurred_at
  ON cash_account_movements (brokerage_account_id, occurred_at DESC);
COMMENT ON INDEX idx_cash_movements_brokerage_occurred_at IS '加速依證券戶查詢資金異動';

CREATE INDEX idx_cash_movements_user_occurred_at
  ON cash_account_movements (user_uid, occurred_at DESC);
COMMENT ON INDEX idx_cash_movements_user_occurred_at IS '加速依使用者查詢資金異動';

CREATE INDEX idx_cash_movements_stock_transaction_id
  ON cash_account_movements (stock_transaction_id)
  WHERE stock_transaction_id IS NOT NULL;
COMMENT ON INDEX idx_cash_movements_stock_transaction_id IS '加速股票交易與資金異動的關聯查詢';

CREATE INDEX idx_cash_movements_fund_transaction_id
  ON cash_account_movements (fund_transaction_id)
  WHERE fund_transaction_id IS NOT NULL;
COMMENT ON INDEX idx_cash_movements_fund_transaction_id IS '加速基金交易與資金異動的關聯查詢';

COMMIT;
