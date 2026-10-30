const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const root = document.documentElement, body = document.body;

// 1. Your editable details come from <body data-phone data-email data-form>
const { phone, email, form: formUrl } = body.dataset;
$$("[data-wa]").forEach((a) => {
    if (/^\d{10,15}$/.test(phone)) {
        a.href = "https://wa.me/" + phone + "?text=" + encodeURIComponent("Hi HARNEXA, I would like to discuss a project.");
        a.target = "_blank"; a.rel = "noopener";
    } else {
        a.addEventListener("click", (e) => { e.preventDefault(); alert("WhatsApp number not added yet. Open index.html and edit data-phone in the <body> tag."); });
    }
});
$$("[data-mail]").forEach((a) => { a.href = "mailto:" + email + "?subject=HARNEXA%20Project%20Enquiry"; a.textContent = email; });
$("#contactForm").action = formUrl;

// 2. Loader, then start the hero animations
addEventListener("load", () => setTimeout(() => { $("#loader").classList.add("done"); root.classList.add("ready"); }, reduce ? 0 : 1500));

// 3. Split hero text into letters and words
function split(el, letters) {
    const text = el.textContent.trim(); el.textContent = "";
    (letters ? [...text] : text.split(" ")).forEach((part, i) => {
        const s = document.createElement("span");
        s.className = letters ? "ch" : "w"; s.style.setProperty("--i", i); s.textContent = part;
        if (letters) s.setAttribute("aria-hidden", "true");
        el.append(s); if (!letters) el.append(" ");
    });
}
if (!reduce) { split($(".split"), true); split($(".words"), false); }

// 4. Menu, header, back-to-top
const nav = $("#nav"), toggle = $("#navToggle"), header = $(".site-header"), topBtn = $(".fab.top");
toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open); toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});
$$("a", nav).forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }));
const onScroll = () => { header.classList.toggle("scrolled", scrollY > 40); topBtn.classList.toggle("show", scrollY > 700); };
addEventListener("scroll", onScroll, { passive: true }); onScroll();
topBtn.addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));
const links = $$("a", nav);
const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach((s) => spy.observe(s));

// 5. Scroll reveal (cards appear one after another) + counters
function count(n) {
    const to = +n.dataset.count; if (reduce) return;
    const t0 = performance.now();
    (function step(t) { const p = Math.min((t - t0) / 1400, 1); n.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(t0);
}
if (!reduce) $$("[data-count]").forEach((n) => (n.textContent = "0"));
$$(".grid, .steps, .stats").forEach((g) => $$(":scope > .rv", g).forEach((e, i) => (e.style.transitionDelay = i * 90 + "ms")));
const reveal = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const t = e.target; t.classList.add("in");
    setTimeout(() => (t.style.transitionDelay = ""), 1200);
    const n = $("[data-count]", t); if (n) count(n);
    reveal.unobserve(t);
}), { threshold: 0.15 });
$$(".rv").forEach((e) => reveal.observe(e));

// 6. Project filter
$$(".filters button").forEach((btn) => btn.addEventListener("click", () => {
    $$(".filters button").forEach((b) => b.setAttribute("aria-pressed", b === btn));
    $$(".proj").forEach((p) => (p.hidden = !(btn.dataset.f === "all" || p.dataset.cat === btn.dataset.f)));
}));

// 7. Mouse light, card spotlight, hero parallax (desktop only)
if (fine && !reduce) {
    const glow = $("#glow"), scene = $(".scene"); let x = 0, y = 0, queued = 0;
    addEventListener("mousemove", (e) => {
        x = e.clientX; y = e.clientY; glow.style.opacity = 1;
        if (!queued) queued = requestAnimationFrame(() => { glow.style.transform = "translate(" + x + "px," + y + "px)"; queued = 0; });
        scene.style.translate = (x / innerWidth - 0.5) * -26 + "px " + (y / innerHeight - 0.5) * -26 + "px";
    });
    $$(".card").forEach((c) => c.addEventListener("mousemove", (e) => {
        const r = c.getBoundingClientRect();
        c.style.setProperty("--x", e.clientX - r.left + "px"); c.style.setProperty("--y", e.clientY - r.top + "px");
    }));
}

// 8. Contact form: validation, then send to Formspree
const f = $("#contactForm"), st = $("#formStatus");
f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fields = $$("[required]", f);
    fields.forEach((i) => i.setAttribute("aria-invalid", !i.checkValidity()));
    const bad = fields.find((i) => !i.checkValidity());
    if (bad) { st.className = "err"; st.textContent = "Please check: " + (bad.labels[0] ? bad.labels[0].textContent.slice(0, 40) : "this field") + "."; bad.focus(); return; }
    if (f.action.includes("YOUR_FORM_ID")) { st.className = "err"; st.textContent = "The form is not connected yet. Add your Formspree link in the <body> tag of index.html."; return; }
    st.className = ""; st.textContent = "Sending...";
    try {
        const r = await fetch(f.action, { method: "POST", body: new FormData(f), headers: { Accept: "application/json" } });
        if (!r.ok) throw new Error();
        f.reset(); st.className = "ok"; st.textContent = "Thank you! Your enquiry has been sent. We will reply by email soon.";
    } catch { st.className = "err"; st.textContent = "Could not send. Please use the email or WhatsApp option."; }
});

// 9. Footer year
$("#year").textContent = new Date().getFullYear();