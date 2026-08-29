import {discountRatesByPurchaseType} from '~/lib/discountedPrice';
import {logError} from '~/lib/log';
import {SELLING_PLAN_ID, VARIANT_12} from '~/lib/product';

const EMPTY_RATES = {onetime: null, subscribe: null};

export function hasDiscountCodes(cart) {
  return cartDiscountCodes(cart).length > 0;
}

export function needsDiscountPreview(cart) {
  return hasDiscountCodes(cart) && (cart?.lines?.nodes ?? []).length === 0;
}

export function peekDiscountPreview(session, cart) {
  const codes = cartDiscountCodes(cart);
  if (!codes.length) return null;
  const cached = session?.get('discountPreview');
  if (cached?.key === previewCacheKey(codes) && cached.rates) return cached.rates;
  return null;
}

export async function loadDiscountPreview({storefront, cart, session}) {
  const codes = cartDiscountCodes(cart);
  if (!codes.length) return EMPTY_RATES;
  if ((cart?.lines?.nodes ?? []).length > 0) {
    return discountRatesByPurchaseType(cart);
  }

  const key = previewCacheKey(codes);
  const cached = session?.get('discountPreview');
  if (cached?.key === key && cached.rates) return cached.rates;

  const rates = await probeDiscountRates(storefront, codes);
  session?.set('discountPreview', {key, rates});
  return rates;
}

function cartDiscountCodes(cart) {
  return (cart?.discountCodes ?? []).map((row) => row.code).filter(Boolean);
}

function previewCacheKey(codes) {
  return codes.map((code) => code.toLowerCase()).sort().join(',');
}

async function probeDiscountRates(storefront, codes) {
  const withSubscribe = await createPreviewCart(storefront, codes, true);
  if (withSubscribe) return discountRatesByPurchaseType(withSubscribe);
  const onetimeOnly = await createPreviewCart(storefront, codes, false);
  if (onetimeOnly) return discountRatesByPurchaseType(onetimeOnly);
  return EMPTY_RATES;
}

async function createPreviewCart(storefront, codes, includeSubscribe) {
  try {
    const result = await storefront.mutate(DISCOUNT_PREVIEW_CART, {
      variables: {
        input: {
          discountCodes: codes,
          lines: previewLines(includeSubscribe),
        },
      },
    });
    const payload = result?.cartCreate;
    if (payload?.userErrors?.length) {
      logError('discount-preview', 'cartCreate userErrors', payload.userErrors);
      return null;
    }
    return payload?.cart ?? null;
  } catch (error) {
    logError(
      'discount-preview',
      'probe failed',
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

function previewLines(includeSubscribe) {
  const onetime = {merchandiseId: VARIANT_12, quantity: 1};
  if (!includeSubscribe) return [onetime];
  return [
    onetime,
    {
      merchandiseId: VARIANT_12,
      quantity: 1,
      sellingPlanId: SELLING_PLAN_ID,
    },
  ];
}

const DISCOUNT_PREVIEW_CART = `#graphql
  mutation DiscountPreviewCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        discountAllocations {
          discountedAmount {
            amount
            currencyCode
          }
          ... on CartCodeDiscountAllocation {
            code
            discountApplication {
              value {
                ... on PricingPercentageValue {
                  percentage
                }
              }
            }
          }
          ... on CartAutomaticDiscountAllocation {
            title
            discountApplication {
              value {
                ... on PricingPercentageValue {
                  percentage
                }
              }
            }
          }
        }
        lines(first: 10) {
          nodes {
            quantity
            cost {
              subtotalAmount {
                amount
                currencyCode
              }
              totalAmount {
                amount
                currencyCode
              }
            }
            discountAllocations {
              discountedAmount {
                amount
                currencyCode
              }
            }
            sellingPlanAllocation {
              sellingPlan {
                id
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
