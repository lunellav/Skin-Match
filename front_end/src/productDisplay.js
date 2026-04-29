//displaying products on products page, basically the cards
import "./productDisplay.css";

function ProductDisplay({ product, onViewProduct }) {
    return (
        <div className="product-card">

            <h3 className="product-name">{product.Product_name}</h3>

            <p className="product-brand">{product.Brand_name}</p>

            <p className="product-price">${product.Price_usd}</p>

            <p className="product-rating">
                ⭐ {product.Avg_rating} ({product.Num_reviews} reviews)
            </p>

            <p className="product-skintype_review">{product.Skintype_reviews}</p>

            <button
                className="product-button"
                onClick={() => onViewProduct(product)}
            >
                View Product
            </button>

        </div>
    );
}

export default ProductDisplay;
