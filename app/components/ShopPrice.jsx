import {Suspense} from 'react';
import {Await, useRouteLoaderData} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';
import {shopPriceDisplay} from '~/lib/discountedPrice';
import {priceDisplay} from '~/lib/product';

export function ShopPrice({pack, purchaseType, prices, previewRates}) {
  const root = useRouteLoaderData('root');
  const catalog = priceDisplay(pack, purchaseType, prices);
  const offer = {pack, purchaseType, prices};

  if (isPromise(previewRates)) {
    return (
      <Suspense fallback={<PriceText price={catalog} pending />}>
        <Await resolve={previewRates}>
          {(rates) => (
            <PriceFromCart
              cart={root?.cart}
              offer={{...offer, previewRates: rates}}
              pending={<PriceText price={catalog} pending />}
            />
          )}
        </Await>
      </Suspense>
    );
  }

  return (
    <PriceFromCart
      cart={root?.cart}
      offer={{...offer, previewRates}}
      pending={<PriceText price={catalog} />}
    />
  );
}

function PriceFromCart({cart, offer, pending}) {
  if (!cart) {
    return (
      <PriceText price={shopPriceDisplay({...offer, cart: null})} />
    );
  }

  return (
    <Suspense fallback={pending}>
      <Await resolve={cart}>
        {(resolved) => <CartShopPrice cart={resolved} offer={offer} />}
      </Await>
    </Suspense>
  );
}

function CartShopPrice({cart, offer}) {
  const optimistic = useOptimisticCart(cart);
  return (
    <PriceText price={shopPriceDisplay({...offer, cart: optimistic})} />
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
