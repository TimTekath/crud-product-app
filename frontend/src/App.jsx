import { useState, useEffect } from 'react';
import { db } from './db';

const API_URL = 'http://localhost:5288/api/products';

function App() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  
  // Zustand für den Bearbeiten-Modus (null = neues Produkt, sonst ID des Produkts)
  const [editingId, setEditingId] = useState(null);

  const [showInStockOnly, setShowInStockOnly] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Fehler beim Laden:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    const loadSettings = async () => {
      const savedSetting = await db.settings.get('showInStockOnly');
      if (savedSetting) setShowInStockOnly(savedSetting.value);
    };
    loadSettings();
  }, []);

  const toggleFilter = async () => {
    const newValue = !showInStockOnly;
    setShowInStockOnly(newValue);
    await db.settings.put({ key: 'showInStockOnly', value: newValue });
  };

  // Formular-Absenden für Erstellen (POST) und Aktualisieren (PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) return;

    const productData = {
      name,
      price: parseFloat(price),
      stock: parseInt(stock) || 0
    };

    if (editingId) {
      // PUT: Produkt bearbeiten
      await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      setEditingId(null);
    } else {
      // POST: Neues Produkt anlegen
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
    }

    // Formular zurücksetzen
    setName('');
    setPrice('');
    setStock('');
    fetchProducts();
  };

  // Klick auf "Bearbeiten": Daten ins Formular laden
  const handleEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price);
    setStock(product.stock);
  };

  // Bearbeiten abbrechen
  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setStock('');
  };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  const filteredProducts = showInStockOnly 
    ? products.filter(p => p.stock > 0) 
    : products;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '650px', margin: '0 auto' }}>
      <h1>Produktverwaltung (CRUD)</h1>

      {/* Formular */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input 
          placeholder="Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <input 
          type="number" 
          step="0.01" 
          placeholder="Preis" 
          value={price} 
          onChange={(e) => setPrice(e.target.value)} 
          required 
        />
        <input 
          type="number" 
          placeholder="Lagerbestand" 
          value={stock} 
          onChange={(e) => setStock(e.target.value)} 
        />
        <button type="submit">
          {editingId ? 'Speichern' : 'Hinzufügen'}
        </button>
        {editingId && (
          <button type="button" onClick={handleCancelEdit}>Abbrechen</button>
        )}
      </form>

      {/* IndexedDB Steuerung */}
      <div style={{ marginBottom: '15px', background: '#f4f4f4', padding: '10px', borderRadius: '4px', color: '#333' }}>
        <label style={{ cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={showInStockOnly} 
            onChange={toggleFilter} 
          />
          Nur verfügbare Produkte anzeigen (IndexedDB)
        </label>
      </div>

      {/* Tabelle */}
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Preis</th>
            <th>Bestand</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.price.toFixed(2)} €</td>
              <td>{p.stock}</td>
              <td style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => handleEdit(p)}>Bearbeiten</button>
                <button onClick={() => handleDelete(p.id)}>Löschen</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;