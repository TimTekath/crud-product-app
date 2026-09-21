import { useState, useEffect } from 'react';
import { db } from './db';
import './App.css';

const API_URL = 'http://localhost:5288/api/products';

function App() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Zustand für den Bearbeiten-Modus (null = neues Produkt, sonst ID des Produkts)
  const [editingId, setEditingId] = useState(null);

  const [showInStockOnly, setShowInStockOnly] = useState(false);

const fetchProducts = async () => {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Server antwortete mit ${res.status}`);
    const data = await res.json();
    setProducts(data);
  } catch (err) {
    console.error('Fehler beim Laden:', err);
    setError('Produkte konnten nicht geladen werden.');
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

  setSaving(true);
  setError(null);

  try {
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });

    if (!res.ok) {
      throw new Error(`Speichern fehlgeschlagen (Status ${res.status})`);
    }

    setEditingId(null);
    setName('');
    setPrice('');
    setStock('');
    await fetchProducts();
  } catch (err) {
    console.error(err);
    setError(err.message);
  } finally {
    setSaving(false);
  }
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
  setError(null);
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

    if (!res.ok) {
      throw new Error(`Löschen fehlgeschlagen (Status ${res.status})`);
    }

    await fetchProducts();
  } catch (err) {
    console.error(err);
    setError(err.message);
  }
};

  const filteredProducts = showInStockOnly 
    ? products.filter(p => p.stock > 0) 
    : products;

  return (
    <div className='app'>
      <h1>Produktverwaltung (CRUD)</h1>

      {/* Formular */}
      <form onSubmit={handleSubmit} className='product-form'>
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
        <button type="submit" disabled={saving}>
          {saving ? 'Speichert…' : editingId ? 'Speichern' : 'Hinzufügen'}
        </button>
        {editingId && (
          <button type="button" onClick={handleCancelEdit}>Abbrechen</button>
        )}
      </form>
      
      {error && <p className="error">{error}</p>}

      {/* IndexedDB Steuerung */}
      <div className='filter-box'>
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
      <table className='product-table'>
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
              <td className='actions'>
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