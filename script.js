// Path & locale helpers
const isLV = (document.documentElement.getAttribute("lang") || "").toLowerCase() === "lv" || window.location.pathname.includes("/lv/");
// Use root-relative assets so pages under nested routes (e.g. /features/...) load correctly.
const ASSET_ROOT = "";

// Currency (set by Netlify Edge Function via `currency` cookie)
const getCookieValue = (name) => {
    const parts = String(document.cookie || "").split(";");
    for (const part of parts) {
        const [k, ...rest] = part.trim().split("=");
        if (k === name) return decodeURIComponent(rest.join("="));
    }
    return null;
};

const SUPPORTED_CURRENCIES = ["EUR", "USD", "GBP"];
const DEFAULT_CURRENCY = "EUR";
const currencyCookie = (getCookieValue("currency") || "").toUpperCase();
const currency = SUPPORTED_CURRENCIES.includes(currencyCookie) ? currencyCookie : DEFAULT_CURRENCY;

// Cookie notice (shown once)
const COOKIE_NOTICE_KEY = "cookieNoticeAccepted_v1";
const cookieBanner = document.getElementById("cookieBanner");
const cookieAccept = document.getElementById("cookieAccept");

// Meta Pixel (consent-gated via the existing cookie banner)
const getMetaPixelId = () => {
    try {
        const meta = document.querySelector('meta[name="meta-pixel-id"]');
        const id = (meta && meta.getAttribute("content")) ? String(meta.getAttribute("content")).trim() : "";
        return id || null;
    } catch {
        return null;
    }
};

const META_PIXEL_ID = getMetaPixelId();
let metaPixelLoaded = false;

const loadMetaPixel = () => {
    if (metaPixelLoaded) return;
    if (!META_PIXEL_ID) return;

    metaPixelLoaded = true;

    // Meta Pixel base code (injected only after consent)
    !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = "2.0";
        n.queue = [];
        t = b.createElement(e);
        t.async = true;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    try {
        window.fbq("init", META_PIXEL_ID);
        window.fbq("track", "PageView");
    } catch {
        // ignore
    }
};

const hasCookieConsent = () => {
    try {
        return window.localStorage.getItem(COOKIE_NOTICE_KEY) === "1";
    } catch {
        return false;
    }
};

const showCookieBannerIfNeeded = () => {
    if (!cookieBanner) return;
    try {
        const accepted = window.localStorage.getItem(COOKIE_NOTICE_KEY) === "1";
        if (accepted) return;
    } catch {
        // If storage is blocked, still show the banner; user can dismiss for the session.
    }
    cookieBanner.classList.remove("hidden");
};

if (cookieAccept && cookieBanner) {
    cookieAccept.addEventListener("click", () => {
        try {
            window.localStorage.setItem(COOKIE_NOTICE_KEY, "1");
        } catch {
            // ignore
        }
        cookieBanner.classList.add("hidden");

        // User consented to cookies; enable Meta Pixel if configured.
        loadMetaPixel();
    });
}

showCookieBannerIfNeeded();

// If consent already granted from a previous visit, load Meta Pixel immediately (when configured).
if (hasCookieConsent()) {
    loadMetaPixel();
}

// Track signup CTA clicks as a Lead (only fires if Meta Pixel is loaded)
document.addEventListener("click", (e) => {
    const link = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!link) return;

    const href = String(link.getAttribute("href") || "");
    if (!href) return;

    // Track only signup clicks that leave the landing page.
    if (!/(^|\/)signup(\b|\?|#)/i.test(href)) return;
    if (!/bookable\.live/i.test(href)) return;

    if (typeof window.fbq === "function") {
        try {
            window.fbq("track", "Lead");
        } catch {
            // ignore
        }
    }
});

// Fixed prices per currency (edit these exact numbers to match your billing)
// Base (EUR) comes from pricingData below; overrides only apply when currency != EUR.
const PRICE_OVERRIDES = {
    USD: { pro: { monthly: 19, yearly: 150 } },
    GBP: { pro: { monthly: 19, yearly: 150 } },
};

const formatMoney = (amount) => {
    const n = Number(amount);
    if (!Number.isFinite(n)) return "";

    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(n);
    } catch {
        // Fallback if Intl/currency is unsupported for any reason
        return `${n} ${currency}`;
    }
};

// Mobile Menu Toggle
const openMenu = document.getElementById("openMenu");
const closeMenu = document.getElementById("closeMenu");
const mobileMenu = document.getElementById("mobileMenu");
const navbar = document.getElementById("navbar");

if (openMenu && closeMenu && mobileMenu && navbar) {
    const closeMobileMenu = () => {
        mobileMenu.classList.add("-translate-x-full");
        document.body.classList.remove("overflow-hidden");
        navbar.classList.add("backdrop-blur");
    };

    openMenu.addEventListener("click", () => {
        mobileMenu.classList.remove("-translate-x-full");
        document.body.classList.add("overflow-hidden");
        navbar.classList.remove("backdrop-blur");
    });

    closeMenu.addEventListener("click", () => {
        closeMobileMenu();
    });

    // Close menu when navigating via menu links (mobile section navigation)
    mobileMenu.addEventListener("click", (e) => {
        const link = e.target && e.target.closest ? e.target.closest("a") : null;
        if (!link) return;
        closeMobileMenu();
    });
}

// Theme Toggle
const themeToggle = document.getElementById("themeToggle");
const logo = document.getElementById("logo");
const colorSplash = document.getElementById("colorSplash");
const faqSplash = document.getElementById("faqSplash");
const landingText = document.getElementById("landing-text");
const logoFooter = document.getElementById("logo-footer");

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.documentElement.classList.toggle("dark");
        if (document.documentElement.classList.contains("dark")) {
            if (logo) logo.src = `${ASSET_ROOT}/assets/logo_bright.png`;
            themeToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon-icon lucide-moon"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/></svg>`;
            if (colorSplash) colorSplash.src = `${ASSET_ROOT}/assets/color-splash.svg`;
            if (faqSplash) faqSplash.src = `${ASSET_ROOT}/assets/color-splash.svg`;
            if (landingText) {
                landingText.src = `${ASSET_ROOT}/assets/bookable-text-light.svg`;
                landingText.style.filter = "opacity(.5)";
            }
            if (logoFooter) logoFooter.src = `${ASSET_ROOT}/assets/logo_bright.png`;
        } else {
            if (logo) logo.src = `${ASSET_ROOT}/assets/logo.png`;
            themeToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun-icon lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
            if (colorSplash) colorSplash.src = `${ASSET_ROOT}/assets/color-splash-light.svg`;
            if (faqSplash) faqSplash.src = `${ASSET_ROOT}/assets/color-splash-light.svg`;
            if (landingText) landingText.src = `${ASSET_ROOT}/assets/bookable-text-light.svg`;
            if (logoFooter) logoFooter.src = `${ASSET_ROOT}/assets/logo.png`;
        }
    });
}

const logos = ["google", "microsoft", "whatsapp", "apple", "shopify", "stripe", "zoom"];
const track = document.getElementById("logo-track");

if (track) {
    const logoHTML = logos
        .map((name) => {
            const size = (name === 'whatsapp' || name === 'apple' || name === 'shopify') ? 50 : 100;
            return `<img class="mx-11 shrink-0" src="${ASSET_ROOT}/assets/companies-logo/${name}.svg" onerror="this.onerror=null;this.src='https://cdn.simpleicons.org/${name}/90A1B9';" alt="${name.charAt(0).toUpperCase() + name.slice(1)} logo" width="${size}" height="${size}" loading="lazy" decoding="async" draggable="false"/>`;
        })
        .join("");
    track.innerHTML = logoHTML + logoHTML;
}



const featuresDataEN = [
    {
        icon: `<div class='w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center'><svg class='w-5 h-5 text-purple-600 dark:text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'><path stroke-linecap='round' stroke-linejoin='round' d='M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'/></svg></div>`,
        title: "Branded booking pages",
        description: "Share a beautiful booking link with your brand, services, prices, and live availability. Our booking pages are highly customizable to match your brand identity.",
        image: "assets/branded-booking-page.webp",
        imageAlt: "Branded booking page",
        typingDemoSlugs: ["barber-john", "emilys-salon", "nails-by-emma", "designer-james", "coach-david"],
    },
    {
        icon: `<div class='w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center'><svg class='w-5 h-5 text-purple-600 dark:text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'><path stroke-linecap='round' stroke-linejoin='round' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'/></svg></div>`,
        title: "Calendar sync",
        description: "Two‑way sync with Google Calendar and Microsoft Outlook prevents double‑bookings.",
    },
    {
        icon: `<div class='w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center'><svg class='w-5 h-5 text-purple-600 dark:text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'><path stroke-linecap='round' stroke-linejoin='round' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'/></svg></div>`,
        title: "Staff & multi‑venue",
        description: "Assign services to specific team members and locations. Let clients choose or auto‑assign.",
    },
    {
        icon: `<div class='w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center'><svg class='w-5 h-5 text-purple-600 dark:text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'><path stroke-linecap='round' stroke-linejoin='round' d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'/></svg></div>`,
        title: "Automated reminders",
        description: "Reduce no‑shows with email, SMS, and WhatsApp (coming soon) reminders sent at smart intervals.",
    },
    {
        icon: `<div class='w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center'><svg class='w-5 h-5 text-purple-600 dark:text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'><path stroke-linecap='round' stroke-linejoin='round' d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'/></svg></div>`,
        title: "Widget embed",
        description: "Embed the booking experience directly into your website or add a popup button that opens it in an overlay. Pre-select services or staff to simplify the flow.",
    },
    {
        icon: `<div class='w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center'><svg class='w-5 h-5 text-purple-600 dark:text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'><path stroke-linecap='round' stroke-linejoin='round' d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'/></svg></div>`,
        title: "Analytics & exports",
        description: "Track bookings, cancellations, revenue and export clients & appointments to CSV.",
    },
    {
        icon: `<div class='w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center'><svg class='w-5 h-5 text-purple-600 dark:text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'><path stroke-linecap='round' stroke-linejoin='round' d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'/></svg></div>`,
        title: "Payment collection",
        description: "Accept payments for your services directly through your booking page. Clients can pay upfront or leave a deposit using Apple Pay, Google Pay, Visa, Mastercard, and more.",
    },
];

const featuresDataLV = [
    {
        icon: `<div class='w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center'><svg class='w-5 h-5 text-purple-600 dark:text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'><path stroke-linecap='round' stroke-linejoin='round' d='M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'/></svg></div>`,
        title: "Zīmola rezervāciju lapas",
        description: "Kopīgo skaistu rezervācijas saiti ar zīmolu, pakalpojumiem, cenām un tiešsaistes pieejamību. Mūsu rezervāciju lapas ir ļoti pielāgojamas, lai atbilstu jūsu zīmola identitātei.",
        image: "assets/branded-booking-page.webp",
        imageAlt: "Zīmola rezervāciju lapa",
        typingDemoSlugs: ["barber-john", "emilys-salon", "nails-by-emma", "designer-james", "coach-david"],
    },
    {
        icon: `<div class='w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center'><svg class='w-5 h-5 text-purple-600 dark:text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'><path stroke-linecap='round' stroke-linejoin='round' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'/></svg></div>`,
        title: "Kalendāru sinhronizācija",
        description: "Divvirzienu sinhronizācija ar Google Calendar un Microsoft Outlook novērš dubultas rezervācijas.",
    },
    {
        icon: `<div class='w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center'><svg class='w-5 h-5 text-purple-600 dark:text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'><path stroke-linecap='round' stroke-linejoin='round' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'/></svg></div>`,
        title: "Personāls un vairākas vietas",
        description: "Piesaisti pakalpojumus konkrētiem darbiniekiem un lokācijām. Ļauj klientiem izvēlēties vai auto‑piešķirt.",
    },
    {
        icon: `<div class='w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center'><svg class='w-5 h-5 text-purple-600 dark:text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'><path stroke-linecap='round' stroke-linejoin='round' d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'/></svg></div>`,
        title: "Automatizēti atgādinājumi",
        description: "Samazini neierašanos ar e‑pastu un WhatsApp (drīzumā) atgādinājumiem gudros intervālos.",
    },
    {
        icon: `<div class='w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center'><svg class='w-5 h-5 text-purple-600 dark:text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'><path stroke-linecap='round' stroke-linejoin='round' d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'/></svg></div>`,
        title: "Logrīka integrācija",
        description: "Integrējiet rezervācijas pieredzi tieši savā mājaslapā. Iepriekš atlasiet pakalpojumus vai darbiniekus, lai vienkāršotu procesu.",
    },
    {
        icon: `<div class='w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center'><svg class='w-5 h-5 text-purple-600 dark:text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'><path stroke-linecap='round' stroke-linejoin='round' d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'/></svg></div>`,
        title: "Analītika un eksporti",
        description: "Seko rezervācijām, atcelšanām, ieņēmumiem un eksportē klientus & pierakstus uz CSV.",
    },
    {
        icon: `<div class='w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center'><svg class='w-5 h-5 text-purple-600 dark:text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'><path stroke-linecap='round' stroke-linejoin='round' d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'/></svg></div>`,
        title: "Maksājumu pieņemšana",
        description: "Pieņem maksājumus par saviem pakalpojumiem tieši caur rezervāciju lapu. Klienti var samaksāt uzreiz vai atstāt depozītu, izmantojot Apple Pay, Google Pay, Visa, Mastercard un citus.",
    },
];

const featuresData = isLV ? featuresDataLV : featuresDataEN;

const features = document.getElementById("features");
if (features && features.children.length === 0) {
    const [primaryFeature, ...secondaryFeatures] = featuresData;

    const renderFeatureCard = (f, titleClass = "text-xl") => `
        <div class='js-fade-in p-4 text-left bg-white/70 dark:bg-slate-900/30 space-y-3'>
            ${f.icon || ""}
            <h3 class='${titleClass} font-semibold'>${f.title}</h3>
            <p class='text-sm text-slate-600 dark:text-slate-300'>${f.description}</p>
            ${Array.isArray(f.typingDemoSlugs) && f.typingDemoSlugs.length
            ? `<p class='text-md md:text-lg text-slate-500 dark:text-slate-400 mt-6'>
                        <span>app.bookable.live/book/</span><span class='font-semibold' data-typing-slugs='${JSON.stringify(f.typingDemoSlugs).replace(/'/g, "&#39;")}'></span>
                   </p>`
            : ""}
            ${Array.isArray(f.typingDemoSlugs) && f.typingDemoSlugs.length
            ? `<a href='https://app.bookable.live/signup'
                        class='cta-button inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 transition text-white rounded-full px-6 h-11 font-semibold leading-none w-max mt-2'>
                        ${isLV ? "Iegūsti savu tagad" : "Get yours now"}
                   </a>`
            : ""}
        </div>
    `;

    const renderPrimary = (f) => {
        if (!f) return "";

        const left = renderFeatureCard(f, "text-2xl");
        const right = f.image
            ? `
                <div class='js-fade-in bg-white/70 dark:bg-slate-900/30 overflow-hidden'>
                    <img src='${ASSET_ROOT}/${f.image}' alt='${f.imageAlt || ""}' loading='lazy' decoding='async' class='w-full h-auto object-contain' />
                </div>
              `
            : "";

        return `
            <div class='grid grid-cols-1 md:grid-cols-2 gap-6'>
                ${left}
                ${right}
            </div>
        `;
    };

    const renderSecondary = (items) => {
        if (!Array.isArray(items) || !items.length) return "";
        return `
            <div class='grid grid-cols-1 md:grid-cols-3 gap-6 mt-6'>
                ${items.map((f) => renderFeatureCard(f, "text-xl")).join("")}
            </div>
        `;
    };

    features.innerHTML = `${renderPrimary(primaryFeature)}${renderSecondary(secondaryFeatures)}`;
}

// Slight fade-in for cards (Features, Who, Pricing, FAQ)
let fadeInIO;

const initFadeInOnScroll = (root = document) => {
    const reducedMotion =
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scope = root instanceof Element ? root : document;
    const targets = Array.from(scope.querySelectorAll(".js-fade-in")).filter(
        (el) => el && el.dataset && el.dataset.fadeInit !== "1"
    );

    if (root instanceof Element && root.classList.contains("js-fade-in") && root.dataset.fadeInit !== "1") {
        targets.unshift(root);
    }

    if (!targets.length) return;

    const init = (el) => {
        el.dataset.fadeInit = "1";
        el.style.opacity = "0";
        el.style.transform = "translateY(4px)";
        el.style.transition = "opacity 600ms ease-out, transform 600ms ease-out";
        el.style.willChange = "opacity, transform";
    };

    const reveal = (el) => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0px)";
        el.style.willChange = "auto";
    };

    if (reducedMotion || !("IntersectionObserver" in window)) {
        targets.forEach((el) => {
            el.dataset.fadeInit = "1";
            reveal(el);
        });
        return;
    }

    if (!fadeInIO) {
        fadeInIO = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    reveal(entry.target);
                    observer.unobserve(entry.target);
                });
            },
            { root: null, threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
        );
    }

    targets.forEach((el) => {
        init(el);
        fadeInIO.observe(el);
    });
};

initFadeInOnScroll();

const startTypingDemo = () => {
    const nodes = document.querySelectorAll("[data-typing-slugs]");
    if (!nodes.length) return;

    const prefersReducedMotion =
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    nodes.forEach((node) => {
        const raw = node.getAttribute("data-typing-slugs") || "[]";
        let slugs;
        try {
            slugs = JSON.parse(raw);
        } catch {
            slugs = [];
        }
        if (!Array.isArray(slugs) || slugs.length === 0) return;

        if (prefersReducedMotion) {
            node.textContent = slugs[0];
            return;
        }

        let index = 0;
        let text = "";
        let deleting = false;

        const tick = () => {
            const full = String(slugs[index] ?? "");
            if (!full) return;

            text = deleting ? full.slice(0, Math.max(0, text.length - 1)) : full.slice(0, text.length + 1);
            node.textContent = text;

            let delay = deleting ? 45 : 65;
            if (!deleting && text === full) {
                delay = 1100;
                deleting = true;
            } else if (deleting && text === "") {
                deleting = false;
                index = (index + 1) % slugs.length;
                delay = 250;
            }

            window.setTimeout(tick, delay);
        };

        tick();
    });
};

startTypingDemo();


const pricingDataEN = [
    {
        id: "regular",
        title: "Regular Plan",
        priceMonthly: 0,
        priceYearly: 0,
        features: [
            "Integration with Google Calendar",
            "Reminders to Email",
            "Follow-up & Feedback messaging",
            "Customizable Booking Page",
            "Easy-to-use Dashboard"
        ],
        buttonText: "Get Started",
    },
    {
        id: "pro",
        title: "Pro Plan",
        priceMonthly: 19,
        priceYearly: 150,
        mostPopular: true,
        features: [
            "Everything in Regular",
            "Multiple Calendar integrations",
            "Custom messaging & reminder templates",
            "Custom branding",
            "SMS reminders",
            "Multiple Staff Members & Venues",
            "Widget embed & pre-selection",
            "Smart Rescheduling",
            "Online Payments via Stripe"
        ],
        buttonText: "Start Pro Trial",
    }
];

const pricingDataLV = [
    {
        id: "regular",
        title: "Regular plāns",
        priceMonthly: 0,
        priceYearly: 0,
        features: [
            "Integrācija ar Google Calendar",
            "Uzraudzības un atgriezeniskās saites ziņojumi",
            "Pielāgojama rezervāciju lapa",
            "Vienkārši lietojams panelis",
            "Ātrs atbalsts"
        ],
        buttonText: "Sākt",
    },
    {
        id: "pro",
        title: "Pro plāns",
        priceMonthly: 19,
        priceYearly: 150,
        mostPopular: true,
        features: [
            "Viss, kas ietverts Regular plānā",
            "Vairāku kalendāru integrācijas",
            "Pielāgojami ziņojumi un atgādinājumu veidnes",
            "Pielāgota zīmola identitāte",
            "SMS atgādinājumi",
            "Vairāki darbinieku konti un lokācijas",
            "Logrīka integrācija un priekšatlase",
            "Gudra pārcelšana",
            "Tiešsaistes maksājumi ar Stripe"
        ],
        buttonText: "Sākt Pro izmēģinājumu",
    }
];

const pricingData = isLV ? pricingDataLV : pricingDataEN;

const getPlanPrice = (plan, cadence) => {
    const base = cadence === "yearly" ? plan.priceYearly : plan.priceMonthly;
    if (!plan || !plan.id) return base;

    const byCurrency = PRICE_OVERRIDES[currency];
    const byPlan = byCurrency && byCurrency[plan.id];
    if (!byPlan) return base;

    const override = cadence === "yearly" ? byPlan.yearly : byPlan.monthly;
    return Number.isFinite(Number(override)) ? override : base;
};

const pricingContainer = document.getElementById("pricing");

const billingMonthlyBtn = document.getElementById("billingMonthly");
const billingYearlyBtn = document.getElementById("billingYearly");
const billingSavingsText = document.getElementById("billingSavingsText");

const computeSavingsPercent = (monthly, yearly) => {
    const monthlyNumber = Number(monthly);
    const yearlyNumber = Number(yearly);

    if (!Number.isFinite(monthlyNumber) || !Number.isFinite(yearlyNumber)) return null;
    if (monthlyNumber <= 0 || yearlyNumber <= 0) return null;

    const yearlyFromMonthly = monthlyNumber * 12;
    if (yearlyFromMonthly <= 0) return null;

    const savings = 1 - yearlyNumber / yearlyFromMonthly;
    const pct = Math.round(savings * 100);
    if (!Number.isFinite(pct) || pct <= 0) return null;
    return pct;
};

const getPeriodLabel = (cadence) => {
    if (cadence === "yearly") return isLV ? "/mēn" : "/mo";
    return isLV ? "/mēn" : "/mo";
};

const setBillingToggleUI = (cadence) => {
    if (!billingMonthlyBtn || !billingYearlyBtn) return;

    const isMonthly = cadence !== "yearly";

    billingMonthlyBtn.setAttribute("aria-pressed", String(isMonthly));
    billingYearlyBtn.setAttribute("aria-pressed", String(!isMonthly));

    if (isMonthly) {
        billingMonthlyBtn.className = "px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 transition text-white font-medium text-sm leading-none";
        billingYearlyBtn.className = "px-4 py-2 rounded-full transition text-slate-600 dark:text-slate-300 font-medium text-sm leading-none";
    } else {
        billingMonthlyBtn.className = "px-4 py-2 rounded-full transition text-slate-600 dark:text-slate-300 font-medium text-sm leading-none";
        billingYearlyBtn.className = "px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 transition text-white font-medium text-sm leading-none";
    }
};

const setBillingSavingsUI = (cadence) => {
    if (!billingSavingsText) return;

    if (cadence !== "yearly") {
        billingSavingsText.classList.add("hidden");
        return;
    }

    const proPlan = pricingData.find((p) => p && (p.id === "pro")) || pricingData[1];
    if (!proPlan) return;

    const pct = computeSavingsPercent(getPlanPrice(proPlan, "monthly"), getPlanPrice(proPlan, "yearly"));
    if (!pct) return;

    billingSavingsText.textContent = isLV ? `Ietaupi ${pct}%` : `Save ${pct}%`;
    billingSavingsText.classList.remove("hidden");
};

const renderPricing = (cadence = "monthly") => {
    if (!pricingContainer) return;

    const periodLabel = getPeriodLabel(cadence);

    pricingContainer.innerHTML = pricingData.map(plan => {
        const price = getPlanPrice(plan, cadence);
        const displayPrice = cadence === "yearly" && price > 0 ? (price / 12) : price;
        const priceLabel = formatMoney(displayPrice);
        const billedYearlyNote = cadence === "yearly" && price > 0
            ? `<p class="text-xs mt-1 ${plan.mostPopular ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}">${isLV ? `*Rēķins reizi gadā (${formatMoney(price)})` : `*Billed yearly (${formatMoney(price)})`}</p>`
            : '';

        return `
            <div class="js-fade-in p-6 rounded-2xl w-full shadow-[0px_4px_26px] shadow-black/6 flex flex-col h-full 
                ${plan.mostPopular
                ? "relative bg-gradient-to-b from-indigo-600 to-violet-600 text-white"
                : "bg-white/50 dark:bg-gray-800/50 border border-slate-200 dark:border-slate-800"}">

                ${plan.mostPopular
                ? `<div class="flex items-center text-xs gap-1 py-1.5 px-2 text-purple-600 absolute top-4 right-4 rounded-full bg-white font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles-icon lucide-sparkles"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>
                            <p>${isLV ? 'Populārs' : 'Popular'}</p>
                        </div>`
                : ""}

                <div class="flex-1">
                    <p class="font-medium ${plan.mostPopular ? "text-white" : ""}">${plan.title}</p>
                    <h4 class="text-3xl font-semibold mt-1 ${plan.mostPopular ? "text-white" : ""}">
                        ${priceLabel}<span class="font-normal text-sm ${plan.mostPopular ? "text-white" : "text-slate-500"}">${periodLabel}</span>
                    </h4>
                    ${billedYearlyNote}

                    <hr class="my-8 ${plan.mostPopular ? "border-gray-300" : "border-slate-300 dark:border-slate-700"}" />

                    <div class="space-y-2 ${plan.mostPopular ? "text-white" : "text-slate-600 dark:text-slate-300"}">
                        ${plan.features.map(f => `
                            <div class="flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${plan.mostPopular ? "text-white" : "text-purple-600"}"><path d="M20 6 9 17l-5-5"/></svg>
                                <span>${f}</span>
                            </div>
                        `).join("")}
                    </div>
                </div>

                <div class="mt-auto pt-12">
                    <a href="https://app.bookable.live/signup" class="transition w-full py-3 rounded-full font-medium block w-full text-center
                        ${plan.mostPopular
                ? "bg-white hover:bg-slate-100 text-slate-800"
                : "bg-purple-600 hover:bg-purple-700 text-white"}">
                        ${plan.buttonText}
                    </a>
                </div>
            </div>
        `;
    }).join("");

    initFadeInOnScroll(pricingContainer);
};

if (pricingContainer) {
    let currentCadence = "monthly";
    setBillingToggleUI(currentCadence);
    setBillingSavingsUI(currentCadence);
    renderPricing(currentCadence);

    if (billingMonthlyBtn && billingYearlyBtn) {
        billingMonthlyBtn.addEventListener("click", () => {
            currentCadence = "monthly";
            setBillingToggleUI(currentCadence);
            setBillingSavingsUI(currentCadence);
            renderPricing(currentCadence);
        });

        billingYearlyBtn.addEventListener("click", () => {
            currentCadence = "yearly";
            setBillingToggleUI(currentCadence);
            setBillingSavingsUI(currentCadence);
            renderPricing(currentCadence);
        });
    }
}

// FAQ Data (localized)
const faqsDataEN = [
    {
        question: "Can I sync with Google Calendar or Outlook?",
        answer:
            "Yes. Bookable.live offers real-time, two-way calendar sync with both Google Calendar and Microsoft Outlook. Whenever a client books through your online booking system, the appointment instantly appears on your personal calendar and updates automatically if anything changes. This prevents double-bookings, keeps your schedule organized, and ensures your availability is always accurate across all devices.",
    },
    {
        question: "Do you support multiple team members and locations?",
        answer:
            "Absolutely. Our online booking software is designed for businesses of any size. You can add multiple staff members, assign individual working hours, and manage several locations under one account. Customers can choose their preferred team member, service, or venue directly from your booking page, making the scheduling process smooth and professional.",
    },
    {
        question: "How do reminders work?",
        answer:
            "Bookable.live includes built-in automated reminders to reduce no-shows and keep your schedule running smoothly. You can set smart reminders via email, SMS, or WhatsApp (coming soon), delivered at the ideal time before an appointment. The system sends notifications automatically, so your clients always remember their bookings and your business saves valuable time.",
    },
    {
        question: "Is there a free plan?",
        answer:
            "Yes. Our Starter plan is completely free and gives you access to the core features of our online booking system, including unlimited appointments, a customizable booking page, calendar sync, and email reminders. It’s perfect for freelancers, small businesses, or anyone wanting to try out a powerful scheduling tool without upfront costs.",
    },
    {
        question: "Can I export my data?",
        answer:
            "Definitely. You can export your clients, appointment history, and messages to CSV at any time. Bookable.live believes in full data portability, so you always maintain ownership and control over your information. Data exports make it easy to migrate, back up records, or integrate your booking system with other tools you use.",
    },
    {
        question: "Can I pre-select services for the embed widget?",
        answer:
            "Yes. In your settings, you can choose a specific service, staff, or venue to pre-select. You can also choose between an inline iframe or a popup button that opens the widget in an overlay. The embed code will automatically update with the correct URL parameters, making it easier for your customers to find what they need.",
    },
    {
        question: "What happens if I'm sick or have an emergency?",
        answer:
            "No problem — with a single tap, you can cancel all appointments for the day. Every affected client is automatically notified via email or SMS, so you don't have to contact anyone manually. It's designed for real-life situations where things come up unexpectedly.",
    },
    {
        question: "Can I accept payments for my services?",
        answer:
            "Yes. Bookable.live lets you collect payments directly through your booking page. Clients can pay upfront or leave a deposit using Apple Pay, Google Pay, Visa, Mastercard, and other popular payment methods — making checkout fast and frictionless for both you and your clients.",
    },
];

const faqsDataLV = [
    {
        question: "Vai varu sinhronizēt ar Google Calendar vai Outlook?",
        answer:
            "Jā. Bookable.live piedāvā reāllaika divvirzienu sinhronizāciju ar Google Calendar un Microsoft Outlook. Kad klients veic pierakstu caur jūsu tiešsaistes rezervāciju sistēmu, tas uzreiz parādās jūsu personīgajā kalendārā un automātiski atjaunojas, ja rezervācija tiek mainīta. Tas palīdz izvairīties no dubultām rezervācijām un nodrošina, ka jūsu grafiks vienmēr ir precīzs.",
    },
    {
        question: "Vai atbalstāt vairākus darbiniekus un lokācijas?",
        answer:
            "Protams. Mūsu tiešsaistes pierakstu programmatūra ir piemērota gan individuāliem speciālistiem, gan uzņēmumiem ar vairākām lokācijām. Vari pievienot vairākus darbiniekus, iestatīt katram savu darba laiku, pārvaldīt dažādas adreses un ļaut klientiem izvēlēties speciālistu un vietu tieši rezervācijas lapā. Tas padara visu rezervēšanas procesu skaidru un ērtu.",
    },
    {
        question: "Kā darbojas atgādinājumi?",
        answer:
            "Bookable.live nodrošina automatizētus atgādinājumus, kas palīdz samazināt neierašanās risku. Varat nosūtīt klientiem e-pastu, SMS vai WhatsApp (drīzumā) atgādinājumus iepriekš norādītā laikā. Atgādinājumi darbojas automātiski un palīdz uzturēt sakārtotu grafiku, lai visi pieraksti notiktu bez liekiem pārpratumiem.",
    },
    {
        question: "Vai ir bezmaksas plāns?",
        answer:
            "Jā. Starter plāns ir pilnībā bez maksas un ietver svarīgākās tiešsaistes rezervāciju sistēmas funkcijas — neierobežotus pierakstus, pielāgojamu rezervāciju lapu, kalendāra sinhronizāciju un e-pastu atgādinājumus. Tas ir ideāls risinājums mazajiem uzņēmumiem un speciālistiem, kas vēlas sākt izmantot ērtu pierakstu rīku bez sākotnējām izmaksām.",
    },
    {
        question: "Vai varu eksportēt savus datus?",
        answer:
            "Jā. Jebkurā brīdī vari eksportēt savus klientus, pierakstu vēsturi un sarakstes CSV formātā. Bookable.live nodrošina pilnīgu datu pārnesamību, lai tu vienmēr saglabātu kontroli pār savu informāciju un varētu to izmantot citās sistēmās, veidot rezerves kopijas vai analizēt savu biznesu.",
    },
    {
        question: "Vai varu iepriekš izvēlēties pakalpojumus iegultajam logrīkam?",
        answer:
            "Jā. Iestatījumos varat izvēlēties konkrētu pakalpojumu, darbinieku vai vietu, ko iepriekš atlasīt. Integrācijas kods automātiski atjaunināsies ar pareizajiem parametriem.",
    },
    {
        question: "Kas notiek, ja esmu slims vai man ir ārkārtas situācija?",
        answer:
            "Nav problēmu — ar vienu pieskārienu jūs varat atcelt visus pierakstus dienai. Visiem skartajiem klientiem automātiski tiek nosūtīti paziņojumi pa e-pastu vai SMS, tāpēc jums nav jāsaņem kontakti manuāli. Tas ir paredzēts reālām situācijām, kad rodas neparedzēti notikumi.",
    },
    {
        question: "Vai varu pieņemt maksājumus par saviem pakalpojumiem?",
        answer:
            "Jā. Bookable.live ļauj iekasēt maksājumus tieši caur jūsu rezervāciju lapu. Klienti var samaksāt uzreiz vai atstāt depozītu, izmantojot Apple Pay, Google Pay, Visa, Mastercard un citas populāras maksājumu metodes — padarot norēķinu procesu ātru un ērtu gan jums, gan jūsu klientiem.",
    },
];

const faqsData = isLV ? faqsDataLV : faqsDataEN;

const faqContainer = document.getElementById("faq-container");

// Check if FAQ already has static HTML content (e.g. <details> elements for SEO)
const faqHasStaticContent = faqContainer && faqContainer.children.length > 0;

if (faqContainer && !faqHasStaticContent) {
    faqContainer.innerHTML = faqsData.map((faq, index) => `
    <div class="js-fade-in border-b border-slate-300 dark:border-purple-900 py-4 cursor-pointer w-full" data-index="${index}">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-medium">${faq.question}</h3>
          <!-- ChevronDown icon placeholder -->
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 transition-transform duration-500 ease-in-out" data-chevron><path d="m6 9 6 6 6-6"/></svg>
        </div>
        <p class="faq-answer text-sm text-slate-600 dark:text-slate-300 transition-all duration-500 ease-in-out max-w-xl opacity-0 max-h-0 overflow-hidden -translate-y-2">
          ${faq.answer}
        </p>
      </div>
    `).join("");

    initFadeInOnScroll(faqContainer);
}

// Accordion Logic for FAQ <div> items (static or JS-rendered)
const faqDivItems = document.querySelectorAll("#faq-container > div");

if (faqDivItems && faqDivItems.length) {
    faqDivItems.forEach(item => {
        const chevron = item.querySelector("[data-chevron]");
        const answer = item.querySelector(".faq-answer");

        item.addEventListener("click", () => {
            const isOpen = answer.classList.contains("opacity-100");

            // Close all
            faqDivItems.forEach(i => {
                i.querySelector(".faq-answer").classList.remove("opacity-100", "max-h-[500px]", "translate-y-0", "pt-4");
                i.querySelector(".faq-answer").classList.add("opacity-0", "max-h-0", "-translate-y-2");
                i.querySelector("[data-chevron]").classList.remove("rotate-180");
            });

            // Toggle current
            if (!isOpen) {
                answer.classList.add("opacity-100", "max-h-[500px]", "translate-y-0", "pt-4");
                answer.classList.remove("opacity-0", "max-h-0", "-translate-y-2");
                chevron.classList.add("rotate-180");
            }
        });
    });
}

// UTM propagation for CTAs
// Copies UTM parameters from the page URL to outbound signup/login CTAs
// so campaigns are tracked consistently on app.bookable.live.
(function propagateUTMs() {
    try {
        const current = new URL(window.location.href);
        const pageParams = current.searchParams;
        const utmKeys = [
            "utm_source",
            "utm_medium",
            "utm_campaign",
            "utm_term",
            "utm_content",
            // common ad click ids
            "gclid",
            "fbclid"
        ];

        // Build a map of UTM params present on the current page
        const utmMap = new Map();
        utmKeys.forEach((k) => {
            const v = pageParams.get(k);
            if (v) utmMap.set(k, v);
        });

        // Optionally set a sensible default source if none was provided
        if (!utmMap.has("utm_source")) {
            utmMap.set("utm_source", window.location.hostname || "bookable.live");
        }

        // Enrich with referrers for extra context
        if (document.referrer) {
            utmMap.set("utm_referrer", document.referrer);
        }
        utmMap.set("utm_landing", window.location.href);

        // Update outbound CTAs to app.bookable.live
        const anchors = Array.from(document.querySelectorAll('a[href]'));
        anchors.forEach((a) => {
            const href = a.getAttribute('href');
            // Skip mailto: and in-page anchors
            if (!href || href.startsWith('#') || href.startsWith('mailto:')) return;

            // Only touch links to our app domain (adjust if you have multiple)
            const isAppLink = href.startsWith('https://app.bookable.live') || href.startsWith('http://app.bookable.live');
            if (!isAppLink) return;

            try {
                const url = new URL(href, window.location.origin);
                // Don't overwrite existing params on the destination
                utmMap.forEach((value, key) => {
                    if (!url.searchParams.has(key)) {
                        url.searchParams.set(key, value);
                    }
                });
                a.setAttribute('href', url.toString());
            } catch (_) {
                // ignore invalid URLs
            }
        });
    } catch (e) {
        console.warn('UTM propagation skipped:', e);
    }
})();