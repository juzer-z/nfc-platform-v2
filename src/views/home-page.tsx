import { Link } from "react-router-dom";

const stats = [
  { value: "50,000+", label: "Cards Activated" },
  { value: "2s", label: "Share Time" },
  { value: "100%", label: "No App Needed" },
  { value: "30+", label: "Countries Reached" },
];

const steps = [
  {
    title: "Customise Your Profile",
    body: "Add your name, title, photo, links, and contact details. Update it once and every card reflects the change.",
  },
  {
    title: "Tap Any Smartphone",
    body: "Hold your 1card near any NFC-enabled iPhone or Android phone. No app is needed on either side.",
  },
  {
    title: "They Save Your Contact",
    body: "Your profile opens instantly in the browser, and one tap downloads your contact into their phone.",
  },
  {
    title: "Track Every Connection",
    body: "Measure profile views and engagement so every introduction becomes a real follow-up opportunity.",
  },
];

const features = [
  ["Instant NFC Share", "Tap once and share your complete professional profile in seconds."],
  ["vCard Download", "Recipients save your details directly to contacts on iPhone and Android."],
  ["Live Profile Updates", "Change jobs, numbers, or links once and every card stays current."],
  ["Analytics Dashboard", "Track taps, views, and engagement from your admin dashboard."],
  ["Premium Card Finishes", "Matte, metal, glossy, and premium finishes designed to stand out."],
  ["Team and Enterprise", "Manage multiple profiles with one consistent brand experience."],
];

const cards = [
  ["JL", "Jordan Lee", "CEO / Founder"],
  ["PS", "Priya Sharma", "VP Sales"],
  ["MC", "Marcus Chen", "Lead Designer"],
  ["SW", "Sophie Williams", "Partner / Law"],
  ["RP", "Raj Patel", "CTO"],
  ["AK", "Aria Kim", "Head of Marketing"],
];

const pricing = [
  {
    plan: "Starter",
    price: "$29",
    note: "One-time purchase with free profile forever",
    features: ["1 NFC card", "Digital profile page", "vCard download", "Basic analytics"],
    cta: "Get Started",
    href: "#cta",
    featured: false,
  },
  {
    plan: "Professional",
    price: "$49",
    note: "One-time plus optional pro support",
    features: ["Premium card finish", "Advanced analytics", "Custom branding", "Priority setup"],
    cta: "Order Now",
    href: "https://wa.me/8801886105253?text=Hi%2C%20I%20am%20interested%20in%20the%201card",
    featured: true,
  },
  {
    plan: "Enterprise",
    price: "Custom",
    note: "Volume pricing and dedicated support",
    features: ["Bulk cards", "Team dashboard", "Brand management", "Dedicated account help"],
    cta: "Contact Sales",
    href: "#cta",
    featured: false,
  },
];

const faqs = [
  [
    "Do they need to download an app?",
    "No. When someone taps your card, the profile opens directly in their browser on modern iPhone and Android devices.",
  ],
  [
    "What does the vCard download do?",
    "It lets the recipient save your full contact details directly into their native Contacts app with one tap.",
  ],
  [
    "What if I change jobs or update my number?",
    "Just update your profile in the dashboard and every card you already handed out will show the latest information.",
  ],
  [
    "How long does delivery take?",
    "Standard orders usually ship within 3 to 5 business days, with faster options available for urgent orders.",
  ],
];

export function HomePage() {
  return (
    <div className="landing-page min-h-screen bg-[#050508] text-[#f0f0f8]">
      <div className="landing-noise pointer-events-none fixed inset-0 z-0 opacity-40" />
      <div className="landing-glow landing-glow-a" />
      <div className="landing-glow landing-glow-b" />

      <nav className="sticky top-0 z-40 border-b border-white/8 bg-[#050508]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <a
            href="#hero"
            className="font-['Space_Grotesk',sans-serif] text-[1.35rem] font-bold tracking-[-0.03em] text-white"
          >
            <span className="bg-[linear-gradient(135deg,#fff_0%,#88ecff_100%)] bg-clip-text text-transparent">
              1card.fyi
            </span>
          </a>

          <div className="hidden items-center gap-7 text-sm font-medium text-white/60 md:flex">
            <a href="#how" className="transition hover:text-white">
              How It Works
            </a>
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#pricing" className="transition hover:text-white">
              Pricing
            </a>
            <Link
              to="/admin/login"
              className="transition hover:text-white"
            >
              Admin
            </Link>
            <a
              href="https://wa.me/8801886105253?text=Hi%2C%20I%20am%20interested%20in%20the%201card"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-cyan-300 px-4 py-2 font-semibold text-black transition hover:bg-white"
            >
              Get Yours
            </a>
          </div>
        </div>
      </nav>

      <section
        id="hero"
        className="relative z-10 overflow-hidden px-4 pb-20 pt-20 sm:px-6 sm:pt-28"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-300 sm:text-xs">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.85)]" />
            NFC-Powered Business Cards
          </div>

          <h1 className="mt-8 max-w-5xl font-['Space_Grotesk',sans-serif] text-5xl font-extrabold leading-[0.95] tracking-[-0.06em] text-white sm:text-7xl lg:text-[6.7rem]">
            <span className="landing-gradient-text">One Tap.</span>
            <br />
            <span className="landing-gradient-text">Infinite</span>
            <br />
            <span className="landing-gradient-text">Impressions.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/60 sm:text-xl">
            Share your <span className="font-medium text-white">complete professional profile</span>
            {" "}instantly. No app. No paper. No friction. Just tap and connect.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#pricing"
              className="rounded-2xl bg-cyan-300 px-6 py-3.5 text-base font-bold text-black transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_0_36px_rgba(103,232,249,0.35)]"
            >
              Order Your Card
            </a>
            <a
              href="#how"
              className="rounded-2xl border border-white/10 bg-white/4 px-6 py-3.5 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/8"
            >
              See How It Works
            </a>
          </div>

          <div className="mt-16 perspective-[1200px]">
            <div className="landing-hero-card relative h-[212px] w-[340px] overflow-hidden rounded-[22px] border border-white/12 bg-[linear-gradient(135deg,#17192e_0%,#13203f_45%,#0f3560_100%)] shadow-[0_40px_90px_rgba(0,0,0,0.65)]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_0%,transparent_45%,rgba(103,232,249,0.06)_100%)]" />
              <div className="landing-sweep absolute inset-0" />
              <div className="absolute left-6 top-6 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 font-['Space_Grotesk',sans-serif] text-sm font-semibold text-white/85">
                AM
              </div>
              <div className="absolute right-6 top-6 text-white/55">)))</div>
              <div className="absolute bottom-11 left-6 text-[1.05rem] font-medium text-white/95">
                Alex Morgan
              </div>
              <div className="absolute bottom-7 left-6 text-[0.62rem] font-medium uppercase tracking-[0.28em] text-white/35">
                Head of Product / Apex Corp
              </div>
              <div className="absolute bottom-5 right-6 font-['Space_Grotesk',sans-serif] text-[0.65rem] text-white/25">
                1card.fyi
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/8 bg-white/[0.02] px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 text-center sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="font-['Space_Grotesk',sans-serif] text-3xl font-extrabold tracking-[-0.04em] text-transparent sm:text-4xl landing-gradient-text">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-white/45">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="relative z-10 bg-[#0d0d14] px-4 py-24 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="landing-label">How It Works</div>
            <h2 className="mt-4 font-['Space_Grotesk',sans-serif] text-4xl font-extrabold leading-tight tracking-[-0.04em] text-white sm:text-5xl">
              From tap to contact
              <br />
              <span className="text-cyan-300">in under 2 seconds</span>
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/55">
              No apps to download. No QR codes to scan. Just a simple tap and your full profile lands on their phone.
            </p>

            <div className="mt-10 space-y-7">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 font-['Space_Grotesk',sans-serif] text-sm font-bold text-cyan-300">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-['Space_Grotesk',sans-serif] text-xl font-bold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-7 text-white/50 sm:text-base">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-[999px] bg-cyan-300/10 blur-[60px]" />
              <div className="relative h-[500px] w-[255px] overflow-hidden rounded-[38px] border border-white/12 bg-[#090912] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.7)]">
                <div className="mx-auto h-7 w-28 rounded-b-[18px] border border-white/8 border-t-0 bg-[#090912]" />
                <div className="mt-4 flex h-full flex-col rounded-[28px] bg-[linear-gradient(180deg,#0d0d1a_0%,#060610_100%)] px-4 pb-5 pt-6">
                  <div className="mx-auto flex h-[74px] w-[74px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#67e8f9_0%,#8b5cf6_100%)] font-['Space_Grotesk',sans-serif] text-2xl font-extrabold text-black shadow-[0_0_35px_rgba(103,232,249,0.3)]">
                    AM
                  </div>
                  <div className="mt-4 text-center font-['Space_Grotesk',sans-serif] text-lg font-bold text-white">
                    Alex Morgan
                  </div>
                  <div className="mt-1 text-center text-xs text-white/45">
                    Head of Product / Apex Corp
                  </div>
                  <div className="mt-5 space-y-3">
                    {["LinkedIn profile", "alex@apexcorp.com", "+1 (555) 000-1234", "apexcorp.com"].map((item) => (
                      <div
                        key={item}
                        className="rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white/85"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto rounded-xl bg-cyan-300 px-4 py-3 text-center text-sm font-bold text-black shadow-[0_0_28px_rgba(103,232,249,0.28)]">
                    Save to Contacts
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="landing-label justify-center">Features</div>
          <h2 className="mt-4 font-['Space_Grotesk',sans-serif] text-4xl font-extrabold leading-tight tracking-[-0.04em] text-white sm:text-5xl">
            Everything a business card
            <br />
            should have been
          </h2>
          <p className="mt-5 text-lg leading-8 text-white/55">
            Built for professionals who move fast and want every introduction to feel modern.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-[28px] border border-white/8 bg-white/8 md:grid-cols-2 xl:grid-cols-3">
          {features.map(([title, body], index) => (
            <div key={title} className="bg-[#0d0d14] p-8 transition hover:bg-[#12121c]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/6 text-lg font-bold text-cyan-300">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="font-['Space_Grotesk',sans-serif] text-xl font-bold text-white">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/50 sm:text-base">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="cards" className="relative z-10 overflow-hidden bg-[#0d0d14] px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="landing-label justify-center">Card Designs</div>
          <h2 className="mt-4 font-['Space_Grotesk',sans-serif] text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl">
            Cards that make
            <br />
            <span className="text-cyan-300">a statement</span>
          </h2>
          <p className="mt-5 text-lg leading-8 text-white/55">
            Premium materials and sharp finishes designed to make people ask where you got it.
          </p>
        </div>

        <div className="landing-marquee mt-14">
          <div className="landing-marquee-track">
            {[...cards, ...cards].map(([mono, name, role], index) => (
              <div
                key={`${name}-${index}`}
                className="relative h-[172px] w-[280px] shrink-0 overflow-hidden rounded-[18px] border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#111827_100%)] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.35)]"
              >
                <div className="landing-sweep absolute inset-0 opacity-60" />
                <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/8 font-['Space_Grotesk',sans-serif] text-xs font-semibold text-white/75">
                  {mono}
                </div>
                <div className="absolute right-5 top-5 text-white/40">)))</div>
                <div className="absolute bottom-10 left-5 text-[0.95rem] font-medium text-white/92">
                  {name}
                </div>
                <div className="absolute bottom-5 left-5 text-[0.62rem] uppercase tracking-[0.28em] text-white/30">
                  {role}
                </div>
                <div className="absolute bottom-5 right-5 font-['Space_Grotesk',sans-serif] text-[0.65rem] text-white/20">
                  1card.fyi
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="relative z-10 mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="landing-label justify-center">Pricing</div>
          <h2 className="mt-4 font-['Space_Grotesk',sans-serif] text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl">
            Simple. No
            <br />
            <span className="text-cyan-300">surprises.</span>
          </h2>
          <p className="mt-5 text-lg leading-8 text-white/55">
            One card. Unlimited taps. A better first impression every time.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {pricing.map((item) => (
            <div
              key={item.plan}
              className={[
                "rounded-[28px] border p-8 text-left transition hover:-translate-y-1",
                item.featured
                  ? "border-cyan-300/25 bg-[linear-gradient(135deg,rgba(34,211,238,0.08)_0%,rgba(124,58,237,0.08)_100%)] shadow-[0_0_60px_rgba(34,211,238,0.08)]"
                  : "border-white/8 bg-[#0d0d14]",
              ].join(" ")}
            >
              {item.featured ? (
                <div className="mb-4 inline-flex rounded-full bg-cyan-300 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-black">
                  Most Popular
                </div>
              ) : null}
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-white/45">
                {item.plan}
              </div>
              <div className="mt-4 font-['Space_Grotesk',sans-serif] text-5xl font-extrabold tracking-[-0.05em] text-white">
                {item.price}
              </div>
              <div className="mt-3 text-sm leading-7 text-white/50">{item.note}</div>
              <div className="my-6 h-px bg-white/8" />
              <ul className="space-y-3 text-sm text-white/80">
                {item.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              <a
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className={[
                  "mt-8 block rounded-2xl px-5 py-3 text-center text-sm font-bold transition",
                  item.featured
                    ? "bg-cyan-300 text-black hover:bg-white"
                    : "border border-white/10 bg-white/4 text-white hover:bg-white/8",
                ].join(" ")}
              >
                {item.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="relative z-10 mx-auto max-w-4xl px-4 py-24 sm:px-6">
        <div className="text-center">
          <div className="landing-label justify-center">FAQ</div>
          <h2 className="mt-4 font-['Space_Grotesk',sans-serif] text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl">
            Questions,
            <br />
            <span className="text-cyan-300">answered</span>
          </h2>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map(([question, answer]) => (
            <details
              key={question}
              className="group rounded-[22px] border border-white/8 bg-[#0d0d14] p-6"
            >
              <summary className="cursor-pointer list-none font-['Space_Grotesk',sans-serif] text-lg font-bold text-white">
                {question}
              </summary>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55 sm:text-base">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section id="cta" className="relative z-10 px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[34px] border border-cyan-300/12 bg-[linear-gradient(135deg,rgba(34,211,238,0.08)_0%,rgba(11,18,32,0.95)_40%,rgba(124,58,237,0.08)_100%)] px-6 py-14 text-center shadow-[0_25px_90px_rgba(0,0,0,0.45)] sm:px-10">
          <div className="landing-label justify-center">Ready?</div>
          <h2 className="mt-4 font-['Space_Grotesk',sans-serif] text-4xl font-extrabold leading-tight tracking-[-0.05em] text-white sm:text-6xl">
            Your last business card.
            <br />
            <span className="text-cyan-300">Ever.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/55">
            Join founders, executives, and teams who upgraded from paper to a smarter first impression.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://wa.me/8801886105253?text=Hi%2C%20I%20am%20interested%20in%20the%201card"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-cyan-300 px-6 py-3.5 text-base font-bold text-black transition hover:bg-white"
            >
              Order Your 1card
            </a>
            <a
              href="#how"
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/8"
            >
              See How It Works
            </a>
          </div>
          <p className="mt-6 text-sm text-white/40">
            Free shipping on qualifying orders / 30-day satisfaction guarantee
          </p>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/8 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-white/40 md:flex-row md:items-center md:justify-between">
          <a href="#hero" className="font-['Space_Grotesk',sans-serif] text-lg font-bold text-white">
            1card.fyi
          </a>
          <div className="flex flex-wrap gap-5">
            <a href="#how" className="transition hover:text-white">
              How It Works
            </a>
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#pricing" className="transition hover:text-white">
              Pricing
            </a>
          </div>
          <div>
            Designed and developed by{" "}
            <a href="https://3jtec.com" target="_blank" rel="noreferrer" className="text-cyan-300">
              3J Technologies
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
