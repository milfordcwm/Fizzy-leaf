import {cartDiscountLines, summedDiscountMoney} from '~/lib/cartDiscounts';
import {formatMoney, priceDisplay} from '~/lib/product';

const PURCHASE_TYPES = ['onetime', 'subscribe'];

export function lineListTotal(line) {
  if (line?.cost?.subtotalAmount?.amount) return line.cost.subtotalAmount;
  const paid = line?.cost?.totalAmount;
  const saved = lineDiscountCents(line);
  if (saved > 0 && paid?.amount) {
    return {
      amount: ((moneyCents(paid) + saved) / 100).toFixed(2),
      currencyCode: paid.currencyCode,
    };
  }
  return paid;
}

export function linePaidTotal(line, cart) {
  const list = lineListTotal(line);
  if (!list?.amount) return line?.cost?.totalAmount;
  const lineSaved = lineDiscountCents(line);
  if (lineSaved > 0) {
    return {
      amount: ((moneyCents(list) - lineSaved) / 100).toFixed(2),
      currencyCode: list.currencyCode,
    };
  }
  if (!purchaseTypeGetsDiscount(cart, purchaseTypeOf(line))) {
    return line?.cost?.totalAmount ?? list;
  }
  const rate = entitledDiscountRate(cart);
  if (rate == null) return line?.cost?.totalAmount ?? list;
  return {
    amount: (Math.round(moneyCents(list) * (1 - rate)) / 100).toFixed(2),
    currencyCode: list.currencyCode,
  };
}

export function lineShowsDiscount(line, cart) {
  return moneyCents(linePaidTotal(line, cart)) < moneyCents(lineListTotal(line));
}

export function discountRatesByPurchaseType(cart) {
  const types = entitledPurchaseTypes(cart);
  const rate = entitledDiscountRate(cart);
  return {
    onetime: types.has('onetime') ? rate : null,
    subscribe: types.has('subscribe') ? rate : null,
  };
}

export function shopPriceDisplay({pack, purchaseType, prices, previewRates}) {
  const base = priceDisplay(pack, purchaseType, prices);
  const catalog = prices?.[pack]?.[purchaseType];
  const rate = previewRates?.[purchaseType];
  if (catalog == null || rate == null) return base;

  const liveAmount = catalog * (1 - rate);
  if (moneyCents({amount: liveAmount}) >= moneyCents({amount: catalog})) {
    return base;
  }

  return {
    struck: formatMoney(catalog),
    live:
      purchaseType === 'subscribe'
        ? `${formatMoney(liveAmount)} /mo`
        : formatMoney(liveAmount),
  };
}

function purchaseTypeGetsDiscount(cart, purchaseType) {
  return entitledPurchaseTypes(cart).has(purchaseType);
}

function entitledPurchaseTypes(cart) {
  const fromLines = typesWithLineDiscounts(cart);
  if (fromLines.size) return fromLines;

  const saved = cartSavedCents(cart);
  const groups = subtotalByPurchaseType(cart);
  const present = PURCHASE_TYPES.filter((type) => groups[type] > 0);
  if (saved <= 0 || present.length === 0) return new Set();
  if (present.length === 1) return new Set(present);

  const declared = declaredPercentage(cart);
  for (const combo of [
    ['onetime'],
    ['subscribe'],
    ['onetime', 'subscribe'],
  ]) {
    const sub = combo.reduce((sum, type) => sum + groups[type], 0);
    if (sub <= 0) continue;
    if (comboMatchesSaved(saved, sub, declared)) return new Set(combo);
  }
  return new Set();
}

function typesWithLineDiscounts(cart) {
  const types = new Set();
  for (const line of cart?.lines?.nodes ?? []) {
    const list = lineListTotal(line);
    const paid = line?.cost?.totalAmount;
    if (lineDiscountCents(line) > 0 || moneyCents(paid) < moneyCents(list)) {
      types.add(purchaseTypeOf(line));
    }
  }
  return types;
}

function entitledDiscountRate(cart) {
  const saved = cartSavedCents(cart);
  const types = entitledPurchaseTypes(cart);
  const groups = subtotalByPurchaseType(cart);
  const sub = [...types].reduce((sum, type) => sum + groups[type], 0);
  if (saved <= 0 || sub <= 0) return null;
  return saved / sub;
}

function comboMatchesSaved(saved, sub, declared) {
  if (declared != null) {
    return Math.abs(Math.round((sub * declared) / 100) - saved) <= 1;
  }
  const implied = (saved / sub) * 100;
  if (implied <= 0 || implied > 100) return false;
  return Math.abs(implied - Math.round(implied)) < 0.05;
}

function declaredPercentage(cart) {
  for (const row of cart?.discountAllocations ?? []) {
    const pct = row?.discountApplication?.value?.percentage;
    if (typeof pct === 'number' && pct > 0) return pct;
  }
  return null;
}

function subtotalByPurchaseType(cart) {
  const groups = {onetime: 0, subscribe: 0};
  for (const line of cart?.lines?.nodes ?? []) {
    groups[purchaseTypeOf(line)] += moneyCents(lineListTotal(line));
  }
  return groups;
}

function cartSavedCents(cart) {
  const saved = summedDiscountMoney(cartDiscountLines(cart));
  return saved ? moneyCents(saved) : 0;
}

function purchaseTypeOf(line) {
  return lineIsSubscribe(line) ? 'subscribe' : 'onetime';
}

function lineIsSubscribe(line) {
  return Boolean(line?.sellingPlanAllocation?.sellingPlan?.id);
}

function lineDiscountCents(line) {
  return (line?.discountAllocations ?? []).reduce(
    (sum, row) => sum + moneyCents(row?.discountedAmount),
    0,
  );
}

function moneyCents(money) {
  return Math.round(Number(money?.amount) * 100);
}
