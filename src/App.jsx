import React, { useState } from "react";

const defaultProducts = [
  { name: "Śniadanie dla dzieci", unit: "porcji", amounts: [1, 2, 3] },
  { name: "Lunch", unit: "porcji", amounts: [1, 2, 3] },
  { name: "Zupa", unit: "porcji", amounts: [1, 2, 3] },
  { name: "Kanapka po naszemu", unit: "szt.", amounts: [1, 2, 3] },
  { name: "Kanapka", unit: "szt.", amounts: [1, 2, 3] },
  { name: "Kompot", unit: "porcji", amounts: [1, 2, 3] },
  {
    name: "Śniadania",
    unit: "porcji",
    amounts: [1, 2, 3],
    submenu: [
      "duży głód",
      "mały głód",
      "angielskie",
      "frankfuterki od Kusia",
      "wielki głód (mały)",
      "po angielsku (małe)",
      "omlet dla dwojga",
      "kiełbasa z cebulą",
      "pancakes"
    ]
  },
  { name: "Inne", unit: "szt.", amounts: [1, 2, 3] }
];

function readLocal(key, fallback) {
  try {
    const saved = window.localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (error) {}
  return fallback;
}

export default function App() {
  const [screen, setScreen] = useState("wydawanie");
  const [products, setProducts] = useState(function () {
    return readLocal("produktyKonfiguracja", defaultProducts);
  });
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState(function () {
    return readLocal("wydaniaHistoria", []);
  });

  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [selectedAmount, setSelectedAmount] = useState(products[0].amounts[0]);
  const [selectedSub, setSelectedSub] = useState("");
  const [comment, setComment] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const [newProductName, setNewProductName] = useState("");
  const [newProductUnit, setNewProductUnit] = useState("porcji");
  const [newProductAmounts, setNewProductAmounts] = useState("1,2,3");
  const [newSubmenuName, setNewSubmenuName] = useState("");

  function saveProducts(nextProducts) {
    setProducts(nextProducts);
    try {
      window.localStorage.setItem("produktyKonfiguracja", JSON.stringify(nextProducts));
    } catch (error) {}

    const exists = nextProducts.find(function (product) {
      return product.name === selectedProduct.name;
    });

    if (!exists && nextProducts.length > 0) {
      chooseProduct(nextProducts[0]);
    }
  }

  function chooseProduct(product) {
    setSelectedProduct(product);
    setSelectedAmount(product.amounts[0]);
    setSelectedSub("");
    setComment("");
  }

  function productName() {
    let name = selectedProduct.name;

    if (selectedProduct.name === "Śniadania" && selectedSub) {
      name = name + " - " + selectedSub;
    }

    if (selectedProduct.name === "Inne" && comment.trim()) {
      name = name + " - " + comment.trim();
    }

    return name;
  }

  function saveHistory(nextHistory) {
    setHistory(nextHistory);
    try {
      window.localStorage.setItem("wydaniaHistoria", JSON.stringify(nextHistory));
    } catch (error) {}
  }

  function addItem() {
    if (selectedProduct.name === "Śniadania" && !selectedSub) {
      alert("Wybierz rodzaj śniadania");
      return;
    }

    if (selectedProduct.name === "Inne" && !comment.trim()) {
      alert("Wpisz komentarz dla pozycji Inne");
      return;
    }

    const now = new Date();
    const item = {
      id: Date.now(),
      product: productName(),
      amount: selectedAmount,
      unit: selectedProduct.unit,
      date: now.toLocaleDateString("pl-PL"),
      time: now.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    };

    setItems([item].concat(items));
    saveHistory([item].concat(history));
  }

  function removeItem(id) {
    setItems(items.filter(function (item) { return item.id !== id; }));
  }

  function clearOrder() {
    setItems([]);
  }

  function clearHistory() {
    setHistory([]);
    setFilterDate("");
    try {
      window.localStorage.removeItem("wydaniaHistoria");
    } catch (error) {}
  }

  function historyForDate() {
    if (!filterDate) return history;

    return history.filter(function (item) {
      const parts = item.date.split(".");
      if (parts.length !== 3) return false;
      return parts[2] + "-" + parts[1] + "-" + parts[0] === filterDate;
    });
  }

  function rowsFor(list) {
    const rows = ["Data;Godzina;Produkt;Ilosc;Jednostka"];

    list.forEach(function (item) {
      rows.push(item.date + ";" + item.time + ";" + item.product + ";" + item.amount + ";" + item.unit);
    });

    return rows;
  }

  function exportCSV() {
    const list = historyForDate();
    if (list.length === 0) return;

    const csv = rowsFor(list).join(String.fromCharCode(10));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filterDate ? "wydania-" + filterDate + ".csv" : "wydania.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function emailOrder() {
    if (items.length === 0) return;

    const rows = ["Wydanie produktów:"];
    items.forEach(function (item) {
      rows.push(item.product + " - " + item.amount + " " + item.unit);
    });

    const subject = encodeURIComponent("Wydanie produktów");
    const body = encodeURIComponent(rows.join(String.fromCharCode(10)));
    window.location.href = "mailto:?subject=" + subject + "&body=" + body;
  }

  function emailHistory() {
    const list = historyForDate();
    if (list.length === 0) return;

    const subject = encodeURIComponent("Historia wydan");
    const body = encodeURIComponent(rowsFor(list).join(String.fromCharCode(10)));
    window.location.href = "mailto:?subject=" + subject + "&body=" + body;
  }

  function parseAmounts(text) {
    return text
      .split(",")
      .map(function (part) { return Number(part.trim()); })
      .filter(function (number) { return !isNaN(number) && number > 0; });
  }

  function addProduct() {
    const name = newProductName.trim();
    const unit = newProductUnit.trim() || "szt.";
    const amounts = parseAmounts(newProductAmounts);

    if (!name || amounts.length === 0) {
      alert("Wpisz nazwę produktu i ilości, np. 1,2,3");
      return;
    }

    saveProducts(products.concat([{ name: name, unit: unit, amounts: amounts }]));
    setNewProductName("");
    setNewProductUnit("porcji");
    setNewProductAmounts("1,2,3");
  }

  function removeProduct(name) {
    if (products.length <= 1) {
      alert("Musi zostać przynajmniej jeden produkt");
      return;
    }

    saveProducts(products.filter(function (product) { return product.name !== name; }));
  }

  function updateProductAmounts(name, text) {
    const amounts = parseAmounts(text);
    if (amounts.length === 0) return;

    const nextProducts = products.map(function (product) {
      if (product.name !== name) return product;
      return Object.assign({}, product, { amounts: amounts });
    });

    saveProducts(nextProducts);
  }

  function addSubmenuOption() {
    const value = newSubmenuName.trim();
    if (!value) return;

    const nextProducts = products.map(function (product) {
      if (product.name !== "Śniadania") return product;
      const submenu = product.submenu ? product.submenu.concat([value]) : [value];
      return Object.assign({}, product, { submenu: submenu });
    });

    saveProducts(nextProducts);
    setNewSubmenuName("");
  }

  function removeSubmenuOption(option) {
    const nextProducts = products.map(function (product) {
      if (product.name !== "Śniadania") return product;
      const submenu = (product.submenu || []).filter(function (item) { return item !== option; });
      return Object.assign({}, product, { submenu: submenu });
    });

    saveProducts(nextProducts);
  }

  function resetProducts() {
    saveProducts(defaultProducts);
    try {
      window.localStorage.removeItem("produktyKonfiguracja");
    } catch (error) {}
    chooseProduct(defaultProducts[0]);
  }

  const filteredHistory = historyForDate();
  const breakfastProduct = products.find(function (product) { return product.name === "Śniadania"; });

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.subtitle}>Kuchnia / tablet</div>
          <h1 style={styles.title}>Wydawanie produktów</h1>
        </div>
        <div style={styles.topButtons}>
          <button type="button" onClick={function () { setScreen("wydawanie"); }} style={screen === "wydawanie" ? styles.navActive : styles.navButton}>Wydawanie</button>
          <button type="button" onClick={function () { setScreen("historia"); }} style={screen === "historia" ? styles.navActive : styles.navButton}>Historia</button>
          <button type="button" onClick={function () { setScreen("ustawienia"); }} style={screen === "ustawienia" ? styles.navActive : styles.navButton}>Ustawienia</button>
          <div style={styles.counter}>Pozycji: {items.length}</div>
        </div>
      </div>

      {screen === "wydawanie" ? (
        <div style={styles.layout}>
          <div style={styles.panel}>
            <h2 style={styles.sectionTitle}>1. Produkt</h2>
            <div style={styles.gridProducts}>
              {products.map(function (product) {
                const selected = product.name === selectedProduct.name;
                return (
                  <button key={product.name} type="button" onClick={function () { chooseProduct(product); }} style={selected ? styles.tileSelected : styles.tile}>
                    <div style={styles.tileName}>{product.name}</div>
                    <div style={selected ? styles.tileSubSelected : styles.tileSub}>{product.unit}</div>
                  </button>
                );
              })}
            </div>

            {selectedProduct.submenu ? (
              <div>
                <h2 style={styles.sectionTitle}>2. Rodzaj śniadania</h2>
                <div style={styles.gridSubmenu}>
                  {selectedProduct.submenu.map(function (option) {
                    const selected = option === selectedSub;
                    return (
                      <button key={option} type="button" onClick={function () { setSelectedSub(option); }} style={selected ? styles.tileSelected : styles.tile}>
                        <div style={styles.tileName}>{option}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {selectedProduct.name === "Inne" ? (
              <div style={styles.commentBox}>
                <h2 style={styles.sectionTitle}>2. Komentarz</h2>
                <input value={comment} onChange={function (event) { setComment(event.target.value); }} placeholder="Wpisz co wydać..." style={styles.commentInput} />
              </div>
            ) : null}

            <h2 style={styles.sectionTitle}>3. Ilość</h2>
            <div style={styles.gridAmounts}>
              {selectedProduct.amounts.map(function (amount) {
                const selected = amount === selectedAmount;
                return (
                  <button key={String(amount)} type="button" onClick={function () { setSelectedAmount(amount); }} style={selected ? styles.amountSelected : styles.amountTile}>
                    <div style={styles.amountNumber}>{amount}</div>
                    <div>{selectedProduct.unit}</div>
                  </button>
                );
              })}
            </div>

            <button type="button" onClick={addItem} style={styles.addButton}>Dodaj do zamówienia</button>
          </div>

          <div style={styles.panel}>
            <div style={styles.orderHeader}>
              <h2 style={styles.sectionTitleNoMargin}>Zamówienie</h2>
              <div style={styles.orderButtons}>
                <button type="button" onClick={emailOrder} style={styles.emailButton}>Email</button>
                <button type="button" onClick={clearOrder} style={styles.clearButton}>Wyczyść</button>
              </div>
            </div>

            {items.length === 0 ? (
              <div style={styles.empty}>Brak produktów w zamówieniu</div>
            ) : (
              <div style={styles.list}>
                {items.map(function (item) {
                  return (
                    <div key={item.id} style={styles.orderItem}>
                      <div>
                        <div style={styles.itemName}>{item.product}</div>
                        <div style={styles.itemDetails}>{item.amount} {item.unit} • {item.date} {item.time}</div>
                      </div>
                      <button type="button" onClick={function () { removeItem(item.id); }} style={styles.removeButton}>Usuń</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {screen === "historia" ? (
        <div style={styles.historyPanel}>
          <div style={styles.historyHeader}>
            <h2 style={styles.sectionTitleNoMargin}>Historia wydań</h2>
            <div style={styles.orderButtons}>
              <input type="date" value={filterDate} onChange={function (event) { setFilterDate(event.target.value); }} style={styles.dateInput} />
              <button type="button" onClick={function () { setFilterDate(""); }} style={styles.navButton}>Wszystko</button>
              <button type="button" onClick={exportCSV} style={styles.exportButton}>CSV</button>
              <button type="button" onClick={emailHistory} style={styles.emailButton}>Email historii</button>
              <button type="button" onClick={clearHistory} style={styles.clearButton}>Usuń historię</button>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div style={styles.empty}>Brak wydań dla wybranej daty</div>
          ) : (
            <div style={styles.historyList}>
              {filteredHistory.map(function (item) {
                return (
                  <div key={item.id} style={styles.historyItem}>
                    <div style={styles.itemName}>{item.product}</div>
                    <div style={styles.itemDetails}>{item.amount} {item.unit}</div>
                    <div style={styles.itemDetails}>{item.date}</div>
                    <div style={styles.itemDetails}>{item.time}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {screen === "ustawienia" ? (
        <div style={styles.historyPanel}>
          <div style={styles.historyHeader}>
            <h2 style={styles.sectionTitleNoMargin}>Ustawienia</h2>
            <button type="button" onClick={resetProducts} style={styles.clearButton}>Przywróć domyślne</button>
          </div>

          <div style={styles.settingsGrid}>
            <div style={styles.settingsBox}>
              <h3 style={styles.settingsTitle}>Dodaj produkt</h3>
              <input value={newProductName} onChange={function (event) { setNewProductName(event.target.value); }} placeholder="Nazwa produktu" style={styles.commentInput} />
              <input value={newProductUnit} onChange={function (event) { setNewProductUnit(event.target.value); }} placeholder="Jednostka, np. porcji" style={styles.commentInput} />
              <input value={newProductAmounts} onChange={function (event) { setNewProductAmounts(event.target.value); }} placeholder="Ilości, np. 1,2,3" style={styles.commentInput} />
              <button type="button" onClick={addProduct} style={styles.addButton}>Dodaj produkt</button>
            </div>

            <div style={styles.settingsBox}>
              <h3 style={styles.settingsTitle}>Produkty</h3>
              <div style={styles.historyList}>
                {products.map(function (product) {
                  return (
                    <div key={product.name} style={styles.productSettingsItem}>
                      <div>
                        <div style={styles.itemName}>{product.name}</div>
                        <div style={styles.itemDetails}>Jednostka: {product.unit}</div>
                      </div>
                      <input defaultValue={product.amounts.join(",")} onBlur={function (event) { updateProductAmounts(product.name, event.target.value); }} style={styles.smallInput} />
                      <button type="button" onClick={function () { removeProduct(product.name); }} style={styles.removeButton}>Usuń</button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={styles.settingsBox}>
              <h3 style={styles.settingsTitle}>Podmenu Śniadań</h3>
              <div style={styles.inlineForm}>
                <input value={newSubmenuName} onChange={function (event) { setNewSubmenuName(event.target.value); }} placeholder="Nowy wariant śniadania" style={styles.commentInput} />
                <button type="button" onClick={addSubmenuOption} style={styles.emailButton}>Dodaj</button>
              </div>
              <div style={styles.historyList}>
                {breakfastProduct && breakfastProduct.submenu ? breakfastProduct.submenu.map(function (option) {
                  return (
                    <div key={option} style={styles.productSettingsItem}>
                      <div style={styles.itemName}>{option}</div>
                      <button type="button" onClick={function () { removeSubmenuOption(option); }} style={styles.removeButton}>Usuń</button>
                    </div>
                  );
                }) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", height: "100vh", backgroundColor: "#f1f5f9", padding: 10, fontFamily: "Arial, sans-serif", color: "#0f172a", boxSizing: "border-box", overflow: "hidden" },
  header: { height: 78, display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", borderRadius: 20, padding: "10px 16px", marginBottom: 10, border: "1px solid #e2e8f0", boxSizing: "border-box" },
  subtitle: { fontSize: 14, fontWeight: 800, color: "#64748b" },
  title: { margin: "2px 0 0 0", fontSize: 30, fontWeight: 900, lineHeight: 1 },
  topButtons: { display: "flex", alignItems: "center", gap: 8 },
  counter: { backgroundColor: "#0f172a", color: "white", borderRadius: 18, padding: "12px 18px", fontSize: 18, fontWeight: 900 },
  navButton: { border: "2px solid #cbd5e1", borderRadius: 16, backgroundColor: "white", color: "#0f172a", padding: "12px 15px", fontSize: 15, fontWeight: 900, cursor: "pointer" },
  navActive: { border: 0, borderRadius: 16, backgroundColor: "#0f172a", color: "white", padding: "12px 15px", fontSize: 15, fontWeight: 900, cursor: "pointer" },
  layout: { display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 10, height: "calc(100vh - 98px)" },
  panel: { backgroundColor: "white", borderRadius: 20, padding: 12, border: "1px solid #e2e8f0", overflow: "auto", boxSizing: "border-box" },
  sectionTitle: { fontSize: 18, fontWeight: 900, margin: "0 0 8px 0" },
  sectionTitleNoMargin: { fontSize: 20, fontWeight: 900, margin: 0 },
  gridProducts: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 },
  gridSubmenu: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 },
  gridAmounts: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 },
  tile: { minHeight: 72, borderRadius: 16, border: "2px solid #cbd5e1", backgroundColor: "white", color: "#0f172a", padding: 10, textAlign: "left", cursor: "pointer", boxShadow: "0 1px 4px rgba(15, 23, 42, 0.08)" },
  tileSelected: { minHeight: 72, borderRadius: 16, border: "2px solid #0f172a", backgroundColor: "#0f172a", color: "white", padding: 10, textAlign: "left", cursor: "pointer", boxShadow: "0 1px 4px rgba(15, 23, 42, 0.16)" },
  tileName: { fontSize: 16, fontWeight: 900, lineHeight: 1.05 },
  tileSub: { marginTop: 5, fontSize: 11, fontWeight: 700, color: "#64748b" },
  tileSubSelected: { marginTop: 5, fontSize: 11, fontWeight: 700, color: "#cbd5e1" },
  amountTile: { minHeight: 74, borderRadius: 16, border: "2px solid #cbd5e1", backgroundColor: "white", color: "#0f172a", cursor: "pointer", fontSize: 13, fontWeight: 800, boxShadow: "0 1px 4px rgba(15, 23, 42, 0.08)" },
  amountSelected: { minHeight: 74, borderRadius: 16, border: "2px solid #0f172a", backgroundColor: "#0f172a", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 800, boxShadow: "0 1px 4px rgba(15, 23, 42, 0.16)" },
  amountNumber: { fontSize: 30, fontWeight: 900, lineHeight: 1 },
  commentBox: { marginBottom: 12 },
  commentInput: { width: "100%", boxSizing: "border-box", border: "2px solid #cbd5e1", borderRadius: 16, padding: 12, fontSize: 18, fontWeight: 800, marginBottom: 8 },
  smallInput: { width: 95, boxSizing: "border-box", border: "2px solid #cbd5e1", borderRadius: 14, padding: 10, fontSize: 15, fontWeight: 800 },
  addButton: { width: "100%", border: 0, borderRadius: 18, backgroundColor: "#16a34a", color: "white", padding: 16, fontSize: 22, fontWeight: 900, cursor: "pointer" },
  orderHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 10 },
  orderButtons: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" },
  emailButton: { border: 0, borderRadius: 16, backgroundColor: "#2563eb", color: "white", padding: "12px 15px", fontSize: 15, fontWeight: 900, cursor: "pointer" },
  exportButton: { border: 0, borderRadius: 16, backgroundColor: "#7c3aed", color: "white", padding: "12px 15px", fontSize: 15, fontWeight: 900, cursor: "pointer" },
  clearButton: { border: 0, borderRadius: 16, backgroundColor: "#ef4444", color: "white", padding: "12px 15px", fontSize: 15, fontWeight: 900, cursor: "pointer" },
  empty: { border: "2px dashed #cbd5e1", borderRadius: 18, padding: 28, textAlign: "center", fontSize: 18, fontWeight: 900, color: "#64748b" },
  list: { display: "grid", gap: 8 },
  orderItem: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, border: "1px solid #e2e8f0", borderRadius: 16, padding: 10, backgroundColor: "#f8fafc" },
  itemName: { fontSize: 18, fontWeight: 900, lineHeight: 1.1 },
  itemDetails: { marginTop: 3, fontSize: 15, fontWeight: 700, color: "#475569" },
  removeButton: { border: "2px solid #cbd5e1", borderRadius: 14, backgroundColor: "white", padding: "10px 12px", fontSize: 14, fontWeight: 900, cursor: "pointer" },
  historyPanel: { height: "calc(100vh - 98px)", backgroundColor: "white", borderRadius: 20, padding: 12, border: "1px solid #e2e8f0", overflow: "auto", boxSizing: "border-box" },
  historyHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 10 },
  dateInput: { border: "2px solid #cbd5e1", borderRadius: 16, padding: "10px 12px", fontSize: 15, fontWeight: 900 },
  historyList: { display: "grid", gap: 8 },
  historyItem: { display: "grid", gridTemplateColumns: "1.5fr 0.5fr 0.5fr 0.5fr", gap: 8, alignItems: "center", border: "1px solid #e2e8f0", borderRadius: 16, padding: 10, backgroundColor: "#f8fafc" },
  settingsGrid: { display: "grid", gridTemplateColumns: "0.8fr 1.2fr 1fr", gap: 12 },
  settingsBox: { border: "1px solid #e2e8f0", borderRadius: 18, padding: 12, backgroundColor: "#f8fafc" },
  settingsTitle: { fontSize: 20, fontWeight: 900, margin: "0 0 10px 0" },
  productSettingsItem: { display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "center", border: "1px solid #e2e8f0", borderRadius: 16, padding: 10, backgroundColor: "white" },
  inlineForm: { display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center", marginBottom: 10 }
};
