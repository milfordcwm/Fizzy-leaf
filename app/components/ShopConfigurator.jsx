import {useEffect, useRef, useState} from 'react';
import {useLoaderData} from 'react-router';
import {CartForm} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {ShopPrice} from '~/components/ShopPrice';
import {
  GALLERY_IMAGES,
  PRICES,
  cartLineInput,
} from '~/lib/product';
import {logError, logInfo, logWarn} from '~/lib/log';

const FADE_MS = 220;

export function ShopConfigurator() {
  const data = useLoaderData() ?? {};
  const prices = data.prices ?? PRICES;
  const source = data.source;
  const {open} = useAside();
  const [pack, setPack] = useState(12);
  const [purchaseType, setPurchaseType] = useState('onetime');
  const [qty, setQty] = useState(1);
  const [mainSrc, setMainSrc] = useState(GALLERY_IMAGES[0]);
  const [thumbIndex, setThumbIndex] = useState(0);
  const mainRef = useRef(null);
  const lines = [cartLineInput({pack, purchaseType, quantity: qty})];

  useEffect(() => {
    if (!data.prices) {
      logWarn('shop-ui', 'no loader prices — rendering hardcoded PRICES');
      return;
    }
    logInfo('shop-ui', 'rendering', {
      pack,
      purchaseType,
      display: `${pack} ${purchaseType}`,
      '12.onetime': `${prices[12]?.onetime} (${source?.[12]?.onetime || '?'})`,
      '12.subscribe': `${prices[12]?.subscribe} (${source?.[12]?.subscribe || '?'})`,
      '24.onetime': `${prices[24]?.onetime} (${source?.[24]?.onetime || '?'})`,
      '24.subscribe': `${prices[24]?.subscribe} (${source?.[24]?.subscribe || '?'})`,
    });
  }, [data.prices, prices, source, pack, purchaseType]);

  return (
    <div className="shop-layout">
      <Gallery
        mainRef={mainRef}
        mainSrc={mainSrc}
        thumbIndex={thumbIndex}
        onSelect={(src, index) => {
          fadeSwapImage(mainRef.current, src, () => setMainSrc(src));
          setThumbIndex(index);
        }}
      />
      <div className="shop-details">
        <h3>Roselle Hibiscus</h3>
        <p style={{color: 'var(--text-muted)', marginBottom: '0.5rem'}}>
          {pack}-Pack · Sparkling Tea · 12 oz cans
        </p>
        <ShopPrice
          pack={pack}
          purchaseType={purchaseType}
          prices={prices}
          previewRates={data.previewRates}
        />

        <p className="pack-label">Select Case Size</p>
        <div className="pack-selector">
          {[12, 24].map((size) => (
            <button
              key={size}
              type="button"
              className={`pack-btn${pack === size ? ' selected' : ''}`}
              onClick={() => setPack(size)}
            >
              {size}-Pack
            </button>
          ))}
        </div>

        <div className="purchase-toggle">
          <button
            type="button"
            className={`purchase-option${purchaseType === 'onetime' ? ' active' : ''}`}
            onClick={() => setPurchaseType('onetime')}
          >
            One-Time Purchase
          </button>
          <button
            type="button"
            className={`purchase-option${purchaseType === 'subscribe' ? ' active' : ''}`}
            onClick={() => setPurchaseType('subscribe')}
          >
            Subscribe &amp; Save
            <span className="save-tag">Save 20%</span>
          </button>
        </div>

        <ul className="shop-features">
          <li>{pack}-pack of 12 oz cans</li>
          <li>Delivered monthly — cancel anytime (save 20%)</li>
          <li>Free shipping on subscriptions</li>
          <li>Free pickup available at local retailers</li>
          <li>Tennessee shipping only</li>
        </ul>

        <div className="buy-row">
          <div className="qty-stepper">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQty((n) => Math.max(1, n - 1))}
            >
              −
            </button>
            <span>{qty}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQty((n) => n + 1)}
            >
              +
            </button>
          </div>
          <CartForm
            route="/cart"
            inputs={{lines}}
            action={CartForm.ACTIONS.LinesAdd}
          >
            {(fetcher) => (
              <AddButton
                fetcher={fetcher}
                onAdded={() => {
                  setQty(1);
                  open('cart');
                }}
              />
            )}
          </CartForm>
        </div>

        <div className="tn-notice">
          <span>📍</span>
          <span>
            We currently ship to Tennessee zip codes only (37xxx &amp; 38xxx).
          </span>
        </div>
      </div>
    </div>
  );
}

function AddButton({fetcher, onAdded}) {
  const prevState = useRef(fetcher.state);
  const [failed, setFailed] = useState(false);
  const busy = fetcher.state !== 'idle';

  useEffect(() => {
    const wasBusy = prevState.current !== 'idle';
    prevState.current = fetcher.state;
    if (!wasBusy || fetcher.state !== 'idle') return;
    if (cartAddFailed(fetcher.data)) {
      logError('cart', 'add failed', fetcher.data?.errors);
      setFailed(true);
      return;
    }
    logInfo('cart', 'add ok', {state: fetcher.state});
    setFailed(false);
    onAdded();
  }, [fetcher.state, fetcher.data, onAdded]);

  return (
    <div className="buy-submit">
      <button
        type="submit"
        className={`btn btn-primary shop-buy${busy ? ' is-loading' : ''}`}
        disabled={busy}
        onClick={() => setFailed(false)}
      >
        {busy ? 'Adding…' : 'Add to Cart'}
      </button>
      {failed ? (
        <p className="buy-error" role="alert">
          Sorry — could not add to cart. Please try again.
        </p>
      ) : null}
    </div>
  );
}

function cartAddFailed(data) {
  const errors = data?.errors;
  return Array.isArray(errors) && errors.length > 0;
}

function Gallery({mainRef, mainSrc, thumbIndex, onSelect}) {
  return (
    <div className="shop-gallery">
      <img
        ref={mainRef}
        src={mainSrc}
        alt="Fizzy Leaf Roselle Hibiscus"
        className="shop-main-image"
        style={{transition: 'opacity 0.22s ease'}}
      />
      <div className="shop-thumbs">
        {GALLERY_IMAGES.map((src, index) => (
          <button
            key={src}
            type="button"
            className={`shop-thumb${thumbIndex === index ? ' active' : ''}`}
            aria-label={`View image ${index + 1}`}
            onClick={() => {
              if (src !== mainSrc) onSelect(src, index);
            }}
          >
            <img src={src} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}

function fadeSwapImage(el, newSrc, apply) {
  if (!el || !newSrc) {
    apply();
    return;
  }
  el.style.opacity = '0';
  window.setTimeout(() => {
    apply();
    el.onload = () => {
      el.style.opacity = '1';
    };
    window.setTimeout(() => {
      el.style.opacity = '1';
    }, 1000);
  }, FADE_MS);
}
