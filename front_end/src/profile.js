import { useState, useEffect } from "react";
import "./profile.css";
import { useNavigate } from "react-router-dom";

function Profile() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        skinType: "",
        goals: []
    });

    const [userProducts, setUserProducts] = useState([]);
    const [profileUpdated, setProfileUpdated] = useState(false);
    const [goalCoverage, setGoalCoverage] = useState([]);
    const [topRecommended, setTopRecommended] = useState([]);
    const navigate = useNavigate();

    // load in profile data from backend
    useEffect(() => {
        fetch("http://localhost:5001/profile", { credentials: "include" })
            .then((res) => {
                if (res.status === 401) navigate("/"); // redirect to login if not recognized
                return res.json();
            })
            .then((data) => {
                setFormData({
                    username: data.username,
                    skinType: data.skin_type,
                    goals: data.skingoals,
                    password: "",
                    confirmPassword: ""
                });
                setUserProducts(data.user_products || []);
            })
            .catch((err) => console.error("Error fetching profile:", err));
    }, [navigate]);

    const handleChange = (e) => {
        setProfileUpdated(false);

        const { name, value } = e.target;
        setFormData({
        ...formData,
        [name]: value
        });
    };

    const handleGoalChange = (goalId) => {
        setProfileUpdated(false);
 
        if (formData.goals.includes(goalId)) {
            setFormData({
                ...formData,
                goals: formData.goals.filter((g) => g !== goalId)
            });
        } else {
            if (formData.goals.length >= 3) {
                alert("You can only choose up to 3 goals.");
                return;
            }
            setFormData({
                ...formData,
                goals: [...formData.goals, goalId]
            });
        }
    };
    // send updated data to backend to get result from advanced query
    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        const data = new FormData();
        data.append("username", formData.username);
        data.append("password", formData.password);
        data.append("confirm_password", formData.confirmPassword);
        data.append("skintype", formData.skinType);
        // append each goal ofr flask getlist()
        formData.goals.forEach(goal => data.append("skingoals", goal));

        try {
            const response = await fetch("http://localhost:5001/profile", {
                method: "POST",
                body: data,
                credentials: "include"
            });
            const result = await response.json();

            if (response.ok) {
                // map goal coverage
                setGoalCoverage(result.goal_coverage.map(item => ({
                    name: item.Goal_name,
                    count: item.Matching_product_count,
                    // percentage for bar ui
                    percent: Math.min((item.Matching_product_count / 10) * 100, 100) 
                })));

                // map top recommendations
                setTopRecommended(result.match_percentage_recommendations.map(item => ({
                    Product_id: item.Product_id,
                    Brand_name: item.Brand_name,
                    Product_name: item.Product_name,
                    Price_usd: item.Price_usd,
                    matchPercent: item.Match_percentage
                })));

                setProfileUpdated(true);
                alert("Profile Updated!");
            } else {
                alert(result.message);
            }
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    //actually rmv from database now
    const handleDeleteProduct = async (productId) => {
        try {
            const res = await fetch(`http://localhost:5001/profile/product/${productId}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (res.ok) {
                setUserProducts(userProducts.filter(p => p.Product_id !== productId));
            }
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    // clear session & redirect
    const handleLogout = async () => {
      try {
        const response = await fetch("http://localhost:5001/logout", {
          method: "POST",
          credentials: "include" 
        });

        if (response.ok) {
          navigate("/"); 
        } else {
          console.error("Logout failed");
        }
      } catch (err) {
        console.error("Error during logout:", err);
      }
    };

    const handleCancel = () => {
        window.location.reload(); // simple, might break lwk we will see
    };

  return (
    <>
        <div className="profile-page">
        <nav className="profile-nav">
          <div className="logo">skin-match</div>
          <div>
            <button
                className="nav-button"
                onClick={handleLogout}
            >
                LOGOUT
            </button>

            <button
                className="nav-button"
                onClick={() => navigate("/products")}
                >
                PRODUCTS
            </button>

            <button
                className="nav-button active"
                onClick={() => navigate("/profile")}
                >
                PROFILE
            </button>
            
          </div>
        </nav>

        <header className="profile-hero">
          <div>
            <p className="eyebrow">YOUR PROFILE</p>
            <h1>
              a
              <span> ritual</span>
              ,
              tailored to you
            </h1>
          </div>

        </header>

        <form onSubmit={handleUpdateProfile}>
          <main className="profile-grid">
            <section className="profile-left">
              <div className="section-block">
                    <p className="section-label">YOUR PRODUCTS</p>
              
                <h2>
                    Products currently in <span>your routine</span>.
                </h2>

                <div className="user-products">
                    {userProducts.length === 0 ? (
                    <p className="empty-products">No products added yet.</p>
                    ) : (
                    userProducts.map((product) => (
                        <div className="user-product-card" key={product.Product_id}>
                        <div>
                            <p className="brand">{product.Brand_name}</p>
                            <p>{product.Product_name}</p>
                        </div>

                        <div className="product-actions">
                            <button
                            type="button"
                            className="delete-product"
                            onClick={() => handleDeleteProduct(product.Product_id)}
                            >
                            Remove
                            </button>
                        </div>
                        </div>
                    ))
                    )}
                </div>
              </div>
              <div className="section-block">
                <p className="section-label">ACCOUNT</p>

                <label>Username</label>
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                />

                <div className="two-col">
                  <div>
                    <label>New password</label>
                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label>Confirm</label>
                    <input
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>

              <div className="section-block">
                <p className="section-label">SKIN TYPE</p>

                <div className="skin-options">
                  {["dry", "oily", "combination", "normal", "sensitive"].map(
                    (type) => (
                      <button
                        type="button"
                        key={type}
                        className={formData.skinType === type ? "selected" : ""}
                        onClick={() => {
                          setProfileUpdated(false);
                          setFormData({ ...formData, skinType: type });
                        }}
                      >
                        {type}
                      </button>
                    )
                  )}
                </div>
                </div>

                <div className="section-block">
                <p className="section-label">GOALS</p>
                <p className="hint">
                  Choose between 1 and 3 concerns we should prioritize for you.
                </p>

                <div className="goal-grid">
                  {[
                    { id: "antiAcne", name: "Acne & Blemishes" },
                    { id: "antiAging", name: "Anti-Aging" },
                    { id: "Blackhead", name: "Blackheads" },
                    { id: "bumpySkin", name: "Smooth Texture" },
                    { id: "darkSpot", name: "Dark Spots" },
                    { id: "EvensSkintone", name: "Brightening" },
                    { id: "Hydration", name: "Hydration" },
                    { id: "oilControl", name: "Oil Control" },
                    { id: "poreMinimizer", name: "Minimizing Pores" },
                    { id: "Soothing", name: "Calming Redness" }
                  ].map((goal) => (
                    <button
                        type="button"
                        key={goal.id}
                        className={
                            formData.goals.includes(goal.id)
                                ? "goal selected"
                                : "goal"
                        }
                        onClick={() => handleGoalChange(goal.id)}
                    >
                        <span className="circle" />
                        {goal.name}
                    </button>
                  ))}
                </div>
                </div>

                <div className="actions">
                <button type="button" className="cancel" onClick={handleCancel}>
                  CANCEL CHANGES
                </button>
                <button type="submit" className="save">
                  SAVE PROFILE
                </button>
              </div>
            </section>

            <section className="profile-right">
              {profileUpdated ? (
                <>
                    <div className="section-block">
                    <p className="section-label">COVERAGE</p>
                    <h2>
                      How well your <span>goals</span>
                      <br />
                      are covered.
                    </h2>

                    {goalCoverage.map((goal) => (
                      <div className="coverage-row" key={goal.name}>
                        <div className="coverage-text">
                          <p>{goal.name}</p>
                          <p>{goal.count} products</p>
                        </div>
                        <div className="bar">
                          <div style={{ width: `${goal.percent}%` }} />
                        </div>
                      </div>
                    ))}
                    </div>

                    <div className="section-block">
                    <p className="section-label">TOP MATCHES</p>
                    <h2>
                      Picked for <span>your</span>
                      <br />
                      exact concerns.
                    </h2>

                    {topRecommended.map((product, index) => (
                      <div className="match-card" key={product.Product_id}>
                        <span className="rank">0{index + 1}</span>

                        <div>
                          <p className="brand">{product.Brand_name}</p>
                          <p>{product.Product_name}</p>
                          <p className="price">${product.Price_usd}</p>
                        </div>

                        <p className="match-percent">
                          {product.matchPercent}%
                          <span>MATCH</span>
                        </p>
                      </div>
                    ))}
                    </div>
                </>
              ) : (
                <div className="empty-state">
                  <p>
                    Save your profile to view updated goal coverage and
                    recommendations.
                  </p>
                </div>
              )}
            </section>
          </main>
        </form>
      </div>
    </>
  );
}

export default Profile;
