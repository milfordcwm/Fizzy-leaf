import {Suspense} from 'react';
import {Await, useRouteLoaderData} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';
import {shopPriceDisplay} from '~/lib/discountedPrice';

export function ShopPrice({pack, purchaseType, prices, previewRates}) {
  const root = useRouteLoaderData('root');
  const offer = {pack, purchaseType, prices, previewRates};
  const fallback = shopPriceDisplay({...offer, cart: null});
  if (!root?.cart) return <PriceText price={fallback} />;

  return (
    <Suspense fallback={<PriceText price={fallback} />}>
      <Await resolve={root.cart}>
        {(cart) => <CartShopPrice cart={cart} offer={offer} />}
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

function PriceText({price}) {
  return (
    <div className="shop-price">
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
