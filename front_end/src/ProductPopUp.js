//styling for product pop up when user clicks on a product to view details
//and reviews
//dw about it

import "./productPopUp.css";
import { useState, useEffect} from "react";

function ProductPopUp({ product, onClose }) {
  const reviewsPerPage = 5; //set to 3 reviews, can change later
  const [currentPage, setCurrentPage] = useState(1);
  const [reviews, setReviews] = useState([]);

  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [isRecommended, setIsRecommended] = useState(null);

  const handleAddToRoutine = () => {
    fetch(`http://localhost:5001/products/${product.Product_id}/add`, {
        method: "POST",
        body: JSON.stringify({product_id: product.Product_id}),
        credentials: "include"
  })
    .then(res => res.json())
    .then(data => alert("Product added to your routine!"))
    .catch(err => console.error("Failed to add to routine:", err));};

  async function handleSubmitReview(e) {
    e.preventDefault(); //prevent page refresh when submitting form
    const formData = new FormData();
    formData.append("Product_id", product.Product_id);
    formData.append("Review_title", reviewTitle);
    formData.append("Review_text", reviewText);
    formData.append("Rating", reviewRating);
    formData.append("Is_recommended", isRecommended);
    for (let [key, value] of formData.entries()) {
    console.log(key, value);
}
    fetch(`http://localhost:5001/review`, {
        method: "POST",
        body: formData,
        credentials: "include",
        })
    .then(res => res.json())
    .then(data => {
        alert("Review submitted!");
        setReviewTitle("")
        setReviewText("");
        setReviewRating("");
        setIsRecommended(null)
    })
    .catch(err => console.error("Failed to submit review:", err));
};

  useEffect(() => {
    fetch(`http://localhost:5001/products/${product.Product_id}`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {setReviews(data);})
      .catch(err => console.error("Failed to fetch reviews:", err));
  }, [product.Product_id]);

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <button onClick={onClose} className="popup-close-button">
          ✕
        </button>

        <h2 className="popup-title">{product.Product_name}</h2>

        <div className="popup-details">
          <p><strong>Brand:</strong> {product.Brand_name}</p>
          <p><strong>Price:</strong> ${product.Price_usd}</p>
          <p><strong>Rating:</strong> {product.Avg_rating}</p>
          <p><strong>Total Reviews:</strong> {product.Num_reviews}</p>
          <button 
              type="button"
              className="popup-button"
              onClick={handleAddToRoutine}
          >
              Add to Routine
          </button>
        </div>

        <h3 className="popup-reviews-title">Reviews ✨</h3>
        <div className="popup-reviews-container">
          {reviews.length > 0 ? (
            currentReviews.map((review, index) => (
              <div key={index} className="popup-review-box">
                <p className="popup-review-author">
                  <strong>{review.User_name}</strong> · {review.Rating}/5 · Recommended? {review.Is_recommended} · Skin type: {review.Skin_type}
                </p>
                <p className="popup-review-title">
                  <strong>{review.Review_title}</strong>
                </p>
                <p className="popup-review-text">{review.Review_text}</p>
              </div>
            ))
          ) : (
            <p className="popup-no-reviews">No reviews available.</p>
          )}
        </div>

        <div className="popup-pagination">
            <button
                className="page-nav-button"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Prev
            </button>

            <button
                className={`page-button ${currentPage === 1 ? "active-page" : ""}`}
                onClick={() => setCurrentPage(1)}
            >
                1
            </button>

            {totalPages > 1 && (
                <button
                className={`page-button ${currentPage === 2 ? "active-page" : ""}`}
                onClick={() => setCurrentPage(2)}
                >
                2
                </button>
            )}

            {totalPages > 3 && <span className="page-ellipsis">...</span>}

            {totalPages > 2 && (
                <button
                className={`page-button ${currentPage === totalPages ? "active-page" : ""}`}
                onClick={() => setCurrentPage(totalPages)}
                >
                {totalPages}
                </button>
            )}

            <button
                className="page-nav-button"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
            </div>
            <h3 className="popup-reviews-title">Write a Review</h3>
        <div className="popup-review-form">
            <input
                type="text"
                placeholder="Review title"
                className="popup-review-input"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
            />

            <div className="popup-recommended">
                <label>Would you recommend this product?</label>
                <div className="popup-recommended-buttons">
                    <button
                        type="button"
                        className={`recommended-button ${isRecommended === 'Yes' ? 'selected' : ''}`}
                        onClick={() => setIsRecommended('Yes')}
                    >
                        👍 Yes
                    </button>
                    <button
                        type="button"
                        className={`recommended-button ${isRecommended === 'No' ? 'selected' : ''}`}
                        onClick={() => setIsRecommended('No')}
                    >
                        👎 No
                    </button>
                </div>
            </div>

            <textarea
                placeholder="Write your review here..."
                className="popup-review-textarea"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
            />

            <div className="popup-stars">
                <label>Rating</label>
                <div className="star-buttons">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            type="button"
                            key={star}
                            className={`star-button ${reviewRating >= star ? 'selected' : ''}`}
                            onClick={() => setReviewRating(star)}
                        >
                            ⭐
                        </button>
                    ))}
                </div>
                <p>{reviewRating ? `${reviewRating}/5` : 'No rating selected'}</p>
            </div>

            <button 
                type="button" 
                className="popup-button"
                onClick={handleSubmitReview}
            >
                Submit Review
            </button>
          </div>
        </div>
    </div>
  );
}

export default ProductPopUp;
