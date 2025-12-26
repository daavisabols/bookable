// Path & locale helpers
const isLV = (document.documentElement.getAttribute("lang") || "").toLowerCase() === "lv" || window.location.pathname.includes("/lv/");
const ASSET_ROOT = window.location.pathname.includes("/lv/") ? ".." : ".";

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

// Fixed prices per currency (edit these exact numbers to match your billing)
// Base (EUR) comes from pricingData below; overrides only apply when currency != EUR.
const PRICE_OVERRIDES = {
    USD: { pro: { monthly: 9, yearly: 90 } },
    GBP: { pro: { monthly: 9, yearly: 90 } },
};

const formatMoney = (amount) => {
    const n = Number(amount);
    if (!Number.isFinite(n)) return "";

    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
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
    openMenu.addEventListener("click", () => {
        mobileMenu.classList.remove("-translate-x-full");
        document.body.classList.add("overflow-hidden");
        navbar.classList.remove("backdrop-blur");
    });

    closeMenu.addEventListener("click", () => {
        mobileMenu.classList.add("-translate-x-full");
        document.body.classList.remove("overflow-hidden");
        navbar.classList.add("backdrop-blur");
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

const logos = ["google", "microsoft", "whatsapp", "apple"];
const track = document.getElementById("logo-track");

if (track) {
    track.innerHTML = [...logos, ...logos]
        .map((name) => {
            const size = name === 'whatsapp' || name === 'apple' ? 50 : 100;
            return `<img class="mx-11" src="${ASSET_ROOT}/assets/companies-logo/${name}.svg" onerror="this.onerror=null;this.src='https://cdn.simpleicons.org/${name}';" alt="${name.charAt(0).toUpperCase() + name.slice(1)} logo" width="${size}" height="${size}" loading="lazy" decoding="async" draggable="false"/>`;
        })
        .join("");
}



const featuresDataEN = [
    {
        icon: `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' fill='none' stroke='currentColor' stroke-width='1.25' stroke-linecap='round' stroke-linejoin='round' class='text-purple-600 size-8'><path d='M8 2h8l6 6v12a2 2 0 0 1-2 2H8a6 6 0 0 1-6-6V8a6 6 0 0 1 6-6Z'/><path d='M15 2v6h6'/></svg>`,
        title: "Branded booking pages",
        description: "Share a beautiful booking link with your brand, services, prices, and live availability.",
    },
    {
        icon: `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' fill='none' stroke='currentColor' stroke-width='1.25' stroke-linecap='round' stroke-linejoin='round' class='text-purple-600 size-8'><path d='M3 3h7v7H3z'/><path d='M14 3h7v7h-7z'/><path d='M14 14h7v7h-7z'/><path d='M3 14h7v7H3z'/></svg>`,
        title: "Calendar sync",
        description: "Two‑way sync with Google Calendar and Microsoft Outlook prevents double‑bookings.",
    },
    {
        icon: `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' fill='none' stroke='currentColor' stroke-width='1.25' stroke-linecap='round' stroke-linejoin='round' class='text-purple-600 size-8'><path d='M12 12a5 5 0 1 0-5-5'/><path d='M12 12v9'/><path d='M7 21h10'/><path d='M5 8h6'/><path d='m17 16 3-3-3-3'/></svg>`,
        title: "Staff & multi‑venue",
        description: "Assign services to specific team members and locations. Let clients choose or auto‑assign.",
    },
    {
        icon: `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' fill='none' stroke='currentColor' stroke-width='1.25' stroke-linecap='round' stroke-linejoin='round' class='text-purple-600 size-8'><path d='M2 12h4l3 9 6-18 3 9h4'/></svg>`,
        title: "Automated reminders",
        description: "Reduce no‑shows with email, SMS, and WhatsApp reminders sent at smart intervals.",
    },
    {
        icon: `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' fill='none' stroke='currentColor' stroke-width='1.25' stroke-linecap='round' stroke-linejoin='round' class='text-purple-600 size-8'><path d='M3 3h18v4H3z'/><path d='M8 11h13v4H8z'/><path d='M13 19h8v4h-8z'/><path d='M3 7v14h5'/></svg>`,
        title: "Analytics & exports",
        description: "Track bookings, cancellations, revenue and export clients & appointments to CSV.",
    },
];

const featuresDataLV = [
    {
        icon: `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' fill='none' stroke='currentColor' stroke-width='1.25' stroke-linecap='round' stroke-linejoin='round' class='text-purple-600 size-8'><path d='M8 2h8l6 6v12a2 2 0 0 1-2 2H8a6 6 0 0 1-6-6V8a6 6 0 0 1 6-6Z'/><path d='M15 2v6h6'/></svg>`,
        title: "Zīmola rezervāciju lapas",
        description: "Kopīgo skaistu rezervācijas saiti ar zīmolu, pakalpojumiem, cenām un tiešsaistes pieejamību.",
    },
    {
        icon: `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' fill='none' stroke='currentColor' stroke-width='1.25' stroke-linecap='round' stroke-linejoin='round' class='text-purple-600 size-8'><path d='M3 3h7v7H3z'/><path d='M14 3h7v7h-7z'/><path d='M14 14h7v7h-7z'/><path d='M3 14h7v7H3z'/></svg>`,
        title: "Kalendāru sinhronizācija",
        description: "Divvirzienu sinhronizācija ar Google Calendar un Microsoft Outlook novērš dubultas rezervācijas.",
    },
    {
        icon: `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' fill='none' stroke='currentColor' stroke-width='1.25' stroke-linecap='round' stroke-linejoin='round' class='text-purple-600 size-8'><path d='M12 12a5 5 0 1 0-5-5'/><path d='M12 12v9'/><path d='M7 21h10'/><path d='M5 8h6'/><path d='m17 16 3-3-3-3'/></svg>`,
        title: "Personāls un vairākas vietas",
        description: "Piesaisti pakalpojumus konkrētiem darbiniekiem un lokācijām. Ļauj klientiem izvēlēties vai auto‑piešķirt.",
    },
    {
        icon: `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' fill='none' stroke='currentColor' stroke-width='1.25' stroke-linecap='round' stroke-linejoin='round' class='text-purple-600 size-8'><path d='M2 12h4l3 9 6-18 3 9h4'/></svg>`,
        title: "Automatizēti atgādinājumi",
        description: "Samazini neierašanos ar e‑pastu un WhatsApp atgādinājumiem gudros intervālos.",
    },
    {
        icon: `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' fill='none' stroke='currentColor' stroke-width='1.25' stroke-linecap='round' stroke-linejoin='round' class='text-purple-600 size-8'><path d='M3 3h18v4H3z'/><path d='M8 11h13v4H8z'/><path d='M13 19h8v4h-8z'/><path d='M3 7v14h5'/></svg>`,
        title: "Analītika un eksporti",
        description: "Seko rezervācijām, atcelšanām, ieņēmumiem un eksportē klientus & pierakstus uz CSV.",
    },
];

const featuresData = isLV ? featuresDataLV : featuresDataEN;

const features = document.getElementById("features");
if (features) {
    features.innerHTML = featuresData.map((f) => `
        <div class='p-6 border border-slate-200 dark:border-slate-700 rounded-2xl text-left bg-white/70 dark:bg-slate-900/30 space-y-3'>
            ${f.icon}
            <h3 class='text-lg font-semibold'>${f.title}</h3>
            <p class='text-sm text-slate-600 dark:text-slate-300'>${f.description}</p>
        </div>
    `).join("");
}


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
        priceMonthly: 9,
        priceYearly: 90,
        mostPopular: true,
        features: [
            "Everything in Regular",
            "Multiple Calendar integrations",
            "Custom messaging & reminder templates",
            "Custom branding",
            "WhatsApp & SMS reminders",
            "Multiple Staff Members & Venues",
            "Smart Rescheduling"
        ],
        buttonText: "Upgrade Now",
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
        priceMonthly: 9,
        priceYearly: 90,
        mostPopular: true,
        features: [
            "Viss, kas ietverts Regular plānā",
            "Vairāku kalendāru integrācijas",
            "Pielāgojami ziņojumi un atgādinājumu veidnes",
            "Pielāgota zīmola identitāte",
            "WhatsApp un SMS atgādinājumi",
            "Vairāki darbinieku konti un lokācijas",
            "Gudra pārcelšana"
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
        if (cadence === "yearly") return isLV ? "/gadā" : "/yr";
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
            const priceLabel = formatMoney(price);

                return `
            <div class="p-6 rounded-2xl w-full shadow-[0px_4px_26px] shadow-black/6 flex flex-col h-full 
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
                    <a href="https://app.bookable.live/" class="transition w-full py-3 rounded-full font-medium block w-full text-center
                        ${plan.mostPopular
                                ? "bg-white hover:bg-slate-100 text-slate-800"
                                : "bg-purple-600 hover:bg-purple-700 text-white"}">
                        ${plan.buttonText}
                    </a>
                </div>
            </div>
        `;
        }).join("");
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
      "Bookable.live includes built-in automated reminders to reduce no-shows and keep your schedule running smoothly. You can set smart reminders via email, SMS, or WhatsApp, delivered at the ideal time before an appointment. The system sends notifications automatically, so your clients always remember their bookings and your business saves valuable time.",
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
      "Bookable.live nodrošina automatizētus atgādinājumus, kas palīdz samazināt neierašanās risku. Varat nosūtīt klientiem e-pastu, SMS vai WhatsApp atgādinājumus iepriekš norādītā laikā. Atgādinājumi darbojas automātiski un palīdz uzturēt sakārtotu grafiku, lai visi pieraksti notiktu bez liekiem pārpratumiem.",
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
];

const faqsData = isLV ? faqsDataLV : faqsDataEN;

const faqContainer = document.getElementById("faq-container");

if (faqContainer) {
faqContainer.innerHTML = faqsData.map((faq, index) => `
      <div class="border-b border-slate-300 dark:border-purple-900 py-4 cursor-pointer w-full" data-index="${index}">
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
}

// Accordion Logic
const faqItems = document.querySelectorAll("#faq-container > div");

if (faqItems && faqItems.length) {
    faqItems.forEach(item => {
        const chevron = item.querySelector("[data-chevron]");
        const answer = item.querySelector(".faq-answer");

        item.addEventListener("click", () => {
            const isOpen = answer.classList.contains("opacity-100");

            // Close all
            faqItems.forEach(i => {
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