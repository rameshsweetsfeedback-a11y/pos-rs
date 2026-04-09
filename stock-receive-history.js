const STORAGE_KEYS = {
  transferHistory: "sweet-shop-pos:transfer-history",
  session: "sweet-shop-pos:session",
};

const elements = {
  stockHistoryDateFilter: document.querySelector("#stockHistoryDateFilter"),
  stockHistorySummary: document.querySelector("#stockHistorySummary"),
  stockHistoryList: document.querySelector("#stockHistoryList"),
};

const state = {
  transferHistory: [],
  role: null,
};

initialize();

async function initialize() {
  bindEvents();
  await hydrateState();
  await hydrateSession();
  startLiveSync();
  render();
}

function bindEvents() {
  elements.stockHistoryDateFilter.addEventListener("input", render);
}

async function hydrateState() {
  const stored = await window.PosDb.loadMany({
    [STORAGE_KEYS.transferHistory]: [],
    [STORAGE_KEYS.session]: null,
  });

  state.transferHistory = stored[STORAGE_KEYS.transferHistory] || [];
  state.role = stored[STORAGE_KEYS.session];
}

async function hydrateSession() {
  try {
    const session = await window.PosDb.getSession();
    state.role = session.user?.role || state.role;
  } catch (error) {
    console.warn("Failed to hydrate stock receive history session", error);
  }
}

function startLiveSync() {
  window.PosDb.watch([STORAGE_KEYS.transferHistory], (values) => {
    state.transferHistory = values[STORAGE_KEYS.transferHistory] || [];
    render();
  });
}

function render() {
  const entries = getFilteredEntries();
  renderSummary(entries);
  renderList(entries);
}

function getFilteredEntries() {
  const selectedDate = elements.stockHistoryDateFilter.value;
  return selectedDate
    ? state.transferHistory.filter((entry) => matchesDate(entry.createdAt, selectedDate))
    : state.transferHistory;
}

function renderSummary(entries) {
  const totalEntries = entries.length;
  const totalIn = entries
    .filter((entry) => entry.transferType === "in")
    .reduce((sum, entry) => sum + entry.quantity, 0);
  const totalOut = entries
    .filter((entry) => entry.transferType === "out")
    .reduce((sum, entry) => sum + entry.quantity, 0);

  elements.stockHistorySummary.innerHTML = `
    <div class="summary-row">
      <span>Entries</span>
      <strong>${totalEntries}</strong>
    </div>
    <div class="summary-row">
      <span>Item In</span>
      <strong>${formatNumber(totalIn)}</strong>
    </div>
    <div class="summary-row">
      <span>Item Out</span>
      <strong>${formatNumber(totalOut)}</strong>
    </div>
    <div class="summary-row">
      <span>Session</span>
      <strong>${escapeHtml(state.role || "Guest")}</strong>
    </div>
  `;
}

function renderList(entries) {
  if (!entries.length) {
    elements.stockHistoryList.innerHTML = `<div class="empty-state">No stock receive history for the selected date.</div>`;
    return;
  }

  elements.stockHistoryList.innerHTML = entries
    .slice(0, 50)
    .map(
      (entry) => `
        <article class="order-card transfer-card">
          <div class="order-row">
            <strong>${escapeHtml(entry.productName)}</strong>
            <strong>${formatNumber(entry.quantity)} ${escapeHtml(entry.unit)}</strong>
          </div>
          <div class="order-row muted">
            <span>${entry.transferType === "out" ? "Item Out" : "Item In"}</span>
            <span>${new Date(entry.createdAt).toLocaleString("en-IN")}</span>
          </div>
          <div class="order-row muted">
            <span>Requested by ${escapeHtml(entry.requestedBy || "Admin")}</span>
            <span>${escapeHtml(entry.status || "Pending")}</span>
          </div>
          <div class="order-row muted">
            <span>${entry.acceptedAt ? `Accepted ${new Date(entry.acceptedAt).toLocaleString("en-IN")}` : "Not accepted yet"}</span>
            <span>${entry.acceptedBy ? `By ${escapeHtml(entry.acceptedBy)}` : ""}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function matchesDate(isoValue, selectedDate) {
  return new Date(isoValue).toISOString().slice(0, 10) === selectedDate;
}

function formatNumber(value) {
  return Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
