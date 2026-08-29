import {Suspense} from 'react';
import {Await} from 'react-router';
import {shopPriceDisplay} from '~/lib/discountedPrice';
import {priceDisplay} from '~/lib/product';

export function ShopPrice({pack, purchaseType, prices, previewRates}) {
  const catalog = priceDisplay(pack, purchaseType, prices);
  const offer = {pack, purchaseType, prices};

  if (isPromise(previewRates)) {
    return (
      <Suspense fallback={<PriceText price={catalog} pending />}>
        <Await resolve={previewRates}>
          {(rates) => (
            <PriceText
              price={shopPriceDisplay({...offer, previewRates: rates})}
            />
          )}
        </Await>
      </Suspense>
    );
  }

  return (
    <PriceText price={shopPriceDisplay({...offer, previewRates})} />
  );
}

function PriceText({price, pending}) {
  return (
    <div
      className={pending ? 'shop-price shop-price-pending' : 'shop-price'}
      aria-busy={pending ? true : undefined}
    >
      <span>
        {price.struck ? (
          <>
            <s>{price.struck}</s> {price.live}
          </>
        ) : (
          price.live
        )}
      </span>
    </div>
  );
}

function isPromise(value) {
  return value != null && typeof value.then === 'function';
}
