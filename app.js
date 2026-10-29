/* CHERUBIN'S Tax Services — public booking app */
(function () {
  const C = window.CTS_CONFIG, I = window.ICONS, DICT = window.I18N;
  const LOC = { en: "en-US", es: "es-US", fr: "fr-CA" };
  const $ = (s, r = document) => r.querySelector(s);
  const app = $("#app");

  // ---------- state ----------
  const S = {
    lang: "en", settings: null, offices: [], services: [], schedules: [], loaded: false, loadErr: false,
    b: freshBooking(),
    m: freshManage(),
    result: null, // {kind, appt}
  };
  function freshBooking() { return { step: 0, office: null, service: null, month: null, date: null, time: null, slots: null, remaining: null, name: "", phone: "", email: "", terms: false, err: "", busy: false }; }
  function freshManage() { return { code: "", email: "", token: null, appt: null, mode: "find", intent: null, office: null, month: null, date: null, time: null, slots: null, remaining: null, err: "", busy: false, payNote: "", payOk: false }; }

  // ---------- i18n ----------
  try { const p = new URLSearchParams(location.search).get("lang"); const saved = localStorage.getItem("cts_lang"); S.lang = DICT[p] ? p : DICT[saved] ? saved : "en"; } catch (e) {}
  const t = (k, vars) => { let s = (DICT[S.lang] && DICT[S.lang][k]) ?? DICT.en[k] ?? k; if (vars && typeof s === "string") for (const v in vars) s = s.replace("{" + v + "}", vars[v]); return s; };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function setLang(l) {
    S.lang = l; try { localStorage.setItem("cts_lang", l); } catch (e) {}
    document.documentElement.lang = l; chrome(); render();
  }

  // ---------- api ----------
  const H = { apikey: C.SUPABASE_ANON_KEY, Authorization: "Bearer " + C.SUPABASE_ANON_KEY, "Content-Type": "application/json" };
  async function rest(path) { const r = await fetch(C.SUPABASE_URL + "/rest/v1/" + path, { headers: H }); if (!r.ok) throw new Error("load"); return r.json(); }
  async function rpc(fn, args) {
    const r = await fetch(C.SUPABASE_URL + "/rest/v1/rpc/" + fn, { method: "POST", headers: H, body: JSON.stringify(args || {}) });
    const body = await r.json().catch(() => null);
    if (!r.ok) { const code = (body && body.message) || "generic"; const e = new Error(code); e.code = code; throw e; }
    return body;
  }
  const errMsg = (e) => { const k = "err_" + (e && e.code); return DICT.en[k] ? t(k) : t("err_generic"); };

  // ---------- formatting ----------
  const todayET = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
  const fmtDate = (iso) => new Date(iso + "T12:00:00Z").toLocaleDateString(LOC[S.lang], { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
  const fmtTime = (hm) => { const [h, m] = hm.split(":").map(Number); return new Date(Date.UTC(2000, 0, 1, h, m)).toLocaleTimeString(LOC[S.lang], { hour: "numeric", minute: "2-digit", timeZone: "UTC" }); };
  const money = (n) => n == null ? null : new Intl.NumberFormat(LOC[S.lang], { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol" }).format(n);
  const office = (id) => S.offices.find((o) => o.id === id);
  const service = (id) => S.services.find((s) => s.id === id);
  const officeName = (id) => t("office_" + id) !== "office_" + id ? t("office_" + id) : (office(id) || {}).name || id;
  const svcName = (id) => { const s = service(id); return s ? (s.name[S.lang] || s.name.en) : id; };
  const manageLink = (token) => location.origin + location.pathname + "?manage=" + token;
  const tel = (p) => "+1" + String(p).replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");

  // ---------- shared pieces ----------
  function contactRow(compact) {
    const s = S.settings || {}; const ph = s.phone || "215-954-7479"; const em = s.email || "alexcherubin25@gmail.com"; const wa = s.whatsapp || "12159547479";
    return `<div class="contact-row ${compact ? "compact" : ""}">
      <a class="cbtn" href="https://wa.me/${esc(wa)}?text=${encodeURIComponent(t("wa_msg"))}" target="_blank" rel="noopener"><span class="ci wa">${I.whatsapp}</span>${t("c_whatsapp")}</a>
      <a class="cbtn" href="sms:${tel(ph)}"><span class="ci sms">${I.sms}</span>${t("c_sms")}</a>
      <a class="cbtn" href="tel:${tel(ph)}"><span class="ci call">${I.phone}</span>${t("c_call")}</a>
      <a class="cbtn" href="mailto:${esc(em)}"><span class="ci mail">${I.mail}</span>${t("c_email")}</a>
    </div>`;
  }
  function badge(kind, v) { return `<span class="badge b-${esc(v)}">${esc(t((kind === "ps" ? "ps_" : "st_") + v))}</span>`; }
  function summary(a) {
    const o = office(a.office_id) || {};
    const rows = [
      [t("conf_number"), `<span class="code">${esc(a.code)}</span>`],
      [t("name"), esc(a.full_name)],
      [t("office"), esc(officeName(a.office_id)) + (o.address ? `<br><span class="muted small">${esc(o.address)}</span>` : "") + `<br><span class="muted small">${esc(o.phone || "")}</span>`],
      [t("service"), esc(svcName(a.service_id))],
      [t("date"), esc(fmtDate(a.date))],
      [t("time"), esc(fmtTime(a.time)) + ' <span class="muted small">ET</span>'],
      [t("status"), badge("st", a.status)],
    ];
    if (a.service_id === "consult" || a.payment_status !== "not_required") rows.push([t("payment_status"), badge("ps", a.payment_status)]);
    return `<table class="sum">${rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}</table>`;
  }
  function cashBtn() { return `<a class="btn btn-cash" href="${esc((S.settings || {}).cashapp_url || "https://cash.app/$Eyenamik1")}" target="_blank" rel="noopener">${I.cash}${t("pay_btn")}</a>`; }
  function modal(html) { $("#modalRoot").innerHTML = `<div class="modal-bg" data-close="1"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`; }
  function closeModal() { $("#modalRoot").innerHTML = ""; }

  // ---------- calendar ----------
  const availCache = {}; const inflight = {};
  async function loadMonth(officeId, month, exclude) {
    const key = officeId + "|" + month + "|" + (exclude || "");
    const [y, m] = month.split("-").map(Number);
    const first = month + "-01"; const last = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
    const today = todayET(); const from = first < today ? today : first;
    if (from > last) { availCache[key] = {}; return; }
    const rows = await rpc("get_availability", { p_office: officeId, p_from: from, p_to: last, p_exclude_code: exclude || null });
    const map = {}; (rows || []).forEach((r) => (map[r.day] = r)); availCache[key] = map;
  }
  function calendar(st, officeId, exclude, prefix) {
    const key = officeId + "|" + st.month + "|" + (exclude || "");
    const map = availCache[key];
    const [y, m] = st.month.split("-").map(Number);
    const startDow = new Date(Date.UTC(y, m - 1, 1)).getUTCDay(); const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const curMonth = todayET().slice(0, 7);
    const maxDate = new Date(Date.now() + ((S.settings && S.settings.booking_window_days) || 60) * 864e5).toISOString().slice(0, 7);
    let cells = t("wdays").map((w) => `<div class="wd">${w}</div>`).join("");
    for (let i = 0; i < startDow; i++) cells += "<div></div>";
    let any = false;
    for (let d = 1; d <= days; d++) {
      const iso = `${st.month}-${String(d).padStart(2, "0")}`; const r = map && map[iso];
      const has = r && r.free_slots > 0 && r.remaining > 0; const full = r && r.remaining === 0 && r.free_slots >= 0 && iso >= todayET();
      if (has) any = true;
      const fullSched = r && r.remaining === 0;
      cells += `<button type="button" class="day ${st.date === iso ? "sel" : ""} ${fullSched ? "full" : ""}" data-act="${prefix}-day" data-d="${iso}" ${has ? "" : "disabled"} aria-label="${esc(fmtDate(iso))}">${d}${has ? `<small>${esc(t("spots_left_short", { n: r.remaining }))}</small>` : ""}</button>`;
    }
    const label = `${t("months")[m - 1]} ${y}`;
    return `<div class="cal">
      <div class="cal-head">
        <button type="button" class="cal-nav" data-act="${prefix}-mprev" ${st.month <= curMonth ? "disabled" : ""} aria-label="prev">${I.left}</button>
        <b>${esc(label)}</b>
        <button type="button" class="cal-nav" data-act="${prefix}-mnext" ${st.month >= maxDate ? "disabled" : ""} aria-label="next">${I.right}</button>
      </div>
      ${map ? `<div class="cal-grid">${cells}</div>${!any ? `<p class="muted small">${t("no_dates")}</p>` : ""}` : `<p class="muted"><span class="spinner"></span> ${t("loading")}</p>`}
      <p class="muted small">${t("times_tz")}</p>
    </div>`;
  }
  function slotsBlock(st, prefix) {
    if (!st.date) return "";
    if (st.slots == null) return `<p class="muted"><span class="spinner"></span> ${t("loading")}</p>`;
    const total = (S.settings && S.settings.daily_limit) || 10;
    if (st.remaining === 0) return `<div class="notice warn">${t("day_full")}</div>`;
    if (!st.slots.length) return `<div class="notice warn">${t("no_times")}</div>`;
    return `<h3>${t("choose_time")}</h3><p class="muted small">${esc(fmtDate(st.date))} · ${esc(t("spots_left", { n: st.remaining, total }))}</p>
      <div class="slots">${st.slots.map((s) => `<button type="button" class="slot ${st.time === s ? "sel" : ""}" data-act="${prefix}-slot" data-t="${s}">${esc(fmtTime(s))}</button>`).join("")}</div>`;
  }
  async function pickDay(st, officeId, iso, exclude) {
    st.date = iso; st.time = null; st.slots = null; st.remaining = null; render();
    try { const r = await rpc("get_slots", { p_office: officeId, p_date: iso, p_exclude_code: exclude || null }); if (st.date !== iso) return; st.slots = r.slots || []; st.remaining = r.remaining; }
    catch (e) { st.slots = []; st.err = errMsg(e); }
    render();
  }
  async function ensureMonth(st, officeId, exclude) {
    if (!st.month) { const tdy = todayET(); st.month = tdy.slice(0, 7); }
    const key = officeId + "|" + st.month + "|" + (exclude || "");
    if (!availCache[key] && !inflight[key]) { inflight[key] = 1; try { await loadMonth(officeId, st.month, exclude); } catch (e) { availCache[key] = {}; st.err = errMsg(e); } delete inflight[key]; render(); }
  }
  function shiftMonth(st, n) { const [y, m] = st.month.split("-").map(Number); const d = new Date(Date.UTC(y, m - 1 + n, 1)); st.month = d.toISOString().slice(0, 7); }

  // ---------- views ----------
  function hoursTable(officeId) {
    const rows = S.schedules.filter((r) => r.office_id === officeId);
    if (!rows.length) return `<p class="muted small" style="margin:0">${t("hours_soon")}</p>`;
    const dowToday = new Date(todayET() + "T12:00:00Z").getUTCDay();
    const names = [0, 1, 2, 3, 4, 5, 6].map((i) => new Date(Date.UTC(2023, 0, 1 + i)).toLocaleDateString(LOC[S.lang], { weekday: "long", timeZone: "UTC" }));
    return `<table class="hours">${[1, 2, 3, 4, 5, 6, 0].map((w) => {
      const r = rows.filter((x) => x.weekday === w).sort((a, b) => a.open_time.localeCompare(b.open_time));
      return `<tr class="${w === dowToday ? "today" : ""}"><td style="text-transform:capitalize">${esc(names[w])}</td><td>${r.length ? r.map((x) => esc(fmtTime(x.open_time.slice(0, 5))) + " – " + esc(fmtTime(x.close_time.slice(0, 5)))).join("<br>") : `<span class="muted">${t("closed_day")}</span>`}</td></tr>`;
    }).join("")}</table>`;
  }
  function officeCard(o) {
    return `<div class="card office"><div class="head"><span class="ic">${I.building}</span><h3>${esc(officeName(o.id))}</h3></div>
      <div class="line">${I.pin}<span>${o.address ? esc(o.address) : `<span class="muted">${t("address_soon")}</span>`}</span></div>
      <div class="line">${I.phone}<a href="tel:${tel(o.phone)}">${esc(o.phone)}</a></div>
      <div><b class="small" style="color:var(--navy)">${t("hours")}</b><div style="margin-top:6px">${hoursTable(o.id)}</div></div>
      <div class="btn-row" style="margin-top:4px"><a class="btn btn-primary btn-sm" href="#/book" data-act="book-office" data-o="${o.id}">${I.cal}${t("btn_book")}</a><a class="btn btn-ghost btn-sm" href="tel:${tel(o.phone)}">${I.phone}${t("call_office")}</a></div></div>`;
  }
  function svcCard(s, withBtn) {
    const isPrep = s.payment_timing === "after";
    const price = s.price != null ? `<div class="price">${esc(money(s.price))} <small>USD</small></div>` : `<div class="price txt">${t("price_tbd")}</div>`;
    return `<div class="card svc ${isPrep ? "" : "gold"}"><div class="top"><span class="ic">${isPrep ? I.calc : I.talk}</span><h3>${esc(svcName(s.id))}</h3></div>
      <p class="muted grow" style="margin:0 0 14px">${esc(s.description[S.lang] || s.description.en)}</p>${price}
      <div class="term">${I.shield}<span>${isPrep ? t("prep_terms") : t("consult_terms")}</span></div>
      ${withBtn ? `<div class="btn-row"><a class="btn ${isPrep ? "btn-primary" : "btn-gold"}" href="#/book" data-act="book-svc" data-s="${s.id}">${I.cal}${t("book_this")}</a></div>` : ""}</div>`;
  }
  function band() {
    return `<section class="band"><div class="wrap"><div><h2>${t("band_h")}</h2><p>${t("band_p")}</p>
      <div class="btn-row" style="margin-top:0"><a class="btn btn-gold" href="#/book">${I.cal}${t("btn_book")}</a><a class="btn btn-outline-light" href="#/manage">${I.edit}${t("btn_modify")}</a></div></div>
      <div>${contactRow(true)}</div></div></section>`;
  }
  function viewHome() {
    const s = S.settings || {};
    const q = (href, icon, key, d, cls = "") => `<a class="${cls}" href="${href}"><span class="ic">${I[icon]}</span><span><b>${t(key)}</b><span class="d">${t(d)}</span></span></a>`;
    return `<section class="hero"><div class="wrap">
        <div>
          <div class="eyebrow">${t("eyebrow_hero")}</div>
          <h1>${t("hero_title_a")}<br><em>${t("hero_title_b")}</em></h1>
          <p class="sub">${t("hero_sub")}</p>
          <p class="desc">${t("hero_desc")}</p>
          ${s.booking_open === false ? `<div class="notice info" style="max-width:540px">${t("closed_notice")}</div>` : ""}
          <div class="cta"><a class="btn btn-primary" href="#/book">${I.cal}${t("btn_book")}</a><a class="btn btn-ghost" href="#/manage">${I.edit}${t("btn_modify")}</a></div>
          <div class="links"><a href="#/cancel">${I.x}${t("btn_cancel")}</a><a href="#/payment">${I.card}${t("btn_payment")}</a><a href="#/contact">${I.chat}${t("btn_contact")}</a></div>
          <div class="trust"><div>${I.shield}${t("trust_1")}</div><div>${I.pin}${t("trust_2")}</div><div>${I.lang}${t("trust_3")}</div></div>
        </div>
        <div class="emblem" aria-hidden="true"><span class="disc"></span><img src="${C.LOGO}" alt=""></div>
      </div></section>
      <section class="section"><div class="wrap">
        <div class="sec-head"><div class="eyebrow">CHERUBIN'S</div><h2>${t("qa_h")}</h2><p>${t("qa_p")}</p></div>
        <div class="qa">
          ${q("#/book", "cal", "btn_book", "qa_book_d", "prim")}${q("#/manage", "edit", "btn_modify", "qa_modify_d")}${q("#/cancel", "x", "btn_cancel", "qa_cancel_d")}
          ${q("#/services", "doc", "btn_services", "qa_services_d")}${q("#/contact", "chat", "btn_contact", "qa_contact_d")}${q("#/payment", "card", "btn_payment", "qa_payment_d")}
        </div></div></section>
      <section class="section alt"><div class="wrap">
        <div class="sec-head"><div class="eyebrow">${t("how_eb")}</div><h2>${t("how_h")}</h2></div>
        <div class="how">${[1, 2, 3].map((i) => `<div><b>${t("how" + i + "_t")}</b><p>${t("how" + i + "_d")}</p></div>`).join("")}</div>
      </div></section>
      <section class="section"><div class="wrap">
        <div class="sec-head"><div class="eyebrow">${t("svc_eb")}</div><h2>${t("services_title")}</h2><p>${t("svc_p")}</p></div>
        <div class="grid2">${S.services.filter((x) => x.active).map((x) => svcCard(x, true)).join("")}</div>
      </div></section>
      <section class="section alt"><div class="wrap">
        <div class="sec-head"><div class="eyebrow">${t("off_eb")}</div><h2>${t("our_offices")}</h2></div>
        <div class="grid2">${S.offices.filter((o) => o.active).map(officeCard).join("")}</div>
      </div></section>
      ${band()}`;
  }
  function viewServices() {
    return `<div class="wrap"><div class="page-title"><div class="eyebrow">${t("svc_eb")}</div><h1>${t("services_title")}</h1><p>${t("services_intro")}</p></div>
      <div class="section" style="padding-top:20px"><div class="grid2">${S.services.filter((s) => s.active).map((s) => svcCard(s, true)).join("")}</div></div></div>${band()}`;
  }
  function viewPayment() {
    const consult = service("consult");
    return `<div class="wrap"><div class="page-title"><div class="eyebrow">${t("nav_payment")}</div><h1>${t("payment_title")}</h1></div>
      <div class="section" style="padding-top:20px"><div class="grid2" style="align-items:start">
        <div class="card svc"><div class="top"><span class="ic">${I.calc}</span><h3>${t("pay_prep_h")}</h3></div><p style="margin:0">${t("prep_terms")}</p></div>
        <div class="card svc gold"><div class="top"><span class="ic">${I.talk}</span><h3>${consult ? esc(svcName("consult")) : t("pay_consult_h")}</h3></div>
          ${consult && consult.price != null ? `<div class="price">${esc(money(consult.price))} <small>USD</small></div>` : ""}
          <h4 style="margin:16px 0 6px;color:var(--navy)">${t("pay_steps_h")}</h4>
          <ol style="padding-left:20px;margin:0">${["pay_step1", "pay_step2", "pay_step3", "pay_step4"].map((k) => `<li>${esc(t(k))}</li>`).join("")}</ol>
          <div class="notice info small">${t("pay_manual")}</div>
          <div class="btn-row">${cashBtn()}<a class="btn btn-ghost" href="#/manage">${I.edit}${t("btn_modify")}</a></div>
        </div></div></div></div>`;
  }
  function viewContact() {
    const s = S.settings || {};
    return `<div class="wrap"><div class="page-title"><div class="eyebrow">${t("nav_contact")}</div><h1>${t("contact_title")}</h1><p>${t("contact_intro")}</p></div>
      <div class="section" style="padding-top:20px"><div class="card">${contactRow()}
        <p style="margin:22px 0 0;text-align:center"><b>${esc(s.phone || "215-954-7479")}</b> · <a href="mailto:${esc(s.email || "alexcherubin25@gmail.com")}">${esc(s.email || "alexcherubin25@gmail.com")}</a></p></div>
        <h2 style="margin-top:48px">${t("our_offices")}</h2><div class="grid2">${S.offices.filter((o) => o.active).map(officeCard).join("")}</div></div></div>`;
  }
  function viewLegal(kind) {
    return `<div class="wrap"><div class="page-title"><h1>${t(kind + "_title")}</h1></div><div class="section" style="padding-top:20px"><div class="card" style="max-width:820px">
      ${t(kind + "_body").map((p) => `<p>${esc(p)}</p>`).join("")}<p class="muted small">CHERUBIN'S Tax Services · ${esc((S.settings || {}).email || "")}</p></div></div></div>`;
  }

  // ----- booking -----
  function viewBook() {
    const b = S.b; const s = S.settings || {};
    if (s.booking_open === false) return `<div class="wrap"><div class="page-title"><h1>${t("book_title")}</h1></div><div class="notice info">${t("closed_notice")}</div><div class="card">${contactRow()}</div></div>`;
    const labels = ["step_office", "step_service", "step_date", "step_details", "step_review"];
    const steps = `<div class="steps">${labels.map((l, i) => `<div class="${i === b.step ? "on" : i < b.step ? "done" : ""}">${i + 1}. ${t(l)}</div>`).join("")}</div>`;
    let body = "";
    if (b.step === 0) {
      body = `<h2>${t("choose_office")}</h2><div class="opts">${S.offices.filter((o) => o.active).map((o) => `
        <button type="button" class="opt ${b.office === o.id ? "sel" : ""}" data-act="b-office" data-o="${o.id}"><span class="ic">${I.building}</span><span><b>${esc(officeName(o.id))}</b><span class="muted small">${esc(o.phone)}${o.address ? " · " + esc(o.address) : ""}</span></span></button>`).join("")}</div>`;
    } else if (b.step === 1) {
      body = `<h2>${t("choose_service")}</h2><div class="opts">${S.services.filter((x) => x.active).map((x) => `
        <button type="button" class="opt ${b.service === x.id ? "sel" : ""}" data-act="b-service" data-s="${x.id}"><span class="ic">${x.id === "consult" ? I.talk : I.calc}</span>
        <span><b>${esc(svcName(x.id))}</b><span class="muted small">${x.price != null ? esc(money(x.price)) + " · " : ""}${x.payment_timing === "after" ? t("price_after") : t("consult_terms")}</span></span></button>`).join("")}</div>
        <div class="btn-row"><button class="btn btn-ghost" data-act="b-back">${I.left}${t("back")}</button></div>`;
    } else if (b.step === 2) {
      ensureMonth(b, b.office);
      body = `<h2>${t("choose_date")}</h2>${b.err ? `<div class="notice bad">${esc(b.err)}</div>` : ""}
        <div class="date-time"><div>${calendar(b, b.office, null, "b")}</div><div>${slotsBlock(b, "b")}</div></div>
        <div class="btn-row"><button class="btn btn-ghost" data-act="b-back">${I.left}${t("back")}</button><button class="btn btn-primary" data-act="b-next" ${b.time ? "" : "disabled"}>${t("next")}${I.right}</button></div>`;
    } else if (b.step === 3) {
      body = `<h2>${t("step_details")}</h2><form id="detailsForm" novalidate>
        <div class="notice info small">${I.shield.replace("<svg", '<svg width="16" height="16" style="vertical-align:-3px;margin-right:6px"')}${t("privacy_note")}</div>
        <label class="f" for="fName">${t("full_name")}</label><input id="fName" name="name" autocomplete="name" maxlength="120" required value="${esc(b.name)}">
        <div class="grid2"><div><label class="f" for="fPhone">${t("phone")}</label><input id="fPhone" name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="25" required value="${esc(b.phone)}"></div>
        <div><label class="f" for="fEmail">${t("email")}</label><input id="fEmail" name="email" type="email" autocomplete="email" inputmode="email" maxlength="200" required value="${esc(b.email)}"></div></div>
        ${b.err ? `<div class="notice bad">${esc(b.err)}</div>` : ""}
        <div class="btn-row"><button type="button" class="btn btn-ghost" data-act="b-back">${I.left}${t("back")}</button><button class="btn btn-primary" type="submit">${t("next")}${I.right}</button></div></form>`;
    } else if (b.step === 4) {
      const pseudo = { code: "—", full_name: b.name, office_id: b.office, service_id: b.service, date: b.date, time: b.time, status: s.auto_confirm === false ? "pending" : "confirmed", payment_status: b.service === "consult" ? "pending" : "not_required" };
      const svc = service(b.service);
      const terms = t("accept_terms", { terms: `<a href="#/terms" target="_blank">${t("terms_link")}</a>`, privacy: `<a href="#/privacy" target="_blank">${t("privacy_link")}</a>` });
      body = `<h2>${t("review_title")}</h2><div class="card">${summary(pseudo).replace(/<tr><td>[^<]*<\/td><td><span class="code">—<\/span><\/td><\/tr>/, "")}
        <p class="small" style="margin-top:12px">${svc && svc.payment_timing === "after" ? t("prep_terms") : t("consult_terms")}</p></div>
        <label class="check"><input type="checkbox" id="fTerms" ${b.terms ? "checked" : ""}><span>${terms}</span></label>
        ${b.err ? `<div class="notice bad">${esc(b.err)}</div>` : ""}
        <div class="btn-row"><button class="btn btn-ghost" data-act="b-back" ${b.busy ? "disabled" : ""}>${I.left}${t("back")}</button>
        <button class="btn btn-gold" data-act="b-submit" ${b.terms && !b.busy ? "" : "disabled"}>${b.busy ? `<span class="spinner"></span> ${t("submitting")}` : I.check + t("confirm_booking")}</button></div>`;
    }
    return `<div class="wrap"><div class="page-title"><h1>${t("book_title")}</h1></div>${steps}<div class="card">${body}</div></div>`;
  }

  async function submitBooking() {
    const b = S.b; b.busy = true; b.err = ""; render();
    try {
      const a = await rpc("book_appointment", { p_office: b.office, p_service: b.service, p_date: b.date, p_time: b.time, p_name: b.name, p_phone: b.phone, p_email: b.email, p_lang: S.lang, p_terms: b.terms });
      S.result = { kind: "booked", appt: a }; S.b = freshBooking(); clearAvail(); go("#/done");
    } catch (e) {
      b.busy = false; b.err = errMsg(e);
      if (e.code === "DAY_FULL" || e.code === "SLOT_UNAVAILABLE") { clearAvail(); b.step = 2; b.time = null; const d = b.date; b.date = null; render(); pickDay(b, b.office, d); return; }
      if (/^INVALID_/.test(e.code)) b.step = 3;
      render();
    }
  }
  function clearAvail() { for (const k in availCache) delete availCache[k]; }

  function viewDone() {
    const r = S.result; if (!r) { go("#/"); return ""; }
    const a = r.appt; const link = manageLink(a.token);
    const title = { booked: "booked_title", modified: "modified_title", cancelled: "cancelled_title" }[r.kind];
    const payBlock = a.status !== "cancelled" && a.payment_status === "pending"
      ? `<div class="card" style="margin-top:16px"><h3>${t("pay_steps_h")}</h3><ol style="padding-left:20px">${["pay_step1", "pay_step2", "pay_step3", "pay_step4"].map((k) => `<li>${esc(t(k))}</li>`).join("")}</ol><div class="notice info small">${t("pay_manual")}</div><div class="btn-row">${cashBtn()}<button class="btn btn-ghost" data-act="open-manage" data-tok="${a.token}">${t("pay_sent_btn")}</button></div></div>`
      : a.payment_status === "paid" && r.kind === "modified" ? `<div class="notice ok">${t("paid_keep")}</div>` : "";
    return `<div class="wrap"><div class="page-title">${r.kind !== "cancelled" ? `<div class="success-mark">${I.check}</div>` : ""}<h1>${t(title)}</h1></div>
      <div class="card">${r.kind !== "cancelled" ? `<div class="notice ok">${I.check.replace("<svg", '<svg width="16" height="16" style="vertical-align:-3px;margin-right:6px"')}${t("email_sent")}</div>` : ""}
        ${summary(a)}
        ${r.kind !== "cancelled" ? `<p class="small muted" style="margin-top:14px">${t("save_code")}</p>
        <label class="f">${t("private_link")}</label><div class="copyrow"><input readonly value="${esc(link)}" id="mLink"><button class="btn btn-ghost" data-act="copy">${t("copy")}</button></div>
        <div class="btn-row"><button class="btn btn-primary" data-act="open-manage" data-tok="${a.token}">${I.edit}${t("btn_modify")}</button><a class="btn btn-ghost" href="#/">${t("nav_home")}</a></div>` : `<div class="btn-row"><a class="btn btn-primary" href="#/book">${I.cal}${t("btn_book")}</a></div>`}
      </div>${payBlock}
      <div class="card" style="margin-top:16px"><h3>${t("need_help")}</h3>${contactRow(true)}</div></div>`;
  }

  // ----- manage -----
  const authArgs = () => S.m.token ? { p_token: S.m.token } : { p_code: S.m.code, p_email: S.m.email };
  async function findAppt() {
    const m = S.m; m.busy = true; m.err = ""; render();
    try { m.appt = await rpc("get_my_appointment", authArgs()); m.mode = route() === "/cancel" && ["pending","confirmed"].includes(m.appt.status) ? "cancel" : "view"; if (m.mode === "cancel") askCancel(); }
    catch (e) { m.err = errMsg(e); m.token = null; }
    m.busy = false; render();
  }
  function viewManage() {
    const m = S.m; const a = m.appt; const open = !a || ["pending", "confirmed"].includes(a.status);
    let html = `<div class="wrap"><div class="page-title"><h1>${m.mode === "modify" ? t("modify_title") : t("manage_title")}</h1>${!a ? `<p>${t("manage_intro")}</p>` : ""}</div>`;
    if (!a) {
      html += `<div class="card" style="max-width:520px"><form id="findForm" novalidate>
        <label class="f" for="mCode">${t("conf_number")}</label><input id="mCode" autocomplete="off" autocapitalize="characters" placeholder="${t("conf_placeholder")}" value="${esc(m.code)}" maxlength="20" required>
        <label class="f" for="mEmail">${t("email")}</label><input id="mEmail" type="email" autocomplete="email" value="${esc(m.email)}" maxlength="200" required>
        ${m.err ? `<div class="notice bad">${esc(m.err)}</div>` : ""}
        <div class="btn-row"><button class="btn btn-primary" type="submit" ${m.busy ? "disabled" : ""}>${m.busy ? '<span class="spinner"></span>' : ""} ${t("find")}</button></div></form></div>`;
    } else if (m.mode === "modify") {
      const allowOffice = a.allow_office_change && S.offices.filter((o) => o.active).length > 1;
      ensureMonth(m, m.office, a.code);
      html += `<div class="card">${m.err ? `<div class="notice bad">${esc(m.err)}</div>` : ""}
        ${allowOffice ? `<label class="f">${t("change_office")}</label><div class="opts" style="margin-bottom:16px">${S.offices.filter((o) => o.active).map((o) => `<button type="button" class="opt ${m.office === o.id ? "sel" : ""}" data-act="m-office" data-o="${o.id}"><span class="ic">${I.building}</span><span><b>${esc(officeName(o.id))}</b><span class="muted small">${esc(o.phone)}</span></span></button>`).join("")}</div>` : ""}
        <div class="date-time"><div>${calendar(m, m.office, a.code, "m")}</div><div>${slotsBlock(m, "m")}</div></div>
        ${m.time ? `<h3 style="margin-top:24px">${t("review_title")}</h3><div class="compare">
          <div class="card"><span class="tag">${t("original")}</span><p style="margin:10px 0 0"><b>${esc(officeName(a.office_id))}</b><br>${esc(fmtDate(a.date))}<br>${esc(fmtTime(a.time))} ET</p></div>
          <div class="card new"><span class="tag gold">${t("new_")}</span><p style="margin:10px 0 0"><b>${esc(officeName(m.office))}</b><br>${esc(fmtDate(m.date))}<br>${esc(fmtTime(m.time))} ET</p></div></div>
          ${a.payment_status === "paid" || a.payment_status === "verification" ? `<div class="notice ok small">${t("paid_keep")}</div>` : ""}` : ""}
        <div class="btn-row"><button class="btn btn-ghost" data-act="m-view" ${m.busy ? "disabled" : ""}>${I.left}${t("back")}</button>
          <button class="btn btn-gold" data-act="m-confirm" ${m.time && !m.busy ? "" : "disabled"}>${m.busy ? `<span class="spinner"></span> ${t("submitting")}` : I.check + t("confirm_change")}</button></div></div>`;
    } else {
      html += `<div class="grid2" style="align-items:start"><div class="card"><h3>${t("current_appt")}</h3>${summary(a)}
          ${m.err ? `<div class="notice bad">${esc(m.err)}</div>` : ""}
          ${open ? `<div class="btn-row"><button class="btn btn-primary" data-act="m-modify">${I.cal}${t("modify_btn")}</button><button class="btn btn-danger" data-act="m-cancel">${I.x}${t("cancel_btn")}</button></div>` : `<div class="notice warn">${t("not_modifiable")}</div>`}
        </div><div>${payPanel(a)}<div class="card" ${a.payment_status === "not_required" || a.status === "cancelled" ? "" : 'style="margin-top:16px"'}><h3>${t("need_help")}</h3>${contactRow(true)}</div></div></div>`;
    }
    return html + "</div>";
  }
  function payPanel(a) {
    if (a.status === "cancelled" || a.payment_status === "not_required") return "";
    const m = S.m;
    if (a.payment_status === "paid") return `<div class="card"><h3>${t("payment_status")}</h3>${badge("ps", "paid")}<p>${t("pay_already")}</p></div>`;
    if (a.payment_status === "verification") return `<div class="card"><h3>${t("payment_status")}</h3>${badge("ps", "verification")}<p>${m.payOk ? t("pay_sent_ok") : t("pay_manual")}</p></div>`;
    return `<div class="card"><h3>${t("pay_steps_h")}</h3>${badge("ps", "pending")}
      <ol style="padding-left:20px">${["pay_step1", "pay_step2", "pay_step3", "pay_step4"].map((k) => `<li>${esc(t(k))}</li>`).join("")}</ol>
      <p class="small">${t("conf_number")}: <span class="code" style="font-size:1rem">${esc(a.code)}</span></p>
      <div class="btn-row" style="margin-top:8px">${cashBtn()}</div>
      <label class="f" for="payNote">${t("pay_sent_note")}</label><input id="payNote" maxlength="80" value="${esc(m.payNote)}">
      <div class="btn-row"><button class="btn btn-ghost" data-act="m-paid" ${m.busy ? "disabled" : ""}>${I.check}${t("pay_sent_btn")}</button></div>
      <div class="notice info small">${t("pay_manual")}</div></div>`;
  }
  function askCancel() {
    modal(`<h3>${t("cancel_btn")}</h3><p>${t("cancel_confirm_q")}</p><div class="btn-row"><button class="btn btn-danger" data-act="m-cancel-yes">${t("yes_cancel")}</button><button class="btn btn-ghost" data-act="modal-close">${t("keep")}</button></div>`);
  }
  async function doCancel() {
    const m = S.m; closeModal(); m.busy = true; render();
    try { const a = await rpc("cancel_my_appointment", authArgs()); S.result = { kind: "cancelled", appt: a }; m.appt = Object.assign({}, m.appt, a); clearAvail(); m.busy = false; go("#/done"); }
    catch (e) { m.busy = false; m.err = errMsg(e); render(); }
  }
  async function doModify() {
    const m = S.m; m.busy = true; m.err = ""; render();
    try {
      const a = await rpc("modify_my_appointment", Object.assign({ p_office: m.office, p_date: m.date, p_time: m.time }, authArgs()));
      m.appt = Object.assign({}, m.appt, a); m.mode = "view"; m.busy = false; clearAvail(); S.result = { kind: "modified", appt: a }; go("#/done");
    } catch (e) {
      m.busy = false; m.err = errMsg(e);
      if (e.code === "DAY_FULL" || e.code === "SLOT_UNAVAILABLE") { clearAvail(); const d = m.date; m.time = null; render(); pickDay(m, m.office, d, m.appt.code); return; }
      render();
    }
  }
  async function doPaid() {
    const m = S.m; m.busy = true; render();
    try { const a = await rpc("report_payment_sent", Object.assign({ p_note: m.payNote || null }, authArgs())); m.appt = Object.assign({}, m.appt, a); m.payOk = true; }
    catch (e) { m.err = errMsg(e); }
    m.busy = false; render();
  }

  // ---------- router / render ----------
  function route() { return (location.hash || "#/").replace(/^#/, "") || "/"; }
  function go(h) { if (location.hash === h) render(); else location.hash = h; }
  function render() {
    if (!S.loaded) { app.innerHTML = S.loadErr ? `<div class="wrap section"><div class="notice bad">${t("err_generic")}</div>${contactRow()}</div>` : `<div class="wrap section"><p class="muted"><span class="spinner"></span> ${t("loading")}</p></div>`; return; }
    const r = route();
    const map = { "/": viewHome, "/book": viewBook, "/services": viewServices, "/payment": viewPayment, "/contact": viewContact, "/manage": viewManage, "/cancel": viewManage, "/done": viewDone, "/privacy": () => viewLegal("privacy"), "/terms": () => viewLegal("terms") };
    const fn = map[r] || viewHome;
    const active = document.activeElement && document.activeElement.id; const caret = active && document.activeElement.selectionStart;
    app.innerHTML = fn();
    if (active) { const el = document.getElementById(active); if (el && el.tagName === "INPUT") { el.focus(); try { el.setSelectionRange(caret, caret); } catch (e) {} } }
    navActive();
  }
  function navActive() { const r = route(); document.querySelectorAll("#nav a").forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + r && !a.classList.contains("btn"))); }
  function chrome() {
    document.title = "CHERUBIN'S Tax Services — " + t("hero_sub");
    const s = S.settings || {}; const ph = s.phone || "215-954-7479"; const em = s.email || "alexcherubin25@gmail.com"; const wa = s.whatsapp || "12159547479";
    $("#util").innerHTML = `<a href="tel:${tel(ph)}">${I.phone}${esc(ph)}</a><a class="hide-sm" href="mailto:${esc(em)}">${I.mail}${esc(em)}</a><a class="hide-sm" href="https://wa.me/${esc(wa)}?text=${encodeURIComponent(t("wa_msg"))}" target="_blank" rel="noopener">${I.whatsapp}WhatsApp</a>
      <label class="lang sp" title="Language / Idioma / Langue">${I.globe}<span class="sr">Language / Idioma / Langue</span>
      <select id="langSel" aria-label="Language / Idioma / Langue"><option value="en">English</option><option value="es">Español</option><option value="fr">Français</option></select></label>`;
    $("#langSel").value = S.lang;
    $("#nav").innerHTML = [["#/", "nav_home"], ["#/services", "nav_services"], ["#/manage", "nav_manage"], ["#/payment", "nav_payment"], ["#/contact", "nav_contact"]].map(([h, k]) => `<a href="${h}">${t(k)}</a>`).join("") + `<a class="btn btn-primary btn-sm" href="#/book">${I.cal}${t("btn_book")}</a>`;
    const offs = S.offices.filter((o) => o.active);
    $("#foot").innerHTML = `<div class="cols">
      <div><div class="fb"><span class="mk"><img src="${C.LOGO}" alt=""></span><span><b>CHERUBIN'S</b><span>TAX SERVICES</span></span></div><p style="margin:0;max-width:300px">${t("foot_desc")}</p></div>
      <div><h4>${t("foot_offices")}</h4>${offs.map((o) => `<a href="tel:${tel(o.phone)}">${esc(officeName(o.id))}<br><span style="color:#9fb2bf">${esc(o.phone)}</span></a>`).join("")}</div>
      <div><h4>${t("foot_contact")}</h4><a href="tel:${tel(ph)}">${esc(ph)}</a><a href="mailto:${esc(em)}">${esc(em)}</a><a href="https://wa.me/${esc(wa)}" target="_blank" rel="noopener">WhatsApp</a></div>
      <div><h4>${t("foot_links")}</h4><a href="#/book">${t("btn_book")}</a><a href="#/manage">${t("btn_modify")}</a><a href="#/services">${t("btn_services")}</a><a href="#/payment">${t("btn_payment")}</a></div></div>
      <div class="legal"><span>© ${new Date().getFullYear()} CHERUBIN'S Tax Services. ${t("footer_rights")}</span><span><a href="#/privacy">${t("privacy_link")}</a><a href="#/terms">${t("terms_link")}</a><a href="admin.html">${t("admin_link")}</a></span></div>`;
    navActive();
  }

  // ---------- events ----------
  document.addEventListener("click", (ev) => {
    const el = ev.target.closest("[data-act],[data-close]"); if (!el) { if (ev.target.closest("#nav a")) $("#nav").classList.remove("open"); return; }
    if (el.dataset.close && ev.target === el) return closeModal();
    const act = el.dataset.act; const b = S.b; const m = S.m;
    switch (act) {
      case "b-office": b.office = el.dataset.o; b.date = b.time = null; b.slots = null; b.step = 1; b.err = ""; render(); break;
      case "b-service": b.service = el.dataset.s; b.step = 2; b.err = ""; render(); break;
      case "book-office": b.office = el.dataset.o; b.step = 1; b.date = b.time = null; break;
      case "book-svc": b.service = el.dataset.s; b.step = b.office ? 2 : 0; break;
      case "b-back": b.err = ""; b.step = Math.max(0, b.step - 1); if (b.step === 1 && !b.office) b.step = 0; render(); break;
      case "b-next": if (b.time) { b.step = 3; b.err = ""; render(); } break;
      case "b-day": b.err = ""; pickDay(b, b.office, el.dataset.d); break;
      case "b-slot": b.time = el.dataset.t; render(); break;
      case "b-mprev": shiftMonth(b, -1); b.date = b.time = null; render(); break;
      case "b-mnext": shiftMonth(b, 1); b.date = b.time = null; render(); break;
      case "b-submit": if (b.terms && !b.busy) submitBooking(); break;
      case "m-office": m.office = el.dataset.o; m.date = m.time = null; m.slots = null; render(); break;
      case "m-day": m.err = ""; pickDay(m, m.office, el.dataset.d, m.appt.code); break;
      case "m-slot": m.time = el.dataset.t; render(); break;
      case "m-mprev": shiftMonth(m, -1); m.date = m.time = null; render(); break;
      case "m-mnext": shiftMonth(m, 1); m.date = m.time = null; render(); break;
      case "m-modify": m.mode = "modify"; m.office = m.appt.office_id; m.month = m.appt.date >= todayET() ? m.appt.date.slice(0, 7) : todayET().slice(0, 7); m.date = m.time = null; m.slots = null; m.err = ""; render(); break;
      case "m-view": m.mode = "view"; m.err = ""; render(); break;
      case "m-confirm": if (m.time && !m.busy) doModify(); break;
      case "m-cancel": askCancel(); break;
      case "m-cancel-yes": doCancel(); break;
      case "m-paid": doPaid(); break;
      case "modal-close": closeModal(); break;
      case "open-manage": S.m = freshManage(); S.m.token = el.dataset.tok; go("#/manage"); findAppt(); break;
      case "copy": { const i = $("#mLink"); i.select(); (navigator.clipboard ? navigator.clipboard.writeText(i.value) : Promise.reject()).catch(() => document.execCommand("copy")); el.textContent = t("copied"); break; }
    }
  });
  document.addEventListener("input", (ev) => {
    const id = ev.target.id; const b = S.b; const m = S.m;
    if (id === "fName") b.name = ev.target.value; else if (id === "fPhone") b.phone = ev.target.value; else if (id === "fEmail") b.email = ev.target.value;
    else if (id === "mCode") m.code = ev.target.value; else if (id === "mEmail") m.email = ev.target.value; else if (id === "payNote") m.payNote = ev.target.value;
  });
  document.addEventListener("change", (ev) => { if (ev.target.id === "fTerms") { S.b.terms = ev.target.checked; render(); } if (ev.target.id === "langSel") setLang(ev.target.value); });
  document.addEventListener("submit", (ev) => {
    ev.preventDefault(); const b = S.b;
    if (ev.target.id === "detailsForm") {
      b.err = "";
      if (b.name.trim().length < 2) b.err = t("err_INVALID_NAME");
      else if ((b.phone.replace(/\D/g, "").length < 7)) b.err = t("err_INVALID_PHONE");
      else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.email.trim())) b.err = t("err_INVALID_EMAIL");
      if (!b.err) b.step = 4; render();
    }
    if (ev.target.id === "findForm") { const m = S.m; if (!m.code.trim() || !m.email.trim()) { m.err = t("err_NOT_FOUND"); render(); return; } m.token = null; findAppt(); }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  $("#menuBtn").innerHTML = I.menu; $("#menuBtn").addEventListener("click", () => { const o = $("#nav").classList.toggle("open"); $("#menuBtn").setAttribute("aria-expanded", o); });
  window.addEventListener("hashchange", () => {
    const r = route();
    if (r === "/manage" || r === "/cancel") { const m = S.m; m.intent = r === "/cancel" ? "cancel" : null; if (m.appt && m.mode === "find") m.mode = "view"; if (r === "/cancel" && m.appt && ["pending", "confirmed"].includes(m.appt.status)) askCancel(); }
    if (r === "/book" && S.b.step > 0 && !S.b.office) S.b.step = 0;
    closeModal(); render(); window.scrollTo(0, 0);
  });

  // ---------- boot ----------
  (async function boot() {
    document.documentElement.lang = S.lang; chrome(); render();
    try {
      const [st, offs, svcs, sch] = await Promise.all([rest("settings?id=eq.1&select=daily_limit,booking_open,auto_confirm,allow_office_change,booking_window_days,phone,email,whatsapp,cashapp_url"), rest("offices?select=*&order=sort"), rest("services?select=*&order=sort"), rest("schedules?select=office_id,weekday,open_time,close_time").catch(() => [])]);
      S.settings = st[0]; S.offices = offs; S.services = svcs; S.schedules = sch || []; S.loaded = true; chrome();
    } catch (e) { S.loadErr = true; }
    const tok = new URLSearchParams(location.search).get("manage");
    if (tok && /^[0-9a-f-]{36}$/i.test(tok)) { S.m.token = tok; history.replaceState(null, "", location.pathname + "#/manage"); render(); findAppt(); }
    else render();
  })();
})();
