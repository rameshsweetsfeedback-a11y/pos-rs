const STORAGE_KEYS = {
  products: "sweet-shop-pos:products",
  categories: "sweet-shop-pos:categories",
  session: "sweet-shop-pos:session",
};

const elements = {
  menuCategoryForm: document.querySelector("#menuCategoryForm"),
  menuCategoryName: document.querySelector("#menuCategoryName"),
  menuItemForm: document.querySelector("#menuItemForm"),
  menuItemId: document.querySelector("#menuItemId"),
  menuItemName: document.querySelector("#menuItemName"),
  menuItemCategory: document.querySelector("#menuItemCategory"),
  menuCategoryOptions: document.querySelector("#menuCategoryOptions"),
  menuItemUnit: document.querySelector("#menuItemUnit"),
  menuItemPrice: document.querySelector("#menuItemPrice"),
  menuItemStock: document.querySelector("#menuItemStock"),
  menuItemMinStock: document.querySelector("#menuItemMinStock"),
  menuItemSubmit: document.querySelector("#menuItemSubmit"),
  menuItemCancel: document.querySelector("#menuItemCancel"),
  menuSummary: document.querySelector("#menuSummary"),
  menuList: document.querySelector("#menuList"),
};

const state = {
  products: [],
  categories: [],
  role: null,
  editingProductId: null,
};

initialize();

async function initialize() {
  bindEvents();
  await hydrateState();
  await hydrateSession();
  guardAdmin();
  startLiveSync();
  render();
}

function bindEvents() {
  elements.menuCategoryForm.addEventListener("submit", handleCategorySubmit);
  elements.menuItemForm.addEventListener("submit", handleMenuItemSubmit);
  elements.menuItemCancel.addEventListener("click", resetForm);
}

async function hydrateState() {
  const stored = await window.PosDb.loadMany({
    [STORAGE_KEYS.products]: [],
    [STORAGE_KEYS.categories]: [],
    [STORAGE_KEYS.session]: null,
  });

  state.products = stored[STORAGE_KEYS.products].map((product) => ({
    ...product,
    minStock: Number(product.minStock ?? 5),
  }));
  state.categories = stored[STORAGE_KEYS.categories] || [];
  state.role = stored[STORAGE_KEYS.session];
}

async function hydrateSession() {
  try {
    const session = await window.PosDb.getSession();
    state.role = session.user?.role || state.role;
  } catch (error) {
    console.warn("Failed to hydrate admin session", error);
  }
}

function startLiveSync() {
  window.PosDb.watch([STORAGE_KEYS.products, STORAGE_KEYS.categories], (values) => {
    state.products = (values[STORAGE_KEYS.products] || []).map((product) => ({
      ...product,
      minStock: Number(product.minStock ?? 5),
    }));
    state.categories = values[STORAGE_KEYS.categories] || [];
    render();
  });
}

function guardAdmin() {
  if (state.role === "Admin") {
    return;
  }

  window.alert("Admin access required.");
  window.location.href = "index.html";
}

function handleCategorySubmit(event) {
  event.preventDefault();

  const categoryName = elements.menuCategoryName.value.trim();
  if (!categoryName) {
    return;
  }

  const exists = getAllCategories().some(
    (category) => category.toLowerCase() === categoryName.toLowerCase()
  );
  if (exists) {
    window.alert("This category already exists.");
    return;
  }

  state.categories = [...state.categories, categoryName].sort((left, right) => left.localeCompare(right));
  persistState(STORAGE_KEYS.categories, state.categories);
  elements.menuCategoryForm.reset();
  renderCategoryOptions();
}

function handleMenuItemSubmit(event) {
  event.preventDefault();

  const productId = elements.menuItemId.value || crypto.randomUUID();
  const name = elements.menuItemName.value.trim();
  const category = elements.menuItemCategory.value.trim();
  const unit = elements.menuItemUnit.value.trim();
  const price = Number(elements.menuItemPrice.value);
  const stock = Number(elements.menuItemStock.value);
  const minStock = Number(elements.menuItemMinStock.value);

  if (!name || !category || !unit || price <= 0 || stock < 0 || minStock < 0) {
    return;
  }

  const nextProduct = {
    id: productId,
    name,
    category,
    unit,
    price: Number(price.toFixed(2)),
    stock: Number(stock.toFixed(2)),
    minStock: Number(minStock.toFixed(2)),
  };

  if (state.editingProductId) {
    state.products = state.products.map((product) =>
      product.id === state.editingProductId ? nextProduct : product
    );
  } else {
    state.products.unshift(nextProduct);
  }

  if (!state.categories.some((item) => item.toLowerCase() === category.toLowerCase())) {
    state.categories = [...state.categories, category].sort((left, right) => left.localeCompare(right));
    persistState(STORAGE_KEYS.categories, state.categories);
  }

  persistState(STORAGE_KEYS.products, state.products);
  resetForm();
  render();
}

function render() {
  renderCategoryOptions();
  renderSummary();
  renderList();
}

function renderCategoryOptions() {
  const categories = getAllCategories();
  elements.menuCategoryOptions.innerHTML = categories
    .map((category) => `<option value="${escapeHtml(category)}"></option>`)
    .join("");
}

function getAllCategories() {
  return [...new Set([...state.categories, ...state.products.map((product) => product.category)].filter(Boolean))]
    .sort((left, right) => left.localeCompare(right));
}

function renderSummary() {
  const totalItems = state.products.length;
  const totalStock = state.products.reduce((sum, product) => sum + product.stock, 0);

  elements.menuSummary.innerHTML = `
    <div class="summary-row">
      <span>Total Items</span>
      <strong>${totalItems}</strong>
    </div>
    <div class="summary-row">
      <span>Total Stock Units</span>
      <strong>${formatNumber(totalStock)}</strong>
    </div>
    <div class="summary-row">
      <span>Session</span>
      <strong>${escapeHtml(state.role || "Guest")}</strong>
    </div>
  `;
}

function renderList() {
  if (!state.products.length) {
    elements.menuList.innerHTML = `<div class="empty-state">No items in the catalog.</div>`;
    return;
  }

  elements.menuList.innerHTML = state.products
    .map(
      (product) => `
        <article class="order-card transfer-card">
          <div class="order-row">
            <strong>${escapeHtml(product.name)}</strong>
            <strong>${formatCurrency(product.price)}</strong>
          </div>
          <div class="order-row muted">
            <span>${escapeHtml(product.category)}</span>
            <span>${formatNumber(product.stock)} ${escapeHtml(product.unit)}</span>
          </div>
          <div class="order-row muted">
            <span>Minimum stock: ${formatNumber(product.minStock ?? 5)} ${escapeHtml(product.unit)}</span>
            <div class="action-row">
              <button type="button" class="ghost-button" data-edit-item="${product.id}">Edit</button>
              <button type="button" class="ghost-button" data-edit-min-stock="${product.id}">Set Limit</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  elements.menuList.querySelectorAll("[data-edit-item]").forEach((button) => {
    button.addEventListener("click", () => startEditItem(button.dataset.editItem));
  });

  elements.menuList.querySelectorAll("[data-edit-min-stock]").forEach((button) => {
    button.addEventListener("click", () => updateMinStock(button.dataset.editMinStock));
  });
}

function startEditItem(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) {
    return;
  }

  state.editingProductId = productId;
  elements.menuItemId.value = product.id;
  elements.menuItemName.value = product.name;
  elements.menuItemCategory.value = product.category;
  elements.menuItemUnit.value = product.unit;
  elements.menuItemPrice.value = product.price;
  elements.menuItemStock.value = product.stock;
  elements.menuItemMinStock.value = product.minStock ?? 5;
  elements.menuItemSubmit.textContent = "Save Changes";
  elements.menuItemCancel.hidden = false;
  elements.menuItemName.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateMinStock(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) {
    return;
  }

  const nextValue = window.prompt(
    `Enter minimum stock limit for ${product.name}`,
    String(product.minStock ?? 5)
  );
  if (nextValue === null) {
    return;
  }

  const minStock = Number(nextValue);
  if (Number.isNaN(minStock) || minStock < 0) {
    window.alert("Enter a valid minimum stock limit.");
    return;
  }

  state.products = state.products.map((item) =>
    item.id === productId ? { ...item, minStock: Number(minStock.toFixed(2)) } : item
  );
  persistState(STORAGE_KEYS.products, state.products);
  render();
}

function resetForm() {
  state.editingProductId = null;
  elements.menuItemForm.reset();
  elements.menuItemId.value = "";
  elements.menuItemSubmit.textContent = "Add Item";
  elements.menuItemCancel.hidden = true;
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
