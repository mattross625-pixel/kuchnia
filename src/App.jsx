import React, { useState } from "react";

const products = [
  { name: "Śniadanie dla dzieci", unit: "porcji", amounts: [1, 2, 5, 10] },
  { name: "Lunch", unit: "porcji", amounts: [1, 2, 5, 10] },
  { name: "Zupa", unit: "porcji", amounts: [1, 2, 5, 10] },
  { name: "Kanapka po naszemu", unit: "szt.", amounts: [1, 2, 5, 10] },
  { name: "Kanapka", unit: "szt.", amounts: [1, 2, 5, 10] },
  { name: "Kompot", unit: "porcji", amounts: [1, 2, 5, 10] },
  {
    name: "Śniadania",
    unit: "porcji",
    amounts: [1, 2, 5, 10],
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
  { name: "Inne", unit: "szt.", amounts: [1, 2, 5, 10] }
];

export default function App() {
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [selectedAmount, setSelectedAmount] = useState(products[0].amounts[0]);
  const [selectedSub, setSelectedSub] = useState("");
  const [comment, setComment] = useState("");

  function chooseProduct(product) {
    setSelectedProduct(product);
    setSelectedAmount(product.amounts[0]);
    setSelectedSub("");
    setComment("");
  }

  function getName() {
    let name = selectedProduct.name;

    if (selectedProduct.name === "Śniadania" && selectedSub !== "") {
      name = name + " - " + selectedSub;
    }

    if (selectedProduct.name === "Inne" && comment.trim() !== "") {
      name = name + " - " + comment.trim();
    }

    return name;
  }

  function addItem() {
    if (selectedProduct.name === "Śniadania" && selectedSub === "") {
      alert("Wybierz rodzaj śniadania");
      return;
    }

    if (selectedProduct.name === "Inne" && comment.trim() === "") {
      alert("Wpisz komentarz dla pozycji Inne");
      return;
    }

    const item = {
      id: Date.now(),
      product: getName(),
      amount: selectedAmount,
      unit: selectedProduct.unit
    };

    setItems([item].concat(items));
  }

  function removeItem(id) {
    const nextItems = items.filter(function(item) {
      return item.id !== id;
    });
    setItems(nextItems);
  }

  function clearAll() {
    setItems([]);
  }

  function sendEmail() {
    if (items.length === 0) {
      return;
    }

    let text = "Wydanie:\n";

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      text = text + item.product + " - " + item.amount + " " + item.unit + "\n";
    }

    const subject = encodeURIComponent("Wydanie produktów");
    const body = encodeURIComponent(text);
    window.location.href = "mailto:?subject=" + subject + "&body=" + body;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.subtitle}>Kuchnia / tablet</div>
          <h1 style={styles.title}>Wydawanie produktów</h1>
        </div>
        <div style={styles.counter}>Pozycji: {items.length}</div>
      </div>

      <div style={styles.layout}>
        <div style={styles.panel}>
          <h2 style={styles.sectionTitle}>1. Produkt</h2>
          <div style={styles.gridProducts}>
            {products.map(function(product) {
              const selected = product.name === selectedProduct.name;
              return (
                <button
                  key={product.name}
                  type="button"
                  onClick={function() { chooseProduct(product); }}
                  style={selected ? styles.tileSelected : styles.tile}
                >
                  <div style={styles.tileName}>{product.name}</div>
                  <div style={selected ? styles.tileSubSelected : styles.tileSub}>{product.unit}</div>
                </button>
              );
            })}
          </div>

          {selectedProduct.submenu && (
            <div>
              <h2 style={styles.sectionTitle}>2. Rodzaj śniadania</h2>
              <div style={styles.gridSubmenu}>
                {selectedProduct.submenu.map(function(option) {
                  const selected = option === selectedSub;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={function() { setSelectedSub(option); }}
                      style={selected ? styles.tileSelected : styles.tile}
                    >
                      <div style={styles.tileName}>{option}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedProduct.name === "Inne" && (
            <div style={styles.commentBox}>
              <h2 style={styles.sectionTitle}>2. Komentarz</h2>
              <input
                value={comment}
                onChange={function(event) { setComment(event.target.value); }}
                placeholder="Wpisz co wydać..."
                style={styles.commentInput}
              />
            </div>
          )}

          <h2 style={styles.sectionTitle}>3. Ilość</h2>
          <div style={styles.gridAmounts}>
            {selectedProduct.amounts.map(function(amount) {
              const selected = amount === selectedAmount;
              return (
                <button
                  key={String(amount)}
                  type="button"
                  onClick={function() { setSelectedAmount(amount); }}
                  style={selected ? styles.amountSelected : styles.amountTile}
                >
                  <div style={styles.amountNumber}>{amount}</div>
                  <div>{selectedProduct.unit}</div>
                </button>
              );
            })}
          </div>

          <button type="button" onClick={addItem} style={styles.addButton}>
            Dodaj do zamówienia
          </button>
        </div>

        <div style={styles.panel}>
          <div style={styles.orderHeader}>
            <h2 style={styles.sectionTitleNoMargin}>Zamówienie</h2>
            <div style={styles.orderButtons}>
              <button type="button" onClick={sendEmail} style={styles.emailButton}>Email</button>
              <button type="button" onClick={clearAll} style={styles.clearButton}>Wyczyść</button>
            </div>
          </div>

          {items.length === 0 ? (
            <div style={styles.empty}>Brak produktów w zamówieniu</div>
          ) : (
            <div style={styles.list}>
              {items.map(function(item) {
                return (
                  <div key={item.id} style={styles.orderItem}>
                    <div>
                      <div style={styles.itemName}>{item.product}</div>
                      <div style={styles.itemDetails}>{item.amount} {item.unit}</div>
                    </div>
                    <button type="button" onClick={function() { removeItem(item.id); }} style={styles.removeButton}>
                      Usuń
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    padding: 18,
    fontFamily: "Arial, sans-serif",
    color: "#0f172a",
    boxSizing: "border-box"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
    border: "1px solid #e2e8f0"
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#64748b"
  },
  title: {
    margin: "4px 0 0 0",
    fontSize: 42,
    fontWeight: 900
  },
  counter: {
    backgroundColor: "#0f172a",
    color: "white",
    borderRadius: 22,
    padding: "18px 24px",
    fontSize: 24,
    fontWeight: 900
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: 18
  },
  panel: {
    backgroundColor: "white",
    borderRadius: 28,
    padding: 20,
    border: "1px solid #e2e8f0"
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 900,
    margin: "0 0 12px 0"
  },
  sectionTitleNoMargin: {
    fontSize: 26,
    fontWeight: 900,
    margin: 0
  },
  gridProducts: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 14,
    marginBottom: 26
  },
  gridSubmenu: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 14,
    marginBottom: 26
  },
  gridAmounts: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 14,
    marginBottom: 26
  },
  tile: {
    minHeight: 108,
    borderRadius: 26,
    border: "2px solid #cbd5e1",
    backgroundColor: "white",
    color: "#0f172a",
    padding: 16,
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)"
  },
  tileSelected: {
    minHeight: 108,
    borderRadius: 26,
    border: "2px solid #0f172a",
    backgroundColor: "#0f172a",
    color: "white",
    padding: 16,
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.16)"
  },
  tileName: {
    fontSize: 22,
    fontWeight: 900
  },
  tileSub: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 700,
    color: "#64748b"
  },
  tileSubSelected: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 700,
    color: "#cbd5e1"
  },
  amountTile: {
    minHeight: 112,
    borderRadius: 26,
    border: "2px solid #cbd5e1",
    backgroundColor: "white",
    color: "#0f172a",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 800,
    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)"
  },
  amountSelected: {
    minHeight: 112,
    borderRadius: 26,
    border: "2px solid #0f172a",
    backgroundColor: "#0f172a",
    color: "white",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 800,
    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.16)"
  },
  amountNumber: {
    fontSize: 40,
    fontWeight: 900
  },
  commentBox: {
    marginBottom: 26
  },
  commentInput: {
    width: "100%",
    boxSizing: "border-box",
    border: "2px solid #cbd5e1",
    borderRadius: 24,
    padding: 20,
    fontSize: 24,
    fontWeight: 800
  },
  addButton: {
    width: "100%",
    border: 0,
    borderRadius: 28,
    backgroundColor: "#16a34a",
    color: "white",
    padding: 24,
    fontSize: 28,
    fontWeight: 900,
    cursor: "pointer"
  },
  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 16
  },
  orderButtons: {
    display: "flex",
    gap: 10
  },
  emailButton: {
    border: 0,
    borderRadius: 22,
    backgroundColor: "#2563eb",
    color: "white",
    padding: "16px 20px",
    fontSize: 18,
    fontWeight: 900,
    cursor: "pointer"
  },
  clearButton: {
    border: 0,
    borderRadius: 22,
    backgroundColor: "#ef4444",
    color: "white",
    padding: "16px 20px",
    fontSize: 18,
    fontWeight: 900,
    cursor: "pointer"
  },
  empty: {
    border: "3px dashed #cbd5e1",
    borderRadius: 28,
    padding: 50,
    textAlign: "center",
    fontSize: 24,
    fontWeight: 900,
    color: "#64748b"
  },
  list: {
    display: "grid",
    gap: 12
  },
  orderItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    border: "1px solid #e2e8f0",
    borderRadius: 24,
    padding: 16,
    backgroundColor: "#f8fafc"
  },
  itemName: {
    fontSize: 24,
    fontWeight: 900
  },
  itemDetails: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: 700,
    color: "#475569"
  },
  removeButton: {
    border: "2px solid #cbd5e1",
    borderRadius: 18,
    backgroundColor: "white",
    padding: "14px 18px",
    fontSize: 17,
    fontWeight: 900,
    cursor: "pointer"
  }
};
