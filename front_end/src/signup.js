import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./signup.css";

function Signup() {
    const navigate = useNavigate(); //navigate to preferences page after submitting signup form

    // check log in
    const [isLogin, setIsLogin] = useState(false);

    //state to hold form input values and any error messages
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: ""
    });

    //state for error messages to show if user doesn't fill out form correctly
    const [message, setMessage] = useState("");

    //update formData state when user types in name and password fields
    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault(); //prevent page refresh when submitting form
        setMessage("");     //clear previous messages
 
        if (!formData.username || !formData.password) {
            setMessage("Please fill out all fields.");
            return;
        }

        if (isLogin) {
            // log in flow
            const loginData = new FormData();
            loginData.append("username", formData.username);
            loginData.append("password", formData.password);
 
            try {
                const response = await fetch("http://localhost:5001/login", {
                    method: "POST",
                    body: loginData,
                    credentials: "include"
                });
 
                const data = await response.json();
 
                if (response.ok) {
                    navigate("/products");
                } else {
                    setMessage(data.message || "Login failed.");
                }
            } catch (err) {
                setMessage("Server error. Is the backend running? :(");
            }

        } else {
            // sign up part
            if (formData.password !== formData.confirmPassword) {
                setMessage("Passwords do not match.");
                return;
            }

            // need to fill in skin info before it can be sent to sql
            // store locally to be sent on preferences
            localStorage.setItem(
                "signupData",
                JSON.stringify({
                    username: formData.username,
                    password: formData.password
                })
            );

            //move to next page
            navigate("/preferences");
        }
    }

    return (
        <div className="signup-page">
            <div className="signup-card">
                <h1 className="signup-title">
                    {isLogin ? "Welcome Back!" : "Let's find your SkinMatch!"}
                </h1>

                <form className="signup-form" onSubmit={handleSubmit}>
                    <input
                        className="signup-input"
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                    />

                    <input
                        className="signup-input"
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    {/* Only show Confirm Password if we are Signing Up */}
                    {!isLogin && (
                        <input
                            className="signup-input"
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    )}

                    <button className="signup-button" type="submit">
                        {isLogin ? "Login" : "Next"}
                    </button>
                </form>

                {message && <p className="signup-message" style={{ color: "red" }}>{message}</p>}

                <div className="toggle-mode">
                    <p>
                        {isLogin ? "New to SkinMatch?" : "Already have an account?"}
                        <button 
                            type="button" 
                            className="toggle-button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setMessage("");
                            }}
                        >
                            {isLogin ? "Sign Up" : "Log In"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Signup;
