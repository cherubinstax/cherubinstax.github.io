/* CHERUBIN'S Tax Services — admin panel */
(function () {
  const C = window.CTS_CONFIG, I = window.ICONS;
  const sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, storageKey: "cts-admin" } });
  const $ = (s, r = document) => r.querySelector(s);
  const app = $("#app");
  const LI = { en: 0, es: 1, fr: 2 }; const LOC = { en: "en-US", es: "es-US", fr: "fr-CA" };

  // ---------- translations [en, es, fr] ----------
  const TR = {
    admin: ["Admin", "Administración", "Administration"],
    login_title: ["Staff sign in", "Acceso del personal", "Connexion du personnel"],
    login_intro: ["Private area. Only authorized administrators can access client data.", "Área privada. Solo los administradores autorizados pueden ver los datos de clientes.", "Espace privé. Seuls les administrateurs autorisés peuvent consulter les données des clients."],
    email: ["Email", "Correo electrónico", "Courriel"], password: ["Password", "Contraseña", "Mot de passe"],
    sign_in: ["Sign in", "Entrar", "Se connecter"], sign_out: ["Sign out", "Salir", "Déconnexion"],
    create_account: ["Create admin account", "Crear cuenta de administrador", "Créer un compte administrateur"],
    have_account: ["I already have an account", "Ya tengo una cuenta", "J'ai déjà un compte"],
    forgot: ["Forgot password?", "¿Olvidaste tu contraseña?", "Mot de passe oublié ?"],
    send_reset: ["Send reset link", "Enviar enlace", "Envoyer le lien"],
    reset_sent: ["If the account exists, a reset link was sent to the email.", "Si la cuenta existe, se envió un enlace al correo.", "Si le compte existe, un lien a été envoyé au courriel."],
    signup_sent: ["Account created. Open the confirmation email, then sign in here.", "Cuenta creada. Abre el correo de confirmación y luego entra aquí.", "Compte créé. Ouvrez le courriel de confirmation, puis connectez-vous ici."],
    pw_min: ["Minimum 8 characters.", "Mínimo 8 caracteres.", "Minimum 8 caractères."],
    new_password: ["New password", "Nueva contraseña", "Nouveau mot de passe"], save_password: ["Save password", "Guardar contraseña", "Enregistrer"],
    not_admin: ["This account is not authorized as an administrator. Ask an existing administrator to add your email.", "Esta cuenta no está autorizada como administrador. Pide a un administrador que añada tu correo.", "Ce compte n'est pas autorisé comme administrateur. Demandez à un administrateur d'ajouter votre courriel."],
    tab_dash: ["Dashboard", "Panel", "Tableau de bord"], tab_appts: ["Appointments", "Citas", "Rendez-vous"], tab_cal: ["Calendar", "Calendario", "Calendrier"],
    tab_sched: ["Appointment Schedule", "Horarios de atención", "Horaires des rendez-vous"], tab_pay: ["Payments", "Pagos", "Paiements"], tab_set: ["Settings", "Configuración", "Paramètres"],
    day: ["Day", "Día", "Jour"], today: ["Today", "Hoy", "Aujourd'hui"],
    s_total: ["Appointments today", "Citas del día", "Rendez-vous du jour"], s_phl: ["Philadelphia", "Philadelphia", "Philadelphia"], s_orl: ["Orlando", "Orlando", "Orlando"],
    s_done: ["Clients served", "Clientes atendidos", "Clients reçus"], s_sched: ["Clients scheduled", "Clientes programados", "Clients prévus"],
    s_rem: ["Spots left (daily limit {n})", "Espacios restantes (límite {n})", "Places restantes (limite {n})"],
    s_pay: ["Consultations pending payment", "Consultas pendientes de pago", "Consultations en attente de paiement"],
    s_verif: ["Payments to verify", "Pagos por verificar", "Paiements à vérifier"],
    s_pconf: ["Pending confirmation", "Pendientes de confirmación", "En attente de confirmation"],
    booking_closed_warn: ["Online booking is CLOSED. Set the schedules, then open booking in Settings.", "Las reservas en línea están CERRADAS. Configura los horarios y luego abre las reservas en Configuración.", "La réservation en ligne est FERMÉE. Configurez les horaires, puis ouvrez la réservation dans Paramètres."],
    no_sched_warn: ["No schedule is configured yet for: {o}.", "Aún no hay horarios configurados para: {o}.", "Aucun horaire n'est encore configuré pour : {o}."],
    day_list: ["Appointments for this day", "Citas de este día", "Rendez-vous de ce jour"],
    none: ["No appointments.", "No hay citas.", "Aucun rendez-vous."],
    code: ["Confirmation", "Confirmación", "Confirmation"], client: ["Client", "Cliente", "Client"], office: ["Office", "Oficina", "Bureau"], service: ["Service", "Servicio", "Service"],
    date: ["Date", "Fecha", "Date"], time: ["Time", "Hora", "Heure"], status: ["Status", "Estado", "Statut"], payment: ["Payment", "Pago", "Paiement"], phone: ["Phone", "Teléfono", "Téléphone"],
    language: ["Language", "Idioma", "Langue"], from: ["From", "Desde", "Du"], to: ["To", "Hasta", "Au"], all: ["All", "Todos", "Tous"], search: ["Name or confirmation #", "Nombre o n.º de confirmación", "Nom ou n° de confirmation"],
    new_appt: ["New appointment", "Nueva cita", "Nouveau rendez-vous"], export_csv: ["Export CSV", "Exportar CSV", "Exporter CSV"], results: ["{n} results", "{n} resultados", "{n} résultats"],
    st_confirmed: ["Confirmed", "Confirmada", "Confirmé"], st_pending: ["Pending confirmation", "Pendiente de confirmación", "En attente de confirmation"], st_cancelled: ["Cancelled", "Cancelada", "Annulé"], st_completed: ["Completed", "Completada", "Terminé"], st_no_show: ["No-show", "No asistió", "Absent"],
    ps_pending: ["Pending Payment", "Pago pendiente", "Paiement en attente"], ps_verification: ["Payment Verification", "Verificación del pago", "Vérification du paiement"], ps_paid: ["Paid", "Pagado", "Payé"], ps_not_required: ["After preparation", "Tras la preparación", "Après la préparation"],
    details: ["Appointment details", "Detalles de la cita", "Détails du rendez-vous"], close: ["Close", "Cerrar", "Fermer"],
    a_confirm: ["Confirm", "Confirmar", "Confirmer"], a_complete: ["Mark served", "Marcar atendida", "Marquer reçu"], a_noshow: ["No-show", "No asistió", "Absent"], a_cancel: ["Cancel appointment", "Cancelar cita", "Annuler"], a_restore: ["Restore", "Restaurar", "Rétablir"],
    a_reschedule: ["Change date / time", "Cambiar fecha / hora", "Changer date / heure"], a_paid: ["Confirm payment received", "Confirmar pago recibido", "Confirmer le paiement reçu"], a_verif: ["Mark as verifying", "Marcar en verificación", "Marquer en vérification"], a_unpaid: ["Mark as pending", "Marcar pendiente", "Marquer en attente"],
    cancel_q: ["Cancel this appointment? The spot will be released.", "¿Cancelar esta cita? El espacio quedará libre.", "Annuler ce rendez-vous ? La place sera libérée."],
    paid_q: ["Only confirm if you received the money in Cash App. Continue?", "Confirma solo si recibiste el dinero en Cash App. ¿Continuar?", "Confirmez uniquement si vous avez reçu l'argent dans Cash App. Continuer ?"],
    yes: ["Yes", "Sí", "Oui"], no: ["No", "No", "Non"],
    client_note: ["Client's payment note", "Nota de pago del cliente", "Note de paiement du client"], admin_notes: ["Internal notes", "Notas internas", "Notes internes"], save: ["Save", "Guardar", "Enregistrer"], saved: ["Saved", "Guardado", "Enregistré"],
    history: ["Change history", "Historial de cambios", "Historique des modifications"],
    h_created: ["Created", "Creada", "Créé"], h_rescheduled: ["Rescheduled", "Reprogramada", "Reporté"], h_cancelled: ["Cancelled", "Cancelada", "Annulé"], h_payment: ["Payment", "Pago", "Paiement"], h_status: ["Status", "Estado", "Statut"], h_updated: ["Updated", "Actualizada", "Mis à jour"],
    by_client: ["by client", "por el cliente", "par le client"], by_admin: ["by admin", "por administrador", "par l'administrateur"], by_system: ["by system", "por el sistema", "par le système"],
    resched_title: ["Change date / time", "Cambiar fecha / hora", "Changer date / heure"], free_times: ["Free times", "Horas libres", "Heures libres"],
    outside: ["Allow a time outside the configured schedule", "Permitir una hora fuera del horario configurado", "Autoriser une heure hors horaire"],
    remaining_day: ["{n} spots left that day", "Quedan {n} espacios ese día", "{n} place(s) restante(s) ce jour"],
    full_name: ["Full name", "Nombre completo", "Nom complet"], create: ["Create", "Crear", "Créer"], pick_time: ["Choose a time", "Elige una hora", "Choisissez une heure"],
    // schedule
    office_info: ["Office information", "Datos de la oficina", "Informations du bureau"], address: ["Address", "Dirección", "Adresse"], address_ph: ["Add the physical address", "Añade la dirección física", "Ajoutez l'adresse"],
    timezone: ["Time zone", "Zona horaria", "Fuseau horaire"], active: ["Active (visible to clients)", "Activa (visible para clientes)", "Actif (visible pour les clients)"],
    slot_len: ["Appointment length (minutes)", "Duración de cada cita (minutos)", "Durée du rendez-vous (minutes)"], buffer: ["Break between appointments (minutes)", "Intervalo entre citas (minutos)", "Pause entre rendez-vous (minutes)"],
    weekly: ["Weekly hours", "Horario semanal", "Horaires hebdomadaires"], closed: ["Closed", "Cerrado", "Fermé"], add_range: ["Add hours", "Añadir horario", "Ajouter"], remove: ["Remove", "Quitar", "Retirer"],
    save_sched: ["Save schedule", "Guardar horario", "Enregistrer l'horaire"],
    conflicts_title: ["These confirmed appointments fall outside the new schedule", "Estas citas confirmadas quedan fuera del nuevo horario", "Ces rendez-vous confirmés sont hors du nouvel horaire"],
    conflicts_body: ["Saving will not cancel them. Reschedule each client using the button, or contact them.", "Guardar no las cancela. Reprograma a cada cliente con el botón o contáctalo.", "L'enregistrement ne les annule pas. Reportez chaque client avec le bouton ou contactez-le."],
    save_anyway: ["Save anyway", "Guardar de todos modos", "Enregistrer quand même"], invalid_range: ["Check the hours: closing must be after opening.", "Revisa las horas: el cierre debe ser después de la apertura.", "Vérifiez les heures : la fermeture doit suivre l'ouverture."],
    blocks: ["Blocked dates & times (holidays, vacations)", "Fechas y horas bloqueadas (festivos, vacaciones)", "Dates et heures bloquées (fériés, vacances)"],
    both: ["Both offices", "Ambas oficinas", "Les deux bureaux"], whole_day: ["Whole day", "Día completo", "Journée entière"], reason: ["Reason", "Motivo", "Motif"], add_block: ["Add block", "Añadir bloqueo", "Ajouter le blocage"],
    block_affects: ["This block affects {n} confirmed appointment(s). They will remain, but you should reschedule them.", "Este bloqueo afecta {n} cita(s) confirmada(s). Seguirán activas, pero deberías reprogramarlas.", "Ce blocage touche {n} rendez-vous confirmé(s). Ils restent actifs mais doivent être reportés."],
    check_day: ["Check free and booked times", "Consultar horas libres y ocupadas", "Vérifier heures libres et réservées"], booked: ["Booked", "Ocupadas", "Réservées"],
    // payments
    pay_intro: ["Cash App does not offer automatic confirmation for personal payment links. Check your Cash App activity, find the confirmation number in the note, then confirm here.", "Cash App no ofrece confirmación automática para enlaces de pago personales. Revisa tu actividad en Cash App, busca el número de confirmación en la nota y confírmalo aquí.", "Cash App n'offre pas de confirmation automatique pour les liens personnels. Vérifiez votre activité Cash App, trouvez le numéro de confirmation dans la note, puis confirmez ici."],
    show_paid: ["Show paid", "Mostrar pagadas", "Afficher payées"], amount: ["Amount", "Monto", "Montant"],
    // settings
    general: ["Booking rules", "Reglas de reservas", "Règles de réservation"], daily_limit: ["Daily client limit (both offices combined)", "Límite diario de clientes (ambas oficinas)", "Limite quotidienne (deux bureaux combinés)"],
    booking_open: ["Online booking open to the public", "Reservas en línea abiertas al público", "Réservation en ligne ouverte au public"],
    auto_confirm: ["Confirm bookings automatically", "Confirmar reservas automáticamente", "Confirmer automatiquement"],
    allow_office: ["Clients may change office when modifying", "Los clientes pueden cambiar de oficina al modificar", "Les clients peuvent changer de bureau"],
    window: ["How many days ahead clients can book", "Con cuántos días de anticipación se puede reservar", "Nombre de jours de réservation à l'avance"],
    notice: ["Minimum notice before an appointment (hours)", "Aviso mínimo antes de una cita (horas)", "Préavis minimum (heures)"],
    contact: ["Contact & payments", "Contacto y pagos", "Contact et paiements"], whatsapp: ["WhatsApp number (digits with country code)", "Número de WhatsApp (con código de país)", "Numéro WhatsApp (avec indicatif)"],
    cashapp: ["Cash App link", "Enlace de Cash App", "Lien Cash App"], site_url: ["Public site address (used in emails)", "Dirección pública del sitio (para los correos)", "Adresse publique du site (pour les courriels)"],
    notify_admin: ["Send me a copy of each notification", "Enviarme copia de cada notificación", "M'envoyer une copie de chaque notification"],
    services: ["Services & prices", "Servicios y precios", "Services et prix"], price: ["Price (USD, empty = shown as provided at office)", "Precio (USD, vacío = se indica en la oficina)", "Prix (USD, vide = indiqué au bureau)"],
    name_l: ["Name", "Nombre", "Nom"], desc_l: ["Description", "Descripción", "Description"], svc_active: ["Active", "Activo", "Actif"],
    admins: ["Administrators", "Administradores", "Administrateurs"], add_admin: ["Add administrator", "Añadir administrador", "Ajouter un administrateur"],
    add_admin_help: ["The person must first create an account on this page with that email.", "La persona debe crear primero una cuenta en esta página con ese correo.", "La personne doit d'abord créer un compte sur cette page avec ce courriel."],
    no_account: ["No account found for that email yet.", "Aún no existe una cuenta con ese correo.", "Aucun compte trouvé pour ce courriel."],
    email_setup: ["Email notifications", "Notificaciones por correo", "Notifications par courriel"],
    email_setup_body: ["Emails are sent through Resend in the language each client chose. To activate them, add the RESEND_API_KEY secret to the 'notify' function in Supabase (Edge Functions → Secrets). Until then, no emails are sent.", "Los correos se envían mediante Resend en el idioma que eligió cada cliente. Para activarlos, añade el secreto RESEND_API_KEY a la función 'notify' en Supabase (Edge Functions → Secrets). Hasta entonces no se envían correos.", "Les courriels sont envoyés via Resend dans la langue choisie par chaque client. Pour les activer, ajoutez le secret RESEND_API_KEY à la fonction « notify » dans Supabase (Edge Functions → Secrets). D'ici là, aucun courriel n'est envoyé."],
    err: ["Error", "Error", "Erreur"], loading: ["Loading…", "Cargando…", "Chargement…"],
    e_DAY_FULL: ["The daily limit is reached for that date.", "Se alcanzó el límite diario para esa fecha.", "La limite quotidienne est atteinte pour cette date."],
    e_SLOT_UNAVAILABLE: ["That time is not available.", "Esa hora no está disponible.", "Cette heure n'est pas disponible."],
    e_INVALID_NAME: ["Invalid name.", "Nombre no válido.", "Nom invalide."], e_INVALID_EMAIL: ["Invalid email.", "Correo no válido.", "Courriel invalide."], e_INVALID_PHONE: ["Invalid phone.", "Teléfono no válido.", "Téléphone invalide."],
    e_FORBIDDEN: ["Not authorized.", "No autorizado.", "Non autorisé."], e_CANNOT_REMOVE_SELF: ["You cannot remove yourself.", "No puedes quitarte a ti mismo.", "Vous ne pouvez pas vous retirer."],
    wdays: [["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"], ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]],
    months: [["January","February","March","April","May","June","July","August","September","October","November","December"], ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"], ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"]],
  };
  let lang = "en"; try { const l = localStorage.getItem("cts_lang"); if (LI[l] != null) lang = l; } catch (e) {}
  const t = (k, v) => { const e = TR[k]; let s = e ? e[LI[lang]] : k; if (v && typeof s === "string") for (const x in v) s = s.replace("{" + x + "}", v[x]); return s; };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const errT = (e) => { const m = (e && (e.message || e.code)) || ""; return TR["e_" + m] ? t("e_" + m) : t("err") + ": " + m; };

  const todayET = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
  const addDays = (iso, n) => { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const fDate = (iso) => new Date(iso + "T12:00:00Z").toLocaleDateString(LOC[lang], { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  const fTime = (hm) => { if (!hm) return ""; const [h, m] = hm.split(":").map(Number); return new Date(Date.UTC(2000, 0, 1, h, m)).toLocaleTimeString(LOC[lang], { hour: "numeric", minute: "2-digit", timeZone: "UTC" }); };
  const hm = (x) => (x || "").slice(0, 5);
  const badge = (k, v) => `<span class="badge b-${esc(v)}">${esc(t(k + "_" + v))}</span>`;

  // ---------- state ----------
  const S = { user: null, isAdmin: false, tab: "dash", settings: null, offices: [], services: [], authMode: "login", authMsg: "", authErr: "", recovery: false,
    dash: { date: todayET() }, list: { from: todayET(), to: addDays(todayET(), 30), office: "", service: "", status: "active", q: "", rows: null },
    cal: { month: todayET().slice(0, 7), rows: null }, sched: { office: "philadelphia", ranges: null, checkDate: todayET(), check: null }, pay: { showPaid: false, rows: null }, admins: null };

  function toast(msg) { const d = document.createElement("div"); d.className = "toast"; d.textContent = msg; document.body.appendChild(d); setTimeout(() => d.remove(), 2600); }
  function modal(html, wide) { $("#modalRoot").innerHTML = `<div class="modal-bg" data-close="1"><div class="modal ${wide ? "wide" : ""}" role="dialog" aria-modal="true">${html}</div></div>`; }
  function closeModal() { $("#modalRoot").innerHTML = ""; }
  function confirmBox(q, onYes, danger) {
    modal(`<p style="font-weight:600">${esc(q)}</p><div class="btn-row"><button class="btn ${danger ? "btn-danger" : "btn-primary"}" id="cbYes">${t("yes")}</button><button class="btn btn-ghost" data-act="close">${t("no")}</button></div>`);
    $("#cbYes").onclick = () => { closeModal(); onYes(); };
  }
  const offName = (id) => (S.offices.find((o) => o.id === id) || {}).name || id;
  const svcName = (id) => { const s = S.services.find((x) => x.id === id); return s ? s.name[lang] || s.name.en : id; };

  async function loadBase() {
    const [st, o, s] = await Promise.all([sb.from("settings").select("*").eq("id", 1).single(), sb.from("offices").select("*").order("sort"), sb.from("services").select("*").order("sort")]);
    S.settings = st.data; S.offices = o.data || []; S.services = s.data || [];
  }

  // ---------- auth ----------
  function viewAuth() {
    if (S.recovery) return `<div class="wrap section"><div class="card" style="max-width:420px;margin:auto"><h2>${t("new_password")}</h2>
      <form id="pwForm"><label class="f">${t("new_password")}</label><input id="newPw" type="password" minlength="8" autocomplete="new-password" required><p class="muted small">${t("pw_min")}</p>
      ${S.authErr ? `<div class="notice bad">${esc(S.authErr)}</div>` : ""}<div class="btn-row"><button class="btn btn-primary">${t("save_password")}</button></div></form></div></div>`;
    if (S.user && !S.isAdmin) return `<div class="wrap section"><div class="card" style="max-width:480px;margin:auto"><div class="notice warn">${t("not_admin")}</div><p class="muted">${esc(S.user.email)}</p><button class="btn btn-ghost" data-act="logout">${t("sign_out")}</button></div></div>`;
    const m = S.authMode;
    return `<div class="wrap section"><div class="card" style="max-width:420px;margin:auto">
      <h2>${m === "signup" ? t("create_account") : m === "forgot" ? t("forgot") : t("login_title")}</h2><p class="muted small">${t("login_intro")}</p>
      <form id="authForm" novalidate><label class="f" for="aEmail">${t("email")}</label><input id="aEmail" type="email" autocomplete="username" required>
      ${m !== "forgot" ? `<label class="f" for="aPw">${t("password")}</label><input id="aPw" type="password" autocomplete="${m === "signup" ? "new-password" : "current-password"}" minlength="8" required>${m === "signup" ? `<p class="muted small">${t("pw_min")}</p>` : ""}` : ""}
      ${S.authErr ? `<div class="notice bad">${esc(S.authErr)}</div>` : ""}${S.authMsg ? `<div class="notice ok">${esc(S.authMsg)}</div>` : ""}
      <div class="btn-row"><button class="btn btn-primary" type="submit">${m === "signup" ? t("create_account") : m === "forgot" ? t("send_reset") : t("sign_in")}</button></div></form>
      <p class="small" style="margin-top:16px">${m === "login" ? `<a href="#" data-act="auth-forgot">${t("forgot")}</a> · <a href="#" data-act="auth-signup">${t("create_account")}</a>` : `<a href="#" data-act="auth-login">${t("have_account")}</a>`}</p></div></div>`;
  }
  async function onAuthSubmit() {
    const email = $("#aEmail").value.trim(); const pw = $("#aPw") && $("#aPw").value; S.authErr = S.authMsg = "";
    const redirect = location.origin + location.pathname;
    if (S.authMode === "login") { const { error } = await sb.auth.signInWithPassword({ email, password: pw }); if (error) S.authErr = error.message; }
    else if (S.authMode === "signup") { if (!pw || pw.length < 8) S.authErr = t("pw_min"); else { const { error } = await sb.auth.signUp({ email, password: pw, options: { emailRedirectTo: redirect } }); if (error) S.authErr = error.message; else { S.authMsg = t("signup_sent"); S.authMode = "login"; } } }
    else { await sb.auth.resetPasswordForEmail(email, { redirectTo: redirect }); S.authMsg = t("reset_sent"); S.authMode = "login"; }
    render();
  }
  async function afterSession(session) {
    S.user = session ? session.user : null; S.isAdmin = false;
    if (S.user) { const { data } = await sb.rpc("claim_admin"); S.isAdmin = !!data; if (S.isAdmin) await loadBase(); }
    render();
  }

  // ---------- dashboard ----------
  async function viewDash() {
    const d = S.dash.date;
    const [{ data: st, error }, { data: rows }, { data: sch }] = await Promise.all([
      sb.rpc("admin_stats", { p_date: d }),
      sb.from("appointments").select("*").eq("appt_date", d).neq("status", "cancelled").order("appt_time"),
      sb.from("schedules").select("office_id")]);
    if (error) return `<div class="notice bad">${esc(errT(error))}</div>`;
    const missing = S.offices.filter((o) => o.active && !(sch || []).some((x) => x.office_id === o.id)).map((o) => o.name);
    const card = (v, k, hl) => `<div class="stat ${hl ? "hl" : ""}"><div class="v">${v}</div><div class="k">${k}</div></div>`;
    return `${!S.settings.booking_open ? `<div class="notice warn">${t("booking_closed_warn")}</div>` : ""}${missing.length ? `<div class="notice warn">${esc(t("no_sched_warn", { o: missing.join(", ") }))}</div>` : ""}
      <div class="row" style="margin-bottom:14px"><label class="f" style="margin:0">${t("day")}</label><input type="date" id="dashDate" value="${d}" style="width:auto"><button class="btn btn-ghost" data-act="dash-today">${t("today")}</button></div>
      <div class="stats">${card(st.total, t("s_total"))}${card(st.philadelphia, t("s_phl"))}${card(st.orlando, t("s_orl"))}${card(st.completed, t("s_done"))}${card(st.scheduled, t("s_sched"))}
      ${card(st.remaining + " / " + st.limit, t("s_rem", { n: st.limit }), true)}${card(st.payments_pending, t("s_pay"))}${card(st.payments_verification, t("s_verif"))}${card(st.pending_confirmation, t("s_pconf"))}</div>
      <h3 style="margin-top:24px">${t("day_list")}</h3>${table(rows || [])}`;
  }
  function table(rows) {
    if (!rows.length) return `<p class="muted">${t("none")}</p>`;
    return `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>${t("date")}</th><th>${t("time")}</th><th>${t("client")}</th><th>${t("office")}</th><th>${t("service")}</th><th>${t("status")}</th><th>${t("payment")}</th><th>${t("code")}</th></tr></thead><tbody>
      ${rows.map((a) => `<tr class="click" data-act="open" data-id="${a.id}"><td>${esc(fDate(a.appt_date))}</td><td>${esc(fTime(a.appt_time))}</td><td><b>${esc(a.full_name)}</b><br><span class="muted small">${esc(a.phone)}</span></td><td>${esc(offName(a.office_id))}</td><td>${esc(svcName(a.service_id))}</td><td>${badge("st", a.status)}</td><td>${badge("ps", a.payment_status)}</td><td><span class="chip">${esc(a.confirmation_code)}</span></td></tr>`).join("")}
    </tbody></table></div>`;
  }

  // ---------- appointments ----------
  async function queryList() {
    const f = S.list; let q = sb.from("appointments").select("*").order("appt_date").order("appt_time").limit(1000);
    if (f.from) q = q.gte("appt_date", f.from); if (f.to) q = q.lte("appt_date", f.to);
    if (f.office) q = q.eq("office_id", f.office); if (f.service) q = q.eq("service_id", f.service);
    if (f.status === "active") q = q.in("status", ["pending", "confirmed"]); else if (f.status) q = q.eq("status", f.status);
    const s = f.q.replace(/[,()%*\\]/g, " ").trim(); if (s) q = q.or(`full_name.ilike.%${s}%,confirmation_code.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`);
    const { data, error } = await q; if (error) throw error; return data;
  }
  async function viewAppts() {
    const f = S.list; let rows; try { rows = await queryList(); } catch (e) { return `<div class="notice bad">${esc(errT(e))}</div>`; }
    S.list.rows = rows;
    const opt = (v, l, cur) => `<option value="${v}" ${v === cur ? "selected" : ""}>${esc(l)}</option>`;
    return `<div class="row" style="justify-content:space-between;margin-bottom:12px"><h2 style="margin:0">${t("tab_appts")}</h2><div class="row"><button class="btn btn-gold" data-act="new">${I.cal}${t("new_appt")}</button><button class="btn btn-ghost" data-act="csv">${I.doc}${t("export_csv")}</button></div></div>
      <form class="filters" id="fForm"><div><label>${t("search")}</label><input name="q" value="${esc(f.q)}"></div>
        <div><label>${t("from")}</label><input type="date" name="from" value="${f.from}"></div><div><label>${t("to")}</label><input type="date" name="to" value="${f.to}"></div>
        <div><label>${t("office")}</label><select name="office">${opt("", t("all"), f.office)}${S.offices.map((o) => opt(o.id, o.name, f.office)).join("")}</select></div>
        <div><label>${t("service")}</label><select name="service">${opt("", t("all"), f.service)}${S.services.map((s) => opt(s.id, svcName(s.id), f.service)).join("")}</select></div>
        <div><label>${t("status")}</label><select name="status">${opt("active", t("st_confirmed") + " + " + t("st_pending"), f.status)}${opt("", t("all"), f.status)}${["confirmed", "pending", "completed", "cancelled", "no_show"].map((s) => opt(s, t("st_" + s), f.status)).join("")}</select></div></form>
      <p class="muted small">${t("results", { n: rows.length })}</p>${table(rows)}`;
  }
  function exportCsv() {
    const rows = S.list.rows || []; const cols = ["confirmation_code", "appt_date", "appt_time", "office_id", "service_id", "status", "payment_status", "price", "full_name", "phone", "email", "language", "created_at", "admin_notes"];
    const q = (v) => { v = v == null ? "" : String(v); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
    const csv = "﻿" + cols.join(",") + "\n" + rows.map((r) => cols.map((c) => q(r[c])).join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); a.download = `cherubins-appointments-${todayET()}.csv`; a.click();
  }

  // ----- appointment modal -----
  async function openAppt(id) {
    modal(`<p class="muted"><span class="spinner"></span> ${t("loading")}</p>`, true);
    const [{ data: a }, { data: hist }] = await Promise.all([sb.from("appointments").select("*").eq("id", id).single(), sb.from("appointment_history").select("*").eq("appointment_id", id).order("created_at", { ascending: false })]);
    if (!a) { closeModal(); return; }
    const active = ["pending", "confirmed"].includes(a.status);
    const hItem = (h) => { const ch = h.old_data && h.new_data ? Object.keys(h.new_data).map((k) => `${esc(k)}: ${esc(h.old_data[k])} → <b>${esc(h.new_data[k])}</b>`).join("<br>") : ""; return `<li><b>${esc(t("h_" + h.action))}</b> <span class="muted">${t("by_" + h.actor) || h.actor}${h.actor_email ? " (" + esc(h.actor_email) + ")" : ""} · ${esc(new Date(h.created_at).toLocaleString(LOC[lang]))}</span>${ch ? "<br><span class='small'>" + ch + "</span>" : ""}</li>`; };
    modal(`<div class="row" style="justify-content:space-between"><h2 style="margin:0">${t("details")}</h2><button class="btn btn-ghost" data-act="close">${t("close")}</button></div>
      <div class="grid2" style="margin-top:12px"><div><table class="sum">
        <tr><td>${t("code")}</td><td><span class="code">${esc(a.confirmation_code)}</span></td></tr><tr><td>${t("client")}</td><td>${esc(a.full_name)}</td></tr>
        <tr><td>${t("phone")}</td><td><a href="tel:${esc(a.phone)}">${esc(a.phone)}</a></td></tr><tr><td>${t("email")}</td><td><a href="mailto:${esc(a.email)}">${esc(a.email)}</a></td></tr>
        <tr><td>${t("language")}</td><td>${{ en: "English", es: "Español", fr: "Français" }[a.language]}</td></tr><tr><td>${t("office")}</td><td>${esc(offName(a.office_id))}</td></tr>
        <tr><td>${t("service")}</td><td>${esc(svcName(a.service_id))}${a.price != null ? " · $" + esc(a.price) : ""}</td></tr><tr><td>${t("date")}</td><td>${esc(fDate(a.appt_date))}</td></tr><tr><td>${t("time")}</td><td>${esc(fTime(a.appt_time))} ET</td></tr>
        <tr><td>${t("status")}</td><td>${badge("st", a.status)}</td></tr><tr><td>${t("payment")}</td><td>${badge("ps", a.payment_status)}</td></tr>
        ${a.payment_note ? `<tr><td>${t("client_note")}</td><td>${esc(a.payment_note)}</td></tr>` : ""}</table></div>
      <div><div class="btn-row" style="margin-top:0">
        ${a.status === "pending" ? `<button class="btn btn-primary" data-act="st" data-v="confirmed">${t("a_confirm")}</button>` : ""}
        ${active ? `<button class="btn btn-primary" data-act="resched">${I.cal}${t("a_reschedule")}</button><button class="btn btn-ghost" data-act="st" data-v="completed">${t("a_complete")}</button><button class="btn btn-ghost" data-act="st" data-v="no_show">${t("a_noshow")}</button><button class="btn btn-danger" data-act="st" data-v="cancelled">${t("a_cancel")}</button>` : `<button class="btn btn-ghost" data-act="st" data-v="confirmed">${t("a_restore")}</button>`}
      </div>
      ${a.payment_status !== "not_required" ? `<h3 style="margin-top:18px">${t("payment")}</h3><div class="btn-row" style="margin-top:0">${a.payment_status !== "paid" ? `<button class="btn btn-cash" data-act="ps" data-v="paid">${I.check}${t("a_paid")}</button>` : ""}${a.payment_status !== "verification" ? `<button class="btn btn-ghost" data-act="ps" data-v="verification">${t("a_verif")}</button>` : ""}${a.payment_status !== "pending" ? `<button class="btn btn-ghost" data-act="ps" data-v="pending">${t("a_unpaid")}</button>` : ""}</div>` : ""}
      <label class="f">${t("admin_notes")}</label><textarea id="aNotes" rows="3">${esc(a.admin_notes || "")}</textarea><div class="btn-row" style="margin-top:8px"><button class="btn btn-ghost" data-act="notes">${t("save")}</button></div>
      <h3 style="margin-top:18px">${t("history")}</h3><ul class="hist">${(hist || []).map(hItem).join("")}</ul></div></div>`, true);
    const root = $("#modalRoot");
    root.onclick = async (ev) => {
      const b = ev.target.closest("[data-act]"); if (!b) { if (ev.target.dataset.close) closeModal(); return; }
      const act = b.dataset.act;
      if (act === "close") return closeModal();
      if (act === "st") { const go = async () => { const { error } = await sb.from("appointments").update({ status: b.dataset.v }).eq("id", a.id); if (error) return toast(errT(error)); toast(t("saved")); openAppt(a.id); refresh(); }; return b.dataset.v === "cancelled" ? confirmBox(t("cancel_q"), go, true) : go(); }
      if (act === "ps") { const go = async () => { const { error } = await sb.from("appointments").update({ payment_status: b.dataset.v }).eq("id", a.id); if (error) return toast(errT(error)); toast(t("saved")); openAppt(a.id); refresh(); }; return b.dataset.v === "paid" ? confirmBox(t("paid_q"), go) : go(); }
      if (act === "notes") { const { error } = await sb.from("appointments").update({ admin_notes: $("#aNotes").value.slice(0, 2000) }).eq("id", a.id); toast(error ? errT(error) : t("saved")); }
      if (act === "resched") reschedModal(a);
    };
  }
  function slotPicker(id, state, excludeId) {
    // renders office/date/slots, loads admin_slots
    const wrap = $(id);
    const draw = () => {
      wrap.innerHTML = `<div class="grid2"><div><label class="f">${t("office")}</label><select id="spOffice">${S.offices.map((o) => `<option value="${o.id}" ${o.id === state.office ? "selected" : ""}>${esc(o.name)}</option>`).join("")}</select></div>
        <div><label class="f">${t("date")}</label><input type="date" id="spDate" value="${state.date}"></div></div>
        <label class="check"><input type="checkbox" id="spOut" ${state.outside ? "checked" : ""}><span>${t("outside")}</span></label>
        ${state.outside ? `<label class="f">${t("time")}</label><input type="time" id="spTime" value="${state.time || ""}" step="300" style="width:auto">` :
          `<label class="f">${t("free_times")}</label>${state.slots == null ? `<p class="muted"><span class="spinner"></span></p>` : state.slots.length ? `<div class="slots">${state.slots.map((s) => `<button type="button" class="slot ${state.time === s ? "sel" : ""}" data-slot="${s}">${esc(fTime(s))}</button>`).join("")}</div>` : `<p class="muted">—</p>`}`}
        ${state.remaining != null ? `<p class="small ${state.remaining === 0 ? "" : "muted"}" style="${state.remaining === 0 ? "color:var(--bad);font-weight:600" : ""}">${t("remaining_day", { n: state.remaining })}</p>` : ""}`;
      $("#spOffice").onchange = (e) => { state.office = e.target.value; state.time = null; load(); };
      $("#spDate").onchange = (e) => { state.date = e.target.value; state.time = null; load(); };
      $("#spOut").onchange = (e) => { state.outside = e.target.checked; state.time = null; draw(); };
      if ($("#spTime")) $("#spTime").oninput = (e) => (state.time = e.target.value);
      wrap.querySelectorAll("[data-slot]").forEach((b) => (b.onclick = () => { state.time = b.dataset.slot; draw(); }));
    };
    const load = async () => { state.slots = null; state.remaining = null; draw(); if (!state.date) return; const { data, error } = await sb.rpc("admin_slots", { p_office: state.office, p_date: state.date, p_exclude: excludeId || null }); state.slots = error ? [] : data.slots; state.remaining = error ? null : data.remaining; draw(); };
    load();
  }
  function reschedModal(a) {
    const st = { office: a.office_id, date: a.appt_date, time: null, outside: false };
    modal(`<h2>${t("resched_title")}</h2><p class="muted small">${esc(a.full_name)} · ${esc(a.confirmation_code)} · ${esc(offName(a.office_id))} · ${esc(fDate(a.appt_date))} ${esc(fTime(a.appt_time))}</p>
      <div id="sp"></div><div id="rErr"></div><div class="btn-row"><button class="btn btn-gold" id="rSave">${t("save")}</button><button class="btn btn-ghost" id="rBack">${t("close")}</button></div>`, true);
    $("#modalRoot").onclick = (ev) => { if (ev.target.dataset && ev.target.dataset.close) closeModal(); };
    slotPicker("#sp", st, a.id);
    $("#rBack").onclick = () => openAppt(a.id);
    $("#rSave").onclick = async () => {
      if (!st.time) { $("#rErr").innerHTML = `<div class="notice warn">${t("pick_time")}</div>`; return; }
      const { error } = await sb.rpc("admin_reschedule", { p_id: a.id, p_office: st.office, p_date: st.date, p_time: st.time, p_outside_hours: st.outside });
      if (error) { $("#rErr").innerHTML = `<div class="notice bad">${esc(errT(error))}</div>`; return; }
      toast(t("saved")); openAppt(a.id); refresh();
    };
  }
  function newModal() {
    const st = { office: S.offices[0] && S.offices[0].id, date: todayET(), time: null, outside: false };
    modal(`<h2>${t("new_appt")}</h2><div class="grid2"><div><label class="f">${t("full_name")}</label><input id="nName" maxlength="120"></div><div><label class="f">${t("service")}</label><select id="nSvc">${S.services.filter((s) => s.active).map((s) => `<option value="${s.id}">${esc(svcName(s.id))}</option>`).join("")}</select></div>
      <div><label class="f">${t("phone")}</label><input id="nPhone" type="tel"></div><div><label class="f">${t("email")}</label><input id="nEmail" type="email"></div>
      <div><label class="f">${t("language")}</label><select id="nLang"><option value="en">English</option><option value="es">Español</option><option value="fr">Français</option></select></div></div>
      <div id="sp" style="margin-top:8px"></div><div id="nErr"></div><div class="btn-row"><button class="btn btn-gold" id="nSave">${t("create")}</button><button class="btn btn-ghost" data-act="close">${t("close")}</button></div>`, true);
    $("#modalRoot").onclick = (ev) => { if (ev.target.dataset && (ev.target.dataset.close || ev.target.dataset.act === "close")) closeModal(); };
    slotPicker("#sp", st, null);
    $("#nSave").onclick = async () => {
      if (!st.time) { $("#nErr").innerHTML = `<div class="notice warn">${t("pick_time")}</div>`; return; }
      const args = { p_office: st.office, p_service: $("#nSvc").value, p_date: st.date, p_time: st.time, p_name: $("#nName").value, p_phone: $("#nPhone").value, p_email: $("#nEmail").value, p_lang: $("#nLang").value };
      const { data, error } = await sb.rpc("admin_book", args);
      if (error) { $("#nErr").innerHTML = `<div class="notice bad">${esc(errT(error))}</div>`; return; }
      toast(t("saved") + " · " + data.code); openAppt(data.id); refresh();
    };
  }

  // ---------- calendar ----------
  async function viewCal() {
    const m = S.cal.month; const [y, mo] = m.split("-").map(Number); const last = new Date(Date.UTC(y, mo, 0)).getUTCDate();
    const { data } = await sb.from("appointments").select("appt_date,office_id,status").gte("appt_date", m + "-01").lte("appt_date", `${m}-${String(last).padStart(2, "0")}`).in("status", ["pending", "confirmed", "completed"]);
    const by = {}; (data || []).forEach((a) => { const d = (by[a.appt_date] = by[a.appt_date] || { t: 0 }); d.t++; d[a.office_id] = (d[a.office_id] || 0) + 1; });
    const lim = S.settings.daily_limit; const start = new Date(Date.UTC(y, mo - 1, 1)).getUTCDay(); const tdy = todayET();
    let cells = t("wdays").map((w) => `<div class="wd">${esc(w.slice(0, 3))}</div>`).join("") + "<div></div>".repeat(start);
    for (let d = 1; d <= last; d++) { const iso = `${m}-${String(d).padStart(2, "0")}`; const x = by[iso] || { t: 0 };
      cells += `<button class="c ${x.t >= lim ? "full" : ""} ${iso === tdy ? "today" : ""}" data-act="cal-day" data-d="${iso}"><b>${d}</b>${x.t ? `<span class="n">${x.t}</span>/${lim}<br><span class="muted">PHL ${x.philadelphia || 0} · ORL ${x.orlando || 0}</span>` : ""}</button>`; }
    return `<div class="row" style="justify-content:space-between;margin-bottom:12px"><h2 style="margin:0;text-transform:capitalize">${esc(t("months")[mo - 1])} ${y}</h2>
      <div class="row"><button class="btn btn-ghost" data-act="cal-prev">${I.left}</button><button class="btn btn-ghost" data-act="cal-today">${t("today")}</button><button class="btn btn-ghost" data-act="cal-next">${I.right}</button></div></div>
      <div class="mcal">${cells}</div>`;
  }

  // ---------- schedule ----------
  async function viewSched() {
    const sc = S.sched; const o = S.offices.find((x) => x.id === sc.office) || S.offices[0]; sc.office = o.id;
    if (!sc.ranges || sc.rangesFor !== o.id) {
      const { data } = await sb.from("schedules").select("*").eq("office_id", o.id).order("open_time");
      sc.ranges = [0, 1, 2, 3, 4, 5, 6].map((w) => (data || []).filter((r) => r.weekday === w).map((r) => ({ open: hm(r.open_time), close: hm(r.close_time) }))); sc.rangesFor = o.id;
    }
    const { data: blocks } = await sb.from("blocks").select("*").gte("block_date", addDays(todayET(), -60)).order("block_date");
    const tzs = ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles"];
    const wk = [1, 2, 3, 4, 5, 6, 0].map((w) => `<div class="wk"><b>${esc(t("wdays")[w])}</b><div class="ranges">
      ${sc.ranges[w].length ? sc.ranges[w].map((r, i) => `<div class="rng"><input type="time" step="300" data-w="${w}" data-i="${i}" data-k="open" value="${r.open}"> – <input type="time" step="300" data-w="${w}" data-i="${i}" data-k="close" value="${r.close}"><button class="btn btn-ghost" style="min-height:34px;padding:4px 10px" data-act="rng-del" data-w="${w}" data-i="${i}">${t("remove")}</button></div>`).join("") : `<span class="muted">${t("closed")}</span>`}
      <div><button class="btn btn-ghost" style="min-height:34px;padding:4px 10px" data-act="rng-add" data-w="${w}">+ ${t("add_range")}</button></div></div></div>`).join("");
    const chk = sc.check;
    return `<div class="row" style="margin-bottom:14px">${S.offices.map((x) => `<button class="btn ${x.id === o.id ? "btn-primary" : "btn-ghost"}" data-act="sched-office" data-o="${x.id}">${esc(x.name)}</button>`).join("")}</div>
      <div class="grid2" style="align-items:start">
      <div class="card"><h3>${t("office_info")}</h3>
        <label class="f">${t("name_l")}</label><input id="oName" value="${esc(o.name)}">
        <label class="f">${t("address")}</label><input id="oAddr" value="${esc(o.address || "")}" placeholder="${t("address_ph")}">
        <label class="f">${t("phone")}</label><input id="oPhone" value="${esc(o.phone)}">
        <label class="f">${t("timezone")}</label><select id="oTz">${tzs.map((z) => `<option ${z === o.timezone ? "selected" : ""}>${z}</option>`).join("")}</select>
        <div class="grid2"><div><label class="f">${t("slot_len")}</label><input id="oSlot" type="number" min="10" max="480" step="5" value="${o.slot_minutes}"></div><div><label class="f">${t("buffer")}</label><input id="oBuf" type="number" min="0" max="240" step="5" value="${o.buffer_minutes}"></div></div>
        <label class="check"><input type="checkbox" id="oActive" ${o.active ? "checked" : ""}><span>${t("active")}</span></label>
        <h3 style="margin-top:20px">${t("weekly")}</h3>${wk}
        <div class="btn-row"><button class="btn btn-gold" data-act="sched-save">${t("save_sched")}</button></div></div>
      <div><div class="card"><h3>${t("blocks")}</h3>
        <div class="grid2"><div><label class="f">${t("office")}</label><select id="bOff"><option value="">${t("both")}</option>${S.offices.map((x) => `<option value="${x.id}">${esc(x.name)}</option>`).join("")}</select></div><div><label class="f">${t("reason")}</label><input id="bReason" maxlength="100"></div>
        <div><label class="f">${t("from")}</label><input type="date" id="bFrom" value="${todayET()}"></div><div><label class="f">${t("to")}</label><input type="date" id="bTo"></div></div>
        <label class="check"><input type="checkbox" id="bAll" checked><span>${t("whole_day")}</span></label>
        <div class="row" id="bTimes" hidden style="margin-top:8px"><input type="time" id="bStart" style="width:auto"> – <input type="time" id="bEnd" style="width:auto"></div>
        <div id="bErr"></div><div class="btn-row"><button class="btn btn-primary" data-act="block-add">${t("add_block")}</button></div>
        <div style="margin-top:16px">${(blocks || []).map((b) => `<div class="row" style="justify-content:space-between;border-top:1px solid var(--line);padding:8px 0"><span><b>${esc(fDate(b.block_date))}${b.end_date && b.end_date !== b.block_date ? " → " + esc(fDate(b.end_date)) : ""}</b> · ${b.start_time ? esc(fTime(hm(b.start_time))) + "–" + esc(fTime(hm(b.end_time))) : t("whole_day")} · ${esc(b.office_id ? offName(b.office_id) : t("both"))}${b.reason ? "<br><span class='muted small'>" + esc(b.reason) + "</span>" : ""}</span><button class="btn btn-ghost" style="min-height:34px;padding:4px 10px" data-act="block-del" data-id="${b.id}">${t("remove")}</button></div>`).join("") || `<p class="muted small">—</p>`}</div></div>
      <div class="card" style="margin-top:16px"><h3>${t("check_day")}</h3><div class="row"><input type="date" id="chkDate" value="${sc.checkDate}" style="width:auto"><span class="muted">${esc(o.name)}</span></div>
        ${chk ? `<p class="small"><b>${t("free_times")}:</b> ${chk.slots.length ? chk.slots.map((s) => esc(fTime(s))).join(", ") : "—"}</p><p class="small"><b>${t("booked")}:</b> ${chk.booked.length ? chk.booked.map((a) => `<a href="#" data-act="open" data-id="${a.id}">${esc(fTime(hm(a.appt_time)))} ${esc(a.full_name)}</a>`).join(", ") : "—"}</p><p class="small muted">${t("remaining_day", { n: chk.remaining })}</p>` : ""}</div></div></div>`;
  }
  async function loadCheck() {
    const sc = S.sched; const [{ data: s }, { data: b }] = await Promise.all([sb.rpc("admin_slots", { p_office: sc.office, p_date: sc.checkDate, p_exclude: null }), sb.from("appointments").select("id,appt_time,full_name").eq("office_id", sc.office).eq("appt_date", sc.checkDate).in("status", ["pending", "confirmed"]).order("appt_time")]);
    sc.check = { slots: (s && s.slots) || [], remaining: s ? s.remaining : 0, booked: b || [] }; render();
  }
  async function saveSched(force) {
    const sc = S.sched; const o = S.offices.find((x) => x.id === sc.office);
    const sched = []; let bad = false;
    sc.ranges.forEach((rs, w) => rs.forEach((r) => { if (!r.open || !r.close || r.close <= r.open) bad = true; sched.push({ weekday: w, open_time: r.open, close_time: r.close }); }));
    if (bad) return toast(t("invalid_range"));
    const slot = Math.max(10, parseInt($("#oSlot").value) || 60), buf = Math.max(0, parseInt($("#oBuf").value) || 0);
    const info = { name: $("#oName").value.trim() || o.name, address: $("#oAddr").value.trim() || null, phone: $("#oPhone").value.trim() || o.phone, timezone: $("#oTz").value, active: $("#oActive").checked };
    if (!force) {
      const { data: conf } = await sb.rpc("admin_schedule_conflicts", { p_office: o.id, p_schedule: sched, p_slot_minutes: slot });
      if (conf && conf.length) {
        modal(`<h3>${t("conflicts_title")}</h3><p class="muted small">${t("conflicts_body")}</p>${conf.map((a) => `<div class="row" style="justify-content:space-between;border-top:1px solid var(--line);padding:8px 0"><span><b>${esc(a.full_name)}</b> · ${esc(fDate(a.date))} ${esc(fTime(a.time))}<br><span class="muted small">${esc(a.code)} · ${esc(a.phone)}</span></span><button class="btn btn-ghost" data-act="open" data-id="${a.id}">${t("a_reschedule")}</button></div>`).join("")}
          <div class="btn-row"><button class="btn btn-gold" id="saveAny">${t("save_anyway")}</button><button class="btn btn-ghost" data-act="close">${t("close")}</button></div>`, true);
        $("#saveAny").onclick = () => { closeModal(); saveSched(true); }; bindModalGeneric(); return;
      }
    }
    const [r1, r2] = await Promise.all([sb.rpc("admin_save_schedule", { p_office: o.id, p_schedule: sched, p_slot_minutes: slot, p_buffer_minutes: buf }), sb.from("offices").update(info).eq("id", o.id)]);
    if (r1.error || r2.error) return toast(errT(r1.error || r2.error));
    await loadBase(); sc.ranges = null; toast(t("saved")); render();
  }
  async function addBlock() {
    const off = $("#bOff").value || null, from = $("#bFrom").value, to = $("#bTo").value || null, all = $("#bAll").checked, st = $("#bStart").value, en = $("#bEnd").value;
    if (!from || (to && to < from) || (!all && (!st || !en || en <= st))) { $("#bErr").innerHTML = `<div class="notice bad">${t("invalid_range")}</div>`; return; }
    const row = { office_id: off, block_date: from, end_date: to, start_time: all ? null : st, end_time: all ? null : en, reason: $("#bReason").value.trim() || null };
    let q = sb.from("appointments").select("id,appt_time,office_id").gte("appt_date", from).lte("appt_date", to || from).in("status", ["pending", "confirmed"]); if (off) q = q.eq("office_id", off);
    const { data: hit } = await q; const affected = (hit || []).filter((a) => all || (hm(a.appt_time) < en && hm(a.appt_time) >= st));
    const go = async () => { const { error } = await sb.from("blocks").insert(row); if (error) return toast(errT(error)); toast(t("saved")); render(); };
    if (affected.length) confirmBox(t("block_affects", { n: affected.length }), go); else go();
  }

  // ---------- payments ----------
  async function viewPay() {
    let q = sb.from("appointments").select("*").neq("payment_status", "not_required").neq("status", "cancelled").order("appt_date");
    if (!S.pay.showPaid) q = q.in("payment_status", ["pending", "verification"]);
    const { data } = await q; const rows = data || [];
    return `<h2>${t("tab_pay")}</h2><div class="notice info small">${t("pay_intro")}</div>
      <label class="check" style="margin-bottom:12px"><input type="checkbox" id="showPaid" ${S.pay.showPaid ? "checked" : ""}><span>${t("show_paid")}</span></label>
      ${rows.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>${t("code")}</th><th>${t("client")}</th><th>${t("date")}</th><th>${t("amount")}</th><th>${t("client_note")}</th><th>${t("payment")}</th><th></th></tr></thead><tbody>
      ${rows.map((a) => `<tr><td><span class="chip">${esc(a.confirmation_code)}</span></td><td><a href="#" data-act="open" data-id="${a.id}"><b>${esc(a.full_name)}</b></a><br><span class="muted small">${esc(a.phone)}</span></td><td>${esc(fDate(a.appt_date))} ${esc(fTime(hm(a.appt_time)))}</td><td>$${esc(a.price)}</td><td>${esc(a.payment_note || "")}</td><td>${badge("ps", a.payment_status)}</td>
        <td>${a.payment_status !== "paid" ? `<button class="btn btn-cash" style="min-height:36px;padding:6px 12px" data-act="pay-ok" data-id="${a.id}">${t("a_paid")}</button>` : ""}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">${t("none")}</p>`}`;
  }

  // ---------- settings ----------
  async function viewSet() {
    const s = S.settings; const { data: admins } = await sb.from("admins").select("*").order("created_at");
    const L = ["en", "es", "fr"]; const LN = { en: "English", es: "Español", fr: "Français" };
    const svc = S.services.map((x) => `<div class="card" style="margin-top:12px"><span class="tag">${esc(x.id)}</span>
      ${L.map((l) => `<div class="grid2"><div><label class="f">${t("name_l")} (${LN[l]})</label><input data-svc="${x.id}" data-f="name" data-l="${l}" value="${esc(x.name[l] || "")}"></div><div><label class="f">${t("desc_l")} (${LN[l]})</label><input data-svc="${x.id}" data-f="description" data-l="${l}" value="${esc(x.description[l] || "")}"></div></div>`).join("")}
      <div class="grid2"><div><label class="f">${t("price")}</label><input type="number" min="0" step="0.01" data-svc="${x.id}" data-f="price" value="${x.price ?? ""}"></div><div><label class="check" style="margin-top:38px"><input type="checkbox" data-svc="${x.id}" data-f="active" ${x.active ? "checked" : ""}><span>${t("svc_active")}</span></label></div></div></div>`).join("");
    const chk = (id, k, label) => `<label class="check"><input type="checkbox" id="${id}" ${s[k] ? "checked" : ""}><span>${label}</span></label>`;
    return `<div class="grid2" style="align-items:start"><div>
      <div class="card"><h3>${t("general")}</h3>
        ${chk("sOpen", "booking_open", "<b>" + t("booking_open") + "</b>")}${chk("sAuto", "auto_confirm", t("auto_confirm"))}${chk("sOff", "allow_office_change", t("allow_office"))}
        <label class="f">${t("daily_limit")}</label><input id="sLimit" type="number" min="0" max="500" value="${s.daily_limit}">
        <label class="f">${t("window")}</label><input id="sWin" type="number" min="1" max="365" value="${s.booking_window_days}">
        <label class="f">${t("notice")}</label><input id="sNotice" type="number" min="0" max="168" value="${s.min_notice_hours}"></div>
      <div class="card" style="margin-top:16px"><h3>${t("contact")}</h3>
        <label class="f">${t("phone")}</label><input id="sPhone" value="${esc(s.phone)}"><label class="f">${t("email")}</label><input id="sEmail" type="email" value="${esc(s.email)}">
        <label class="f">${t("whatsapp")}</label><input id="sWa" value="${esc(s.whatsapp)}" inputmode="numeric"><label class="f">${t("cashapp")}</label><input id="sCash" value="${esc(s.cashapp_url)}">
        <label class="f">${t("site_url")}</label><input id="sSite" value="${esc(s.site_url || location.origin)}">
        ${chk("sNotify", "notify_admin", t("notify_admin"))}</div>
      <div class="btn-row"><button class="btn btn-gold" data-act="set-save">${t("save")}</button></div>
      <div class="card" style="margin-top:16px"><h3>${t("email_setup")}</h3><p class="small">${t("email_setup_body")}</p></div>
      <div class="card" style="margin-top:16px"><h3>${t("admins")}</h3>${(admins || []).map((a) => `<div class="row" style="justify-content:space-between;border-top:1px solid var(--line);padding:8px 0"><span>${esc(a.email)}</span>${a.user_id !== S.user.id ? `<button class="btn btn-ghost" style="min-height:34px;padding:4px 10px" data-act="adm-del" data-id="${a.user_id}">${t("remove")}</button>` : ""}</div>`).join("")}
        <label class="f">${t("add_admin")}</label><div class="row"><input id="admEmail" type="email" style="flex:1;width:auto"><button class="btn btn-primary" data-act="adm-add">${t("add_admin")}</button></div><p class="muted small">${t("add_admin_help")}</p></div>
      </div><div><div class="card"><h3>${t("services")}</h3>${svc}<div class="btn-row"><button class="btn btn-gold" data-act="svc-save">${t("save")}</button></div></div></div></div>`;
  }
  async function saveSettings() {
    const n = (id, d) => { const v = parseInt($(id).value); return isNaN(v) ? d : v; };
    const upd = { booking_open: $("#sOpen").checked, auto_confirm: $("#sAuto").checked, allow_office_change: $("#sOff").checked, daily_limit: n("#sLimit", 10), booking_window_days: n("#sWin", 60), min_notice_hours: n("#sNotice", 2),
      phone: $("#sPhone").value.trim(), email: $("#sEmail").value.trim(), whatsapp: $("#sWa").value.replace(/\D/g, ""), cashapp_url: $("#sCash").value.trim(), site_url: $("#sSite").value.trim() || null, notify_admin: $("#sNotify").checked, updated_at: new Date().toISOString() };
    if (!/^https:\/\//.test(upd.cashapp_url)) return toast(t("cashapp") + "?");
    const { error } = await sb.from("settings").update(upd).eq("id", 1); if (error) return toast(errT(error));
    await loadBase(); toast(t("saved")); render();
  }
  async function saveServices() {
    for (const x of S.services) {
      const u = { name: Object.assign({}, x.name), description: Object.assign({}, x.description) };
      document.querySelectorAll(`[data-svc="${x.id}"]`).forEach((el) => { const f = el.dataset.f; if (f === "price") u.price = el.value === "" ? null : Number(el.value); else if (f === "active") u.active = el.checked; else u[f][el.dataset.l] = el.value.trim(); });
      const { error } = await sb.from("services").update(u).eq("id", x.id); if (error) return toast(errT(error));
    }
    await loadBase(); toast(t("saved")); render();
  }

  // ---------- render ----------
  const TABS = [["dash", "tab_dash"], ["appts", "tab_appts"], ["cal", "tab_cal"], ["sched", "tab_sched"], ["pay", "tab_pay"], ["set", "tab_set"]];
  let renderSeq = 0;
  async function render() {
    document.documentElement.lang = lang; $("#langSel").value = lang; $("#adminTag").textContent = t("admin");
    $("#logoutBtn").hidden = !S.user; $("#logoutBtn").textContent = t("sign_out");
    if (!S.user || !S.isAdmin || S.recovery) { $("#tabs").hidden = true; app.innerHTML = viewAuth(); return; }
    $("#tabs").hidden = false; $("#tabs").innerHTML = TABS.map(([k, l]) => `<button class="${S.tab === k ? "on" : ""}" data-tab="${k}">${t(l)}</button>`).join("");
    const seq = ++renderSeq; const fn = { dash: viewDash, appts: viewAppts, cal: viewCal, sched: viewSched, pay: viewPay, set: viewSet }[S.tab];
    if (!app.innerHTML || app.dataset.tab !== S.tab) app.innerHTML = `<div class="wrap section"><p class="muted"><span class="spinner"></span> ${t("loading")}</p></div>`;
    const html = await fn(); if (seq !== renderSeq) return;
    const fid = document.activeElement && document.activeElement.closest("#fForm") && document.activeElement.name;
    app.innerHTML = `<div class="wrap section">${html}</div>`; app.dataset.tab = S.tab;
    if (fid) { const el = $(`#fForm [name="${fid}"]`); if (el) { el.focus(); if (el.type === "text" || el.tagName === "INPUT" && !el.type.match(/date/)) { const v = el.value; el.value = ""; el.value = v; } } }
  }
  const refresh = () => render();
  function bindModalGeneric() { $("#modalRoot").onclick = (ev) => { const b = ev.target.closest("[data-act]"); if (ev.target.dataset && ev.target.dataset.close) return closeModal(); if (!b) return; if (b.dataset.act === "close") closeModal(); if (b.dataset.act === "open") openAppt(b.dataset.id); }; }

  // ---------- events ----------
  document.addEventListener("click", async (ev) => {
    if (ev.target.closest("#modalRoot")) return;
    const tab = ev.target.closest("[data-tab]"); if (tab) { S.tab = tab.dataset.tab; render(); return; }
    const b = ev.target.closest("[data-act]"); if (!b) return; const act = b.dataset.act;
    if (b.tagName === "A") ev.preventDefault();
    const sc = S.sched;
    switch (act) {
      case "auth-forgot": S.authMode = "forgot"; S.authErr = S.authMsg = ""; render(); break;
      case "auth-signup": S.authMode = "signup"; S.authErr = S.authMsg = ""; render(); break;
      case "auth-login": S.authMode = "login"; S.authErr = S.authMsg = ""; render(); break;
      case "logout": await sb.auth.signOut(); break;
      case "dash-today": S.dash.date = todayET(); render(); break;
      case "open": openAppt(b.dataset.id); break;
      case "new": newModal(); break;
      case "csv": exportCsv(); break;
      case "cal-prev": case "cal-next": { const [y, m] = S.cal.month.split("-").map(Number); const d = new Date(Date.UTC(y, m - 1 + (act === "cal-next" ? 1 : -1), 1)); S.cal.month = d.toISOString().slice(0, 7); render(); break; }
      case "cal-today": S.cal.month = todayET().slice(0, 7); render(); break;
      case "cal-day": Object.assign(S.list, { from: b.dataset.d, to: b.dataset.d, status: "", q: "" }); S.tab = "appts"; render(); break;
      case "sched-office": sc.office = b.dataset.o; sc.ranges = null; sc.check = null; render(); break;
      case "rng-add": { const w = +b.dataset.w; const prev = sc.ranges[w][sc.ranges[w].length - 1]; sc.ranges[w].push(prev ? { open: prev.close, close: prev.close } : { open: "", close: "" }); render(); break; }
      case "rng-del": sc.ranges[+b.dataset.w].splice(+b.dataset.i, 1); render(); break;
      case "sched-save": saveSched(false); break;
      case "block-add": addBlock(); break;
      case "block-del": { const { error } = await sb.from("blocks").delete().eq("id", b.dataset.id); toast(error ? errT(error) : t("saved")); render(); break; }
      case "pay-ok": confirmBox(t("paid_q"), async () => { const { error } = await sb.from("appointments").update({ payment_status: "paid" }).eq("id", b.dataset.id); toast(error ? errT(error) : t("saved")); render(); }); bindConfirmOnly(); break;
      case "set-save": saveSettings(); break;
      case "svc-save": saveServices(); break;
      case "adm-add": { const { data, error } = await sb.rpc("admin_add", { p_email: $("#admEmail").value }); toast(error ? errT(error) : data === "OK" ? t("saved") : t("no_account")); render(); break; }
      case "adm-del": confirmBox(t("remove") + "?", async () => { const { error } = await sb.rpc("admin_remove", { p_user: b.dataset.id }); toast(error ? errT(error) : t("saved")); render(); }, true); bindConfirmOnly(); break;
    }
  });
  function bindConfirmOnly() { $("#modalRoot").onclick = (ev) => { if ((ev.target.dataset && ev.target.dataset.close) || (ev.target.closest("[data-act]") && ev.target.closest("[data-act]").dataset.act === "close")) closeModal(); }; }
  document.addEventListener("input", (ev) => {
    const el = ev.target;
    if (el.dataset.w != null && el.dataset.k) { S.sched.ranges[+el.dataset.w][+el.dataset.i][el.dataset.k] = el.value; }
  });
  let fTimer;
  document.addEventListener("change", (ev) => {
    const el = ev.target;
    if (el.id === "dashDate") { S.dash.date = el.value || todayET(); render(); }
    if (el.closest && el.closest("#fForm") && el.name !== "q") { S.list[el.name] = el.value; render(); }
    if (el.id === "showPaid") { S.pay.showPaid = el.checked; render(); }
    if (el.id === "chkDate") { S.sched.checkDate = el.value; loadCheck(); }
    if (el.id === "bAll") { $("#bTimes").hidden = el.checked; }
  });
  document.addEventListener("keyup", (ev) => { const el = ev.target; if (el.closest && el.closest("#fForm") && el.name === "q") { clearTimeout(fTimer); fTimer = setTimeout(() => { S.list.q = el.value; render(); }, 350); } });
  document.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (ev.target.id === "authForm") onAuthSubmit();
    if (ev.target.id === "pwForm") { const pw = $("#newPw").value; if (pw.length < 8) { S.authErr = t("pw_min"); return render(); } const { error } = await sb.auth.updateUser({ password: pw }); if (error) { S.authErr = error.message; return render(); } S.recovery = false; toast(t("saved")); const { data } = await sb.auth.getSession(); afterSession(data.session); }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  $("#langSel").addEventListener("change", (e) => { lang = e.target.value; try { localStorage.setItem("cts_lang", lang); } catch (x) {} render(); });
  $("#langIcon").innerHTML = I.globe;
  $("#logoutBtn").addEventListener("click", () => sb.auth.signOut());
  

  sb.auth.onAuthStateChange((evt, session) => {
    if (evt === "PASSWORD_RECOVERY") { S.recovery = true; S.user = session && session.user; render(); return; }
    if (evt === "SIGNED_IN" || evt === "SIGNED_OUT" || evt === "INITIAL_SESSION") setTimeout(() => afterSession(session), 0);
  });
})();
