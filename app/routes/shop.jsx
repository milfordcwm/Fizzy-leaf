import {ShopConfigurator} from '~/components/ShopConfigurator';
import {
  loadDiscountPreview,
  needsDiscountPreview,
  peekDiscountPreview,
} from '~/lib/discountPreview';
import {loadDisplayPrices} from '~/lib/product';
import {logInfo} from '~/lib/log';

export const meta = () => {
  return [{title: 'Shop · Fizzy Leaf'}];
};

export async function loader({context}) {
  const loaded = await loadDisplayPrices(context.storefront, context.env);
  const cart = await context.cart.get();
  const previewRates = discountPreviewForCart(context, cart);
  logInfo('shop-loader', 'returning prices to UI', loaded);
  return {...loaded, previewRates};
}

function discountPreviewForCart(context, cart) {
  if (!needsDiscountPreview(cart)) return null;
  return (
    peekDiscountPreview(context.session, cart) ??
    loadDiscountPreview({
      storefront: context.storefront,
      cart,
      session: context.session,
    })
  );
}

export default function ShopPage() {
  return (
    <section id="shop" className="section section--cream">
      <div className="container">
        <div className="section-header">
          <span className="eyebrow">Shop</span>
          <h2>Tasting is believing.</h2>
          <p className="lead">
            Experience the Fizzy Leaf difference. Ships to Tennessee only —
            because it&apos;s made right here.
          </p>
        </div>
        <ShopConfigurator />
      </div>
    </section>
  );
}
