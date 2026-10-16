import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { useCart } from '../context/CartContext.jsx';
import { api } from '../services/api.js';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState(['All']); // Stable category list
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart, cartMessage } = useCart();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    api.getProducts(search) // Pass the search term to the API
      .then((data) => {
        if (active) {
          setProducts(data.products);
          // Only rebuild categories when we have the full catalog (empty search)
          if (search.trim() === '') {
            setAllCategories(['All', ...new Set(data.products.map((p) => p.category))]);
          }
        }
      })
      .catch((caught) => active && setError(caught.message))
      .finally(() => active && setLoading(false));
      
    return () => { active = false; };
  }, [search]); // Rerun this effect whenever 'search' changes

  // Frontend now only handles category filtering; backend handles search
  const visibleProducts = products.filter(
    (product) => category === 'All' || product.category === category
  );

  const sortedProducts = [...visibleProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
    if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <section>
      <div className="hero">
        <div>
          <p className="eyebrow">BSIT FULL-STACK PROJECT</p>
          <h1>Technology for study, work and play</h1>
          <p>Browse the starter catalog, build a cart and complete a simulated order.</p>
        </div>
      </div>

      <div className="toolbar">
        <label>
          <span>Search products</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try keyboard" />
        </label>
        <label>
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {allCategories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>Sort by</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="default">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </label>
      </div>

      <StatusMessage>{cartMessage}</StatusMessage>
      {loading && <StatusMessage>Loading products…</StatusMessage>}
      {error && <StatusMessage type="error">{error} Make sure the backend is running.</StatusMessage>}
      {!loading && !error && sortedProducts.length === 0 && <StatusMessage>No products match your filters.</StatusMessage>}

      <div className="product-grid">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
        ))}
      </div>
    </section>
  );
}