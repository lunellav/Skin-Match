import ProductDisplay from "./productDisplay";
import ProductPopUp from "./ProductPopUp";
import { useState, useEffect } from "react";  // add useEffect
import { useNavigate } from "react-router-dom";
import "./products.css";


function Products() {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [sortOption, setSortOption] = useState("");
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:5001/products", {
            credentials: "include" // needed
        })
            .then(res => {
                if (res.status === 401) {
                    navigate("/");
                    return null;
                }
                if (!res.ok) {
                    throw new Error("Failed to fetch products");
                }
                return res.json();
            })
            .then(data => setProducts(data))
            .catch(err => console.error("Failed to fetch products!", err));
    }, []);

    const filteredProducts = products.filter((product) =>
        (product.Product_name + " " + product.Brand_name)
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );

    //sorting products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortOption === "priceLowHigh") return a.Price_usd - b.Price_usd;
        if (sortOption === "priceHighLow") return b.Price_usd - a.Price_usd;
        if (sortOption === "ratingHighLow") return b.Avg_rating - a.Avg_rating;
        if (sortOption === "ratingLowHigh") return a.Avg_rating - b.Avg_rating;
        return 0;
    });

    return (
        <div className="products-page">
            <div className="products-card">
                <button
                    type="button"
                    className="profile-button"
                    onClick={() => navigate("/profile")}
                    >
                    PROFILE
                </button>
                <h1 className="products-title">Here are your SkinMatches! ✨</h1>

                <div className="products-toolbar">
                    <input
                        type="text"
                        placeholder="Search products by name, brands..."
                        className="products-search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <label className="products-label" htmlFor="sort">
                        Sort by:
                    </label>
                    <select
                        id="sort"
                        className="products-select"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                    >
                        <option value="">Default</option>
                        <option value="priceLowHigh">Price: Low to High</option>
                        <option value="priceHighLow">Price: High to Low</option>
                        <option value="ratingHighLow">Rating: High to Low</option>
                        <option value="ratingLowHigh">Rating: Low to High</option>
                    </select>
                </div>

                <div className="products-grid">
                    {sortedProducts.map((product) => (
                        <ProductDisplay
                            key={product.Product_id}
                            product={product}
                            onViewProduct={setSelectedProduct}
                        />
                    ))}
                </div>
            </div>

            {selectedProduct && (
                <ProductPopUp
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
}

export default Products;
