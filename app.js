const STORAGE_KEYS = {
  products: "sweet-shop-pos:products",
  orders: "sweet-shop-pos:orders",
  expenses: "sweet-shop-pos:expenses",
  session: "sweet-shop-pos:session",
  pendingTransfers: "sweet-shop-pos:pending-transfers",
  transferHistory: "sweet-shop-pos:transfer-history",
  cart: "sweet-shop-pos:cart",
  search: "sweet-shop-pos:search",
  activeCategory: "sweet-shop-pos:active-category",
  customerName: "sweet-shop-pos:customer-name",
  discount: "sweet-shop-pos:discount",
  taxRate: "sweet-shop-pos:tax-rate",
  paymentMethod: "sweet-shop-pos:payment-method",
};

const seedProducts = [
  { id: crypto.randomUUID(), name: "Kaju Katli", category: "Sweets", unit: "kg", price: 920, stock: 18, minStock: 5 },
  { id: crypto.randomUUID(), name: "Gulab Jamun", category: "Sweets", unit: "kg", price: 380, stock: 24, minStock: 5 },
  { id: crypto.randomUUID(), name: "Rasgulla Tin", category: "Gift Packs", unit: "box", price: 210, stock: 30, minStock: 5 },
  { id: crypto.randomUUID(), name: "Motichoor Ladoo", category: "Sweets", unit: "kg", price: 460, stock: 16, minStock: 5 },
  { id: crypto.randomUUID(), name: "Samosa", category: "Snacks", unit: "piece", price: 18, stock: 160, minStock: 20 },
  { id: crypto.randomUUID(), name: "Dry Fruit Box", category: "Gift Packs", unit: "box", price: 650, stock: 12, minStock: 4 },
];

const state = {
  products: [...seedProducts],
  orders: [],
  expenses: [],
  pendingTransfers: [],
  transferHistory: [],
  cart: [],
  search: "",
  activeCategory: "All",
  pendingProductId: null,
  role: null,
  customerName: "",
  discount: "0",
  taxRate: "5",
  paymentMethod: "Cash",
  adminDateFilter: "",
  serverInfo: null,
  splitPayments: {
    Cash: "0",
    Card: "0",
    UPI: "0",
    Credit: "0",
  },
};

const elements = {
  loginScreen: document.querySelector("#loginScreen"),
  loginMessage: document.querySelector("#loginMessage"),
  adminPassword: document.querySelector("#adminPassword"),
  cashierPassword: document.querySelector("#cashierPassword"),
  loginAdmin: document.querySelector("#loginAdmin"),
  loginCashier: document.querySelector("#loginCashier"),
  logoutButton: document.querySelector("#logoutButton"),
  userRole: document.querySelector("#userRole"),
  appLayout: document.querySelector("#appLayout"),
  adminLayout: document.querySelector("#adminLayout"),
  adminLogoutButton: document.querySelector("#adminLogoutButton"),
  adminViewPos: document.querySelector("#adminViewPos"),
  adminMenu: document.querySelector("#adminMenu"),
  adminLowStock: document.querySelector("#adminLowStock"),
  adminStockTransfer: document.querySelector("#adminStockTransfer"),
  adminBackup: document.querySelector("#adminBackup"),
  adminRestore: document.querySelector("#adminRestore"),
  adminRestoreFile: document.querySelector("#adminRestoreFile"),
  posNavRecentOrders: document.querySelector("#posNavRecentOrders"),
  posLowStock: document.querySelector("#posLowStock"),
  posExpense: document.querySelector("#posExpense"),
  posStockTransfer: document.querySelector("#posStockTransfer"),
  posStockReceiveHistory: document.querySelector("#posStockReceiveHistory"),
  posStockTransferCount: document.querySelector("#posStockTransferCount"),
  adminDateFilter: document.querySelector("#adminDateFilter"),
  adminStats: document.querySelector("#adminStats"),
  adminPayments: document.querySelector("#adminPayments"),
  adminOrders: document.querySelector("#adminOrders"),
  serverInfo: document.querySelector("#serverInfo"),
  recentOrdersPanel: document.querySelector("#recentOrdersPanel"),
  searchInput: document.querySelector("#searchInput"),
  categoryFilters: document.querySelector("#categoryFilters"),
  catalog: document.querySelector("#catalog"),
  cartItems: document.querySelector("#cartItems"),
  discount: document.querySelector("#discount"),
  taxRate: document.querySelector("#taxRate"),
  paymentMethod: document.querySelector("#paymentMethod"),
  splitPaymentSection: document.querySelector("#splitPaymentSection"),
  splitCash: document.querySelector("#splitCash"),
  splitCard: document.querySelector("#splitCard"),
  splitUpi: document.querySelector("#splitUpi"),
  splitCredit: document.querySelector("#splitCredit"),
  splitPaymentSummary: document.querySelector("#splitPaymentSummary"),
  customerName: document.querySelector("#customerName"),
  clearCart: document.querySelector("#clearCart"),
  checkoutButton: document.querySelector("#checkoutButton"),
  summary: document.querySelector("#summary"),
  stats: document.querySelector("#stats"),
  orderHistory: document.querySelector("#orderHistory"),
  receiptDialog: document.querySelector("#receiptDialog"),
  receiptContent: document.querySelector("#receiptContent"),
  printReceipt: document.querySelector("#printReceipt"),
  closeReceipt: document.querySelector("#closeReceipt"),
  confirmationDialog: document.querySelector("#confirmationDialog"),
  confirmationContent: document.querySelector("#confirmationContent"),
  confirmationPrint: document.querySelector("#confirmationPrint"),
  confirmationClose: document.querySelector("#confirmationClose"),
  addItemDialog: document.querySelector("#addItemDialog"),
  addItemForm: document.querySelector("#addItemForm"),
  cancelAddItem: document.querySelector("#cancelAddItem"),
  selectedProductText: document.querySelector("#selectedProductText"),
  dialogAmount: document.querySelector("#dialogAmount"),
  dialogQuantity: document.querySelector("#dialogQuantity"),
  calculatedQuantity: document.querySelector("#calculatedQuantity"),
  stockTransferDialog: document.querySelector("#stockTransferDialog"),
  stockTransferForm: document.querySelector("#stockTransferForm"),
  cancelStockTransfer: document.querySelector("#cancelStockTransfer"),
  stockTransferItem: document.querySelector("#stockTransferItem"),
  stockTransferType: document.querySelector("#stockTransferType"),
  stockTransferQuantity: document.querySelector("#stockTransferQuantity"),
  stockTransferDateFilter: document.querySelector("#stockTransferDateFilter"),
  stockTransferHistory: document.querySelector("#stockTransferHistory"),
};

initialize();

async function initialize() {
  bindEvents();
  await hydrateAuthSession();
  await hydrateState();
  startLiveSync();
  await fetchServerInfo();
  render();
}

function bindEvents() {
  elements.loginAdmin.addEventListener("click", () => login("Admin", elements.adminPassword.value));
  elements.loginCashier.addEventListener("click", () => login("Cashier", elements.cashierPassword.value));
  elements.logoutButton.addEventListener("click", logout);
  elements.adminLogoutButton.addEventListener("click", logout);
  elements.adminViewPos.addEventListener("click", openPosFromAdmin);
  elements.adminMenu.addEventListener("click", openAdminMenuPage);
  elements.adminLowStock.addEventListener("click", openLowStockPage);
  elements.adminStockTransfer.addEventListener("click", openStockTransferDialog);
  elements.adminBackup.addEventListener("click", downloadDatabaseBackup);
  elements.adminRestore.addEventListener("click", () => elements.adminRestoreFile.click());
  elements.adminRestoreFile.addEventListener("change", restoreDatabaseBackup);
  elements.adminDateFilter.addEventListener("input", (event) => {
    state.adminDateFilter = event.target.value;
    renderAdmin();
  });
  elements.posNavRecentOrders.addEventListener("click", () => scrollToSection(elements.recentOrdersPanel));
  elements.posLowStock.addEventListener("click", openLowStockPage);
  elements.posExpense.addEventListener("click", openExpensePage);
  elements.posStockTransfer.addEventListener("click", openStockTransferPage);
  elements.posStockReceiveHistory.addEventListener("click", openStockReceiveHistoryPage);
  elements.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    persistState(STORAGE_KEYS.search, state.search);
    renderCatalog();
  });
  elements.discount.addEventListener("input", (event) => {
    state.discount = event.target.value || "0";
    persistState(STORAGE_KEYS.discount, state.discount);
    renderSummary();
  });
  elements.taxRate.addEventListener("input", (event) => {
    state.taxRate = event.target.value || "5";
    persistState(STORAGE_KEYS.taxRate, state.taxRate);
    renderSummary();
  });
  elements.paymentMethod.addEventListener("change", (event) => {
    state.paymentMethod = event.target.value || "Cash";
    persistState(STORAGE_KEYS.paymentMethod, state.paymentMethod);
    renderSummary();
  });
  [elements.splitCash, elements.splitCard, elements.splitUpi, elements.splitCredit].forEach((input) => {
    input.addEventListener("input", renderSummary);
  });
  elements.customerName.addEventListener("input", (event) => {
    state.customerName = event.target.value;
    persistState(STORAGE_KEYS.customerName, state.customerName);
  });
  elements.clearCart.addEventListener("click", clearCart);
  elements.checkoutButton.addEventListener("click", completeSale);
  elements.printReceipt.addEventListener("click", printActiveReceipt);
  elements.closeReceipt.addEventListener("click", () => elements.receiptDialog.close());
  elements.confirmationPrint.addEventListener("click", () => {
      elements.confirmationDialog.close();
      elements.receiptDialog.showModal();
      printActiveReceipt();
    });
  elements.confirmationClose.addEventListener("click", () => elements.confirmationDialog.close());
  elements.addItemForm.addEventListener("submit", handleAddItemSubmit);
  elements.cancelAddItem.addEventListener("click", closeAddItemDialog);
  elements.stockTransferForm.addEventListener("submit", handleStockTransferSubmit);
  elements.cancelStockTransfer.addEventListener("click", closeStockTransferDialog);
  elements.stockTransferDateFilter.addEventListener("input", renderStockTransferHistory);
  elements.dialogAmount.addEventListener("input", () => syncDialogFields("amount"));
  elements.dialogQuantity.addEventListener("input", () => syncDialogFields("quantity"));
}

async function hydrateAuthSession() {
  try {
    const session = await window.PosDb.getSession();
    state.role = session.user?.role || null;
    persistState(STORAGE_KEYS.session, state.role);
  } catch (error) {
    console.warn("Failed to hydrate auth session", error);
  }
}

async function hydrateState() {
  const stored = await window.PosDb.loadMany({
    [STORAGE_KEYS.products]: seedProducts,
    [STORAGE_KEYS.orders]: [],
    [STORAGE_KEYS.expenses]: [],
    [STORAGE_KEYS.pendingTransfers]: [],
    [STORAGE_KEYS.transferHistory]: [],
    [STORAGE_KEYS.cart]: [],
    [STORAGE_KEYS.search]: "",
    [STORAGE_KEYS.activeCategory]: "All",
    [STORAGE_KEYS.session]: null,
    [STORAGE_KEYS.customerName]: "",
    [STORAGE_KEYS.discount]: "0",
    [STORAGE_KEYS.taxRate]: "5",
    [STORAGE_KEYS.paymentMethod]: "Cash",
  });

  state.products = stored[STORAGE_KEYS.products].map((product) => ({
    ...product,
    minStock: Number(product.minStock ?? 5),
  }));
  state.orders = stored[STORAGE_KEYS.orders];
  state.expenses = stored[STORAGE_KEYS.expenses];
  state.pendingTransfers = stored[STORAGE_KEYS.pendingTransfers];
  state.transferHistory = stored[STORAGE_KEYS.transferHistory];
  state.cart = stored[STORAGE_KEYS.cart];
  state.search = stored[STORAGE_KEYS.search];
  state.activeCategory = stored[STORAGE_KEYS.activeCategory];
  state.role = stored[STORAGE_KEYS.session];
  state.customerName = stored[STORAGE_KEYS.customerName];
  state.discount = String(stored[STORAGE_KEYS.discount] ?? "0");
  state.taxRate = String(stored[STORAGE_KEYS.taxRate] ?? "5");
  state.paymentMethod = stored[STORAGE_KEYS.paymentMethod] || "Cash";
}

function startLiveSync() {
  window.PosDb.watch(
    [
      STORAGE_KEYS.products,
      STORAGE_KEYS.orders,
      STORAGE_KEYS.expenses,
      STORAGE_KEYS.pendingTransfers,
      STORAGE_KEYS.transferHistory,
    ],
    (values) => {
      state.products = (values[STORAGE_KEYS.products] || []).map((product) => ({
        ...product,
        minStock: Number(product.minStock ?? 5),
      }));
      state.orders = values[STORAGE_KEYS.orders] || [];
      state.expenses = values[STORAGE_KEYS.expenses] || [];
      state.pendingTransfers = values[STORAGE_KEYS.pendingTransfers] || [];
      state.transferHistory = values[STORAGE_KEYS.transferHistory] || [];
      render();
    }
  );
}

async function fetchServerInfo() {
  if (state.role !== "Admin") {
    state.serverInfo = null;
    return;
  }

  try {
    const response = await window.PosDb.getServerInfo();
    state.serverInfo = response;
  } catch (error) {
    console.warn("Failed to fetch server info", error);
    state.serverInfo = null;
  }
}

function renderServerInfo() {
  if (!elements.serverInfo) {
    return;
  }

  if (!state.serverInfo) {
    elements.serverInfo.innerHTML = `
      <div class="summary-row">
        <span>Status</span>
        <strong>Server info unavailable</strong>
      </div>
    `;
    return;
  }

  const networkText = (state.serverInfo.networkUrls || []).length
    ? state.serverInfo.networkUrls.map((url) => `<div>${escapeHtml(url)}</div>`).join("")
    : "<div>No LAN URL detected</div>";

  elements.serverInfo.innerHTML = `
    <div class="summary-row">
      <span>Local URL</span>
      <strong>${escapeHtml(state.serverInfo.localUrl)}</strong>
    </div>
    <div class="summary-row server-info-block">
      <span>LAN URLs</span>
      <strong>${networkText}</strong>
    </div>
  `;
}

async function downloadDatabaseBackup() {
  if (!requireAdmin()) {
    return;
  }

  try {
    const sql = await window.PosDb.downloadBackup();
    const blob = new Blob([sql], { type: "application/sql" });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `sweet-shop-pos-backup-${new Date().toISOString().slice(0, 10)}.sql`;
    anchor.click();
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    window.alert("Backup failed.");
  }
}

async function restoreDatabaseBackup(event) {
  if (!requireAdmin()) {
    return;
  }

  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  const confirmed = window.confirm(
    "Restore will overwrite database objects from the selected SQL backup. Continue?"
  );
  if (!confirmed) {
    event.target.value = "";
    return;
  }

  try {
    const sql = await file.text();
    await window.PosDb.restoreBackup(sql);
    await hydrateState();
    await fetchServerInfo();
    render();
    window.alert("Database restored.");
  } catch (error) {
    window.alert("Restore failed.");
  } finally {
    event.target.value = "";
  }
}

function render() {
  syncFormFields();
  renderAuth();
  renderFilters();
  renderCatalog();
  renderCart();
  renderSummary();
  renderStats();
  renderOrders();
  renderAdmin();
  renderPendingTransfers();
  renderStockTransferHistory();
  renderServerInfo();
}

async function login(role, password) {
  try {
    const session = await window.PosDb.login(role, password);
    state.role = session.user?.role || null;
    persistState(STORAGE_KEYS.session, state.role);
    await hydrateState();
    clearLoginInputs();
    showLoginMessage("");
    await fetchServerInfo();
    render();
  } catch (error) {
    showLoginMessage("Wrong password.");
  }
}

async function logout() {
  try {
    await window.PosDb.logout();
  } catch (error) {
    console.warn("Logout failed", error);
  }
  state.role = null;
  state.serverInfo = null;
  persistState(STORAGE_KEYS.session, null);
  renderAuth();
}

function renderAuth() {
  const loggedIn = Boolean(state.role);
  elements.loginScreen.hidden = loggedIn;
  elements.appLayout.hidden = !loggedIn || state.role !== "Cashier";
  elements.adminLayout.hidden = !loggedIn || state.role !== "Admin";
  elements.loginScreen.style.display = loggedIn ? "none" : "grid";
  elements.appLayout.style.display = loggedIn && state.role === "Cashier" ? "grid" : "none";
  elements.adminLayout.style.display = loggedIn && state.role === "Admin" ? "grid" : "none";
  elements.userRole.textContent = loggedIn ? `${state.role} Login` : "";
}

function openPosFromAdmin() {
  if (state.role !== "Admin") {
    return;
  }
  elements.loginScreen.hidden = true;
  elements.loginScreen.style.display = "none";
  elements.adminLayout.hidden = true;
  elements.adminLayout.style.display = "none";
  elements.appLayout.hidden = false;
  elements.appLayout.style.display = "grid";
  elements.userRole.textContent = "Admin Session";
}

function showLoginMessage(message) {
  elements.loginMessage.hidden = !message;
  elements.loginMessage.textContent = message;
}

function clearLoginInputs() {
  elements.adminPassword.value = "";
  elements.cashierPassword.value = "";
}

function requireAdmin() {
  if (state.role !== "Admin") {
    window.alert("Admin access required.");
    return false;
  }
  return true;
}

function clearAllOrders() {
  if (!requireAdmin()) {
    return;
  }
  state.orders = [];
  persistState(STORAGE_KEYS.orders, state.orders);
  renderOrders();
  renderAdmin();
}

function renderFilters() {
  const categories = ["All", ...new Set(state.products.map((product) => product.category))];
  const buttonsMarkup = categories
    .map(
      (category) => `
        <button
          type="button"
          class="filter-button ${category === state.activeCategory ? "active" : ""}"
          data-category="${escapeHtml(category)}"
        >
          ${escapeHtml(category)}
        </button>
      `
    )
    .join("");

  elements.categoryFilters.innerHTML = buttonsMarkup;
  bindCategoryButtons(elements.categoryFilters);
}

function bindCategoryButtons(container) {
  container.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeCategory = button.dataset.category;
      persistState(STORAGE_KEYS.activeCategory, state.activeCategory);
      renderCatalog();
      renderFilters();
    });
  });
}

function renderCatalog() {
  const products = state.products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(state.search) ||
      product.category.toLowerCase().includes(state.search);
    const matchesCategory =
      state.activeCategory === "All" || product.category === state.activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (!products.length) {
    elements.catalog.innerHTML = `<div class="empty-state">No matching products found.</div>`;
    return;
  }

  elements.catalog.innerHTML = products
    .map(
      (product) => `
        <article class="product-card">
          <span class="product-tag">${escapeHtml(product.category)}</span>
          <div>
            <h3>${escapeHtml(product.name)}</h3>
            <div class="product-meta">
              <span>${formatCurrency(product.price)} / ${escapeHtml(product.unit)}</span>
              <span class="${product.stock > 0 ? "text-success" : "text-danger"}">
                Stock: ${formatNumber(product.stock)} ${escapeHtml(product.unit)}
              </span>
            </div>
          </div>
          <div class="product-actions">
            <button type="button" class="button" data-add="${product.id}">Add</button>
          </div>
        </article>
      `
    )
    .join("");

  elements.catalog.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => openAddItemDialog(button.dataset.add));
  });
}

function openAddItemDialog(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) {
    return;
  }

  state.pendingProductId = productId;
  elements.selectedProductText.textContent = `${product.name} - Default rate ${formatCurrency(product.price)} per ${product.unit}`;
  elements.dialogAmount.value = "";
  elements.dialogQuantity.value = "";
  renderCalculatedQuantity();
  elements.addItemDialog.showModal();
}

function openStockTransferDialog() {
  if (!requireAdmin()) {
    return;
  }

  elements.stockTransferItem.innerHTML = state.products
    .map(
      (product) =>
          `<option value="${product.id}">${escapeHtml(product.name)} (${formatNumber(product.stock)} ${escapeHtml(product.unit)})</option>`
    )
    .join("");
  elements.stockTransferType.value = "in";
  elements.stockTransferQuantity.value = "";
  elements.stockTransferDateFilter.value = "";
  renderStockTransferHistory();
  elements.stockTransferDialog.showModal();
}

function closeStockTransferDialog() {
  elements.stockTransferDialog.close();
}

function scrollToSection(element) {
  if (!element) {
    return;
  }
  element.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openStockTransferPage() {
  window.location.href = "stock-transfer.html";
}

function openStockReceiveHistoryPage() {
  window.location.href = "stock-receive-history.html";
}

function openExpensePage() {
  window.location.href = "expense.html";
}

function openAdminMenuPage() {
  window.location.href = "admin-menu.html";
}

function openLowStockPage() {
  window.location.href = "low-stock.html";
}

function handleStockTransferSubmit(event) {
  event.preventDefault();

  if (!requireAdmin()) {
    return;
  }

  const productId = elements.stockTransferItem.value;
  const transferType = elements.stockTransferType.value;
  const quantityToAdd = Number(elements.stockTransferQuantity.value);
  const product = state.products.find((item) => item.id === productId);

  if (!product || quantityToAdd <= 0) {
    return;
  }

  if (transferType === "out" && quantityToAdd > product.stock) {
    window.alert(`Only ${formatNumber(product.stock)} ${product.unit} available in stock.`);
    return;
  }

  const confirmed = window.confirm(
    `Send stock ${transferType === "in" ? "in" : "out"} request for ${formatNumber(quantityToAdd)} ${product.unit} ${transferType === "in" ? "to" : "from"} ${product.name}?`
  );
  if (!confirmed) {
    return;
  }

  const transferId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  state.pendingTransfers.unshift({
    id: transferId,
    productId,
    productName: product.name,
    quantity: Number(quantityToAdd.toFixed(2)),
    unit: product.unit,
    transferType,
    createdAt,
    requestedBy: state.role || "Admin",
  });

  state.transferHistory.unshift({
    id: transferId,
    productId,
    productName: product.name,
    quantity: Number(quantityToAdd.toFixed(2)),
    unit: product.unit,
    transferType,
    createdAt,
    requestedBy: state.role || "Admin",
    status: "Pending",
    acceptedAt: null,
    acceptedBy: null,
  });

  persistState(STORAGE_KEYS.pendingTransfers, state.pendingTransfers);
  persistState(STORAGE_KEYS.transferHistory, state.transferHistory);
  closeStockTransferDialog();
  render();
}

function renderPendingTransfers() {
  const pendingCount = state.pendingTransfers.length;
  elements.posStockTransferCount.hidden = pendingCount === 0;
  elements.posStockTransferCount.textContent = String(pendingCount);
}

function renderStockTransferHistory() {
  if (!elements.stockTransferHistory) {
    return;
  }

  const selectedDate = elements.stockTransferDateFilter.value;
  const filteredEntries = selectedDate
    ? state.transferHistory.filter((entry) => matchesDate(entry.createdAt, selectedDate))
    : state.transferHistory;

  if (!filteredEntries.length) {
    elements.stockTransferHistory.innerHTML = `<div class="empty-state">No stock transfer entries for the selected date.</div>`;
    return;
  }

  elements.stockTransferHistory.innerHTML = filteredEntries
    .slice(0, 30)
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
        </article>
      `
    )
    .join("");
}

function closeAddItemDialog() {
  state.pendingProductId = null;
  elements.addItemDialog.close();
}

function syncDialogFields(source) {
  const product = state.products.find((item) => item.id === state.pendingProductId);
  if (!product || product.price <= 0) {
    renderCalculatedQuantity();
    return;
  }

  if (source === "amount") {
    const amount = Number(elements.dialogAmount.value) || 0;
    const quantity = amount / product.price;
    elements.dialogQuantity.value = quantity > 0 ? quantity.toFixed(4) : "";
  }

  if (source === "quantity") {
    const quantity = Number(elements.dialogQuantity.value) || 0;
    const amount = quantity * product.price;
    elements.dialogAmount.value = quantity > 0 ? amount.toFixed(2) : "";
  }

  renderCalculatedQuantity();
}

function renderCalculatedQuantity() {
  const quantity = Number(elements.dialogQuantity.value) || 0;
  const product = state.products.find((item) => item.id === state.pendingProductId);
  elements.calculatedQuantity.textContent = product ? `${formatNumber(quantity)} ${product.unit}` : formatNumber(quantity);
}

function handleAddItemSubmit(event) {
  event.preventDefault();

  if (!state.pendingProductId) {
    return;
  }

  const amount = Number(elements.dialogAmount.value);
  const quantity = Number(elements.dialogQuantity.value);
  const product = state.products.find((item) => item.id === state.pendingProductId);
  const price = product?.price || 0;

  addToCart(state.pendingProductId, quantity, price);
}

function addToCart(productId, quantity, price) {
  const product = state.products.find((item) => item.id === productId);
  if (!product || quantity <= 0 || price <= 0) {
    return;
  }

  const existing = state.cart.find((item) => item.id === productId);
  const requested = (existing?.quantity || 0) + quantity;
  if (requested > product.stock) {
    window.alert(`Only ${formatNumber(product.stock)} ${product.unit} in stock.`);
    return;
  }

  if (existing) {
    existing.quantity = requested;
    existing.amount = Number((existing.amount + quantity * price).toFixed(2));
    existing.price = requested > 0 ? Number((existing.amount / existing.quantity).toFixed(2)) : price;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      unit: product.unit,
      price,
      amount: Number((quantity * price).toFixed(2)),
      quantity,
    });
  }

  closeAddItemDialog();
  renderCart();
  renderSummary();
}

function renderCart() {
  persistState(STORAGE_KEYS.cart, state.cart);

  if (!state.cart.length) {
    elements.cartItems.className = "cart-items empty-state";
    elements.cartItems.textContent = "Add products to start billing.";
    return;
  }

  elements.cartItems.className = "cart-items";
  elements.cartItems.innerHTML = state.cart
    .map((item) => {
      const lineTotal = item.amount ?? item.price * item.quantity;
      return `
        <article class="cart-item">
          <div class="cart-row">
            <strong>${escapeHtml(item.name)}</strong>
            <strong>${formatCurrency(lineTotal)}</strong>
          </div>
          <div class="cart-row muted">
            <span>${formatCurrency(item.price)} / ${escapeHtml(item.unit)}</span>
            <span>${formatNumber(item.quantity)} ${escapeHtml(item.unit)}</span>
          </div>
          <div class="cart-controls">
            <button type="button" class="mini-button" data-change="${item.id}" data-delta="-0.25">-</button>
            <button type="button" class="mini-button" data-change="${item.id}" data-delta="0.25">+</button>
            <button type="button" class="ghost-button" data-remove="${item.id}">Remove</button>
          </div>
        </article>
      `;
    })
    .join("");

  elements.cartItems.querySelectorAll("[data-change]").forEach((button) => {
    button.addEventListener("click", () => updateCartQuantity(button.dataset.change, Number(button.dataset.delta)));
  });

  elements.cartItems.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => removeFromCart(button.dataset.remove));
  });
}

function updateCartQuantity(productId, delta) {
  const cartItem = state.cart.find((item) => item.id === productId);
  const product = state.products.find((item) => item.id === productId);
  if (!cartItem || !product) {
    return;
  }

  const nextQty = Number((cartItem.quantity + delta).toFixed(2));
  if (nextQty <= 0) {
    removeFromCart(productId);
    return;
  }

  if (nextQty > product.stock) {
    window.alert(`Only ${formatNumber(product.stock)} ${product.unit} in stock.`);
    return;
  }

  const unitPrice = cartItem.price;
  cartItem.quantity = nextQty;
  cartItem.amount = Number((unitPrice * nextQty).toFixed(2));
  renderCart();
  renderSummary();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter((item) => item.id !== productId);
  renderCart();
  renderSummary();
}

function clearCart() {
  state.cart = [];
  renderCart();
  renderSummary();
}

function renderSummary() {
  const subtotal = state.cart.reduce((sum, item) => sum + (item.amount ?? item.price * item.quantity), 0);
  const discount = Number(elements.discount.value) || 0;
  const taxableAmount = Math.max(subtotal - discount, 0);
  const taxRate = Number(elements.taxRate.value) || 0;
  const tax = taxableAmount * (taxRate / 100);
  const total = taxableAmount + tax;
  const splitPayments = getSplitPayments();
  const splitTotal = Object.values(splitPayments).reduce((sum, amount) => sum + amount, 0);
  const splitRemaining = Number((total - splitTotal).toFixed(2));
  const isSplitBill = elements.paymentMethod.value === "Split Bill";

  state.splitPayments = {
    Cash: String(splitPayments.Cash),
    Card: String(splitPayments.Card),
    UPI: String(splitPayments.UPI),
    Credit: String(splitPayments.Credit),
  };

  elements.splitPaymentSection.hidden = !isSplitBill;
  if (isSplitBill) {
    elements.splitPaymentSummary.innerHTML = `
      <div class="summary-row">
        <span>Paid So Far</span>
        <strong>${formatCurrency(splitTotal)}</strong>
      </div>
      <div class="summary-row ${splitRemaining === 0 ? "text-success" : "text-danger"}">
        <span>Remaining</span>
        <strong>${formatCurrency(splitRemaining)}</strong>
      </div>
    `;
  }

  elements.summary.innerHTML = `
    <div class="summary-row">
      <span>Subtotal</span>
      <strong>${formatCurrency(subtotal)}</strong>
    </div>
    <div class="summary-row">
      <span>Discount</span>
      <strong>${formatCurrency(discount)}</strong>
    </div>
    <div class="summary-row">
      <span>Tax</span>
      <strong>${formatCurrency(tax)}</strong>
    </div>
    <div class="summary-row summary-total">
      <span>Total</span>
      <strong>${formatCurrency(total)}</strong>
    </div>
  `;
}

function renderStats() {
  const todaysOrders = state.orders.filter((order) => isToday(order.createdAt));
  const todaysRevenue = todaysOrders.reduce((sum, order) => sum + order.total, 0);
  const todaysExpenses = state.expenses
    .filter((expense) => isToday(expense.createdAt))
    .reduce((sum, expense) => sum + expense.amount, 0);

  elements.stats.innerHTML = `
    <article class="stat-card">
      <span>Today's Sales</span>
      <strong>${formatCurrency(todaysRevenue)}</strong>
    </article>
    <article class="stat-card">
      <span>Orders Today</span>
      <strong>${todaysOrders.length}</strong>
    </article>
    <article class="stat-card">
      <span>Today's Expenses</span>
      <strong>${formatCurrency(todaysExpenses)}</strong>
    </article>
    <article class="stat-card">
      <span>Total Orders</span>
      <strong>${state.orders.length}</strong>
    </article>
  `;
}

function renderAdmin() {
  if (!elements.adminStats) {
    return;
  }

  const filteredOrders = getAdminFilteredOrders();
  const filteredExpenses = getAdminFilteredExpenses();
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;
  const todaysExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  elements.adminStats.innerHTML = `
    <article class="stat-card">
      <span>${state.adminDateFilter ? "Filtered Revenue" : "Total Revenue"}</span>
      <strong>${formatCurrency(totalRevenue)}</strong>
    </article>
    <article class="stat-card">
      <span>${state.adminDateFilter ? "Filtered Orders" : "Orders Today"}</span>
      <strong>${totalOrders}</strong>
    </article>
    <article class="stat-card">
      <span>${state.adminDateFilter ? "Filtered Expenses" : "Today's Expenses"}</span>
      <strong>${formatCurrency(todaysExpenses)}</strong>
    </article>
    <article class="stat-card">
      <span>Total Orders</span>
      <strong>${state.adminDateFilter ? totalOrders : state.orders.length}</strong>
    </article>
  `;

  const paymentTotals = filteredOrders.reduce((acc, order) => {
    if (order.paymentMethod === "Split Bill" && order.paymentBreakdown) {
      Object.entries(order.paymentBreakdown).forEach(([method, amount]) => {
        acc[method] = (acc[method] || 0) + amount;
      });
      acc["Split Bill"] = (acc["Split Bill"] || 0) + order.total;
      return acc;
    }

    acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + order.total;
    return acc;
  }, {});

  const paymentCards = ["Cash", "Card", "UPI", "Credit", "Split Bill"]
    .map(
      (method) => `
        <article class="stat-card">
          <span>${escapeHtml(method)}</span>
          <strong>${formatCurrency(paymentTotals[method] || 0)}</strong>
        </article>
      `
    )
    .join("");

  elements.adminPayments.innerHTML = paymentCards;

  if (!filteredOrders.length) {
    elements.adminOrders.innerHTML = `<div class="empty-state">No orders yet.</div>`;
    return;
  }

  elements.adminOrders.innerHTML = filteredOrders
    .slice(0, 10)
    .map(
      (order) => `
        <article class="order-card">
          <div class="order-row">
            <strong>${escapeHtml(order.invoiceId)}</strong>
            <strong>${formatCurrency(order.total)}</strong>
          </div>
          <div class="order-row muted">
            <span>${escapeHtml(order.customerName || "Walk-in customer")}</span>
            <span>${escapeHtml(order.paymentMethod)}</span>
          </div>
          <div class="order-row muted">
            <span>${new Date(order.createdAt).toLocaleString("en-IN")}</span>
            <span>${order.items.length} items</span>
          </div>
          <div class="order-row">
            <span></span>
            <button type="button" class="ghost-button" data-reprint-order="${escapeHtml(order.invoiceId)}">Reprint</button>
          </div>
        </article>
      `
    )
    .join("");

  elements.adminOrders.querySelectorAll("[data-reprint-order]").forEach((button) => {
    button.addEventListener("click", () => reprintOrder(button.dataset.reprintOrder));
  });
}

function getAdminFilteredOrders() {
  if (!state.adminDateFilter) {
    return state.orders;
  }

  return state.orders.filter((order) => matchesDate(order.createdAt, state.adminDateFilter));
}

function getAdminFilteredExpenses() {
  if (!state.adminDateFilter) {
    return state.expenses.filter((expense) => isToday(expense.createdAt));
  }

  return state.expenses.filter((expense) => matchesDate(expense.createdAt, state.adminDateFilter));
}

function getLowStockProducts() {
  return state.products
    .filter((product) => product.stock <= Number(product.minStock ?? 5))
    .sort((left, right) => left.stock - right.stock);
}

function renderOrders() {
  if (!state.orders.length) {
    elements.orderHistory.innerHTML = `<div class="empty-state">Completed sales will appear here.</div>`;
    return;
  }

  elements.orderHistory.innerHTML = state.orders
    .slice(0, 8)
    .map(
      (order) => `
        <article class="order-card">
          <div class="order-row">
            <strong>${escapeHtml(order.invoiceId)}</strong>
            <strong>${formatCurrency(order.total)}</strong>
          </div>
          <div class="order-row muted">
            <span>${escapeHtml(order.customerName || "Walk-in customer")}</span>
            <span>${escapeHtml(order.paymentMethod)}</span>
          </div>
          <div class="order-row muted">
            <span>${new Date(order.createdAt).toLocaleString("en-IN")}</span>
            <span>${order.items.length} items</span>
          </div>
          <div class="order-row">
            <span></span>
            <button type="button" class="ghost-button" data-reprint-order="${escapeHtml(order.invoiceId)}">Reprint</button>
          </div>
        </article>
      `
    )
    .join("");

  elements.orderHistory.querySelectorAll("[data-reprint-order]").forEach((button) => {
    button.addEventListener("click", () => reprintOrder(button.dataset.reprintOrder));
  });
}

async function completeSale() {
  if (!state.cart.length) {
    window.alert("Cart is empty.");
    return;
  }

  const subtotal = state.cart.reduce((sum, item) => sum + (item.amount ?? item.price * item.quantity), 0);
  const discount = Number(elements.discount.value) || 0;
  const taxRate = Number(elements.taxRate.value) || 0;
  const taxableAmount = Math.max(subtotal - discount, 0);
  const tax = taxableAmount * (taxRate / 100);
  const total = taxableAmount + tax;
  const paymentMethod = elements.paymentMethod.value;
  const splitPayments = getSplitPayments();
  const splitTotal = Object.values(splitPayments).reduce((sum, amount) => sum + amount, 0);

  if (paymentMethod === "Split Bill") {
    if (Math.abs(splitTotal - total) > 0.01) {
      window.alert("Split payment total must match the full bill amount.");
      return;
    }
  }

  const order = {
    customerName: elements.customerName.value.trim(),
    paymentMethod,
    paymentBreakdown: paymentMethod === "Split Bill" ? splitPayments : null,
    items: state.cart.map((item) => ({ ...item })),
    subtotal,
    discount,
    taxRate,
    tax,
    total,
  };

  try {
    const response = await window.PosDb.completeOrder(order);
    const completedOrder = response.order;
    state.products = (response.products || []).map((product) => ({
      ...product,
      minStock: Number(product.minStock ?? 5),
    }));
    state.orders = response.orders || [];
    persistState(STORAGE_KEYS.products, state.products);
    persistState(STORAGE_KEYS.orders, state.orders);

    showReceipt(completedOrder);
    showConfirmation(completedOrder);
    clearCart();
    state.customerName = "";
    state.discount = "0";
    state.taxRate = "5";
    state.paymentMethod = "Cash";
    resetSplitPayments();
    persistState(STORAGE_KEYS.customerName, state.customerName);
    persistState(STORAGE_KEYS.discount, state.discount);
    persistState(STORAGE_KEYS.taxRate, state.taxRate);
    persistState(STORAGE_KEYS.paymentMethod, state.paymentMethod);
    render();
  } catch (error) {
    window.alert(error.message || "Sale failed.");
  }
}

function showReceipt(order) {
  const paymentDetails = getPaymentBreakdownText(order);
  const billRows = order.items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${formatNumber(item.quantity)} ${escapeHtml(item.unit)}</td>
          <td>${formatCurrency(item.amount ?? item.price * item.quantity)}</td>
        </tr>
      `
    )
    .join("");
  const kotRows = order.items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${formatNumber(item.quantity)} ${escapeHtml(item.unit)}</td>
        </tr>
      `
    )
    .join("");

  elements.receiptContent.innerHTML = `
    <section class="receipt-copy">
      <div class="receipt-brand">
        <p class="receipt-kicker">Customer Bill</p>
        <h3>Ramesh sweets</h3>
        <p class="receipt-muted">Thank you for shopping with us</p>
      </div>
      <div class="receipt-meta">
        <div class="receipt-meta-row">
          <span>Invoice</span>
          <strong>${escapeHtml(order.invoiceId)}</strong>
        </div>
        <div class="receipt-meta-row">
          <span>Date</span>
          <strong>${new Date(order.createdAt).toLocaleString("en-IN")}</strong>
        </div>
        <div class="receipt-meta-row">
          <span>Customer</span>
          <strong>${escapeHtml(order.customerName || "Walk-in customer")}</strong>
        </div>
        <div class="receipt-meta-row">
          <span>Payment</span>
          <strong>${escapeHtml(order.paymentMethod)}</strong>
        </div>
        ${
          paymentDetails
            ? `<p class="receipt-muted receipt-payment-note">${escapeHtml(
                paymentDetails.replace(/^\s*-\s*/, "")
              )}</p>`
            : ""
        }
      </div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>${billRows}</tbody>
      </table>
      <div class="summary-row"><span>Subtotal</span><strong>${formatCurrency(order.subtotal)}</strong></div>
      <div class="summary-row"><span>Discount</span><strong>${formatCurrency(order.discount)}</strong></div>
      <div class="summary-row"><span>Tax (${order.taxRate}%)</span><strong>${formatCurrency(order.tax)}</strong></div>
      <div class="summary-row summary-total"><span>Total</span><strong>${formatCurrency(order.total)}</strong></div>
      <p class="receipt-footer">Items: ${order.items.length} | Please keep this receipt for exchange and records.</p>
    </section>
    <div class="receipt-cut-line">
      <span>Cut Here</span>
    </div>
    <section class="receipt-copy kot-copy">
      <div class="receipt-brand">
        <p class="receipt-kicker">KOT Copy</p>
        <h3>Kitchen Order Ticket</h3>
        <p class="receipt-muted">${escapeHtml(order.invoiceId)} | ${new Date(order.createdAt).toLocaleString("en-IN")}</p>
      </div>
      <div class="receipt-meta">
        <div class="receipt-meta-row">
          <span>Customer</span>
          <strong>${escapeHtml(order.customerName || "Walk-in customer")}</strong>
        </div>
        <div class="receipt-meta-row">
          <span>Items</span>
          <strong>${order.items.length}</strong>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>${kotRows}</tbody>
      </table>
      <p class="receipt-footer">KOT copy for preparation.</p>
    </section>
  `;

  elements.receiptDialog.showModal();
}

function printActiveReceipt() {
  setTimeout(() => window.print(), 150);
}

function reprintOrder(invoiceId) {
  const order = state.orders.find((item) => item.invoiceId === invoiceId);
  if (!order) {
    window.alert("Order not found.");
    return;
  }

  if (elements.confirmationDialog.open) {
    elements.confirmationDialog.close();
  }
  showReceipt(order);
  printActiveReceipt();
}

function showConfirmation(order) {
  elements.confirmationContent.innerHTML = `
    <p class="eyebrow">Sale Confirmed</p>
    <h3>Order Completed</h3>
    <div class="summary">
      <div class="summary-row">
        <span>Invoice</span>
        <strong>${escapeHtml(order.invoiceId)}</strong>
      </div>
      <div class="summary-row">
        <span>Customer</span>
        <strong>${escapeHtml(order.customerName || "Walk-in customer")}</strong>
      </div>
      <div class="summary-row">
        <span>Payment</span>
        <strong>${escapeHtml(order.paymentMethod)}</strong>
      </div>
      ${getPaymentBreakdownRows(order)}
      <div class="summary-row">
        <span>Items</span>
        <strong>${order.items.length}</strong>
      </div>
      <div class="summary-row summary-total">
        <span>Total</span>
        <strong>${formatCurrency(order.total)}</strong>
      </div>
    </div>
    <p class="muted">The bill has been saved. You can return to billing or print the receipt.</p>
  `;

  if (elements.receiptDialog.open) {
    elements.receiptDialog.close();
  }
  elements.confirmationDialog.showModal();
}

function getSplitPayments() {
  return {
    Cash: Number(elements.splitCash.value) || 0,
    Card: Number(elements.splitCard.value) || 0,
    UPI: Number(elements.splitUpi.value) || 0,
    Credit: Number(elements.splitCredit.value) || 0,
  };
}

function resetSplitPayments() {
  state.splitPayments = { Cash: "0", Card: "0", UPI: "0", Credit: "0" };
}

function getPaymentBreakdownText(order) {
  if (!order.paymentBreakdown) {
    return "";
  }

  const details = Object.entries(order.paymentBreakdown)
    .filter(([, amount]) => amount > 0)
    .map(([method, amount]) => `${method}: ${formatCurrency(amount)}`)
    .join(", ");

  return details ? `<br />Split: ${escapeHtml(details)}` : "";
}

function getPaymentBreakdownRows(order) {
  if (!order.paymentBreakdown) {
    return "";
  }

  return Object.entries(order.paymentBreakdown)
    .filter(([, amount]) => amount > 0)
    .map(
      ([method, amount]) => `
      <div class="summary-row muted">
        <span>${escapeHtml(method)}</span>
        <strong>${formatCurrency(amount)}</strong>
      </div>`
    )
    .join("");
}
function syncFormFields() {
  elements.searchInput.value = state.search;
  elements.customerName.value = state.customerName;
  elements.discount.value = state.discount;
  elements.taxRate.value = state.taxRate;
  elements.paymentMethod.value = state.paymentMethod;
  elements.adminDateFilter.value = state.adminDateFilter;
  elements.splitCash.value = state.splitPayments.Cash;
  elements.splitCard.value = state.splitPayments.Card;
  elements.splitUpi.value = state.splitPayments.UPI;
  elements.splitCredit.value = state.splitPayments.Credit;
}

function persistState(key, value) {
  window.PosDb.save(key, value).catch((error) => {
    console.error(`Failed to save ${key}`, error);
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value) {
  return Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function isToday(isoString) {
  const now = new Date();
  const value = new Date(isoString);
  return (
    value.getDate() === now.getDate() &&
    value.getMonth() === now.getMonth() &&
    value.getFullYear() === now.getFullYear()
  );
}

function matchesDate(isoString, dateValue) {
  return new Date(isoString).toISOString().slice(0, 10) === dateValue;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
