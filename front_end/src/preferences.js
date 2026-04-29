import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./preferences.css";

function Preferences() {
    const navigate = useNavigate(); //navigate to products page after submitting preferences

    //state to hold user preferences
    const [preferences, setPreferences] = useState({ 
        skinType: "",
        skinGoals: []
    });

    const skinTypes = ["dry", "oily", "combination", "normal", "sensitive"];

    const skinGoalOptions = [
        { value: "antiAcne", label: "Acne & Blemishes" },
        { value: "antiAging", label: "Anti-Aging" },
        { value: "Blackhead", label: "Blackheads" },
        { value: "bumpySkin", label: "Smooth Texture" },
        { value: "darkSpot", label: "Dark Spots" },
        { value: "EvensSkintone", label: "Brightening" },
        { value: "Hydration", label: "Hydration" },
        { value: "oilControl", label: "Oil Control" },
        { value: "poreMinimizer", label: "Minimizing Pores" },
        { value: "Soothing", label: "Calming Redness" }
    ];

    //handle changes to form inputs like when user selects a skin type or goal
    function handleChange(e) {
        const { name, value } = e.target;
        setPreferences(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault(); //prevent page refresh when submitting form

        //if user selects no skin goals, show alert and don't proceed
        if (preferences.skinGoals.length === 0) {
            alert("Please select at least one skin goal.");
            return;
        }

        //get data from signup page
        const signupData = JSON.parse(localStorage.getItem("signupData")) || {};

        //combine signup data and preferences into one user profile object
        const formData = new FormData();
        formData.append("username", signupData.username);
        formData.append("password", signupData.password); //where is the confirm password item :o, right now they always are the same
        formData.append("confirm_password", signupData.password);
        formData.append("skintype", preferences.skinType);
        preferences.skinGoals.forEach(goal => formData.append("skingoals", goal));

        // connect to flask server and make the request, and see if it goes through
        try {
            // change port to whatever your computer run (macs can't use 5000, i changed to 5001)
            const response = await fetch("http://localhost:5001/register", {
                method: "POST",
                body: formData,
                credentials: "include"
            });
            const data = await response.json();

            if (response.ok) {
                alert("Success! Your profile has been created.");
                
                // clear temp local storage
                localStorage.removeItem("signupData");

                // redirect to products
                navigate("/products"); 
            } else {
                alert(data.message || "Registration failed. Please try again.");
            }
        } catch (err) {
            alert("Could not connect to the server :(");
        }
        // const fullUserData = {
        //     ...signupData,
        //     ...preferences
        // };

        // //temporarily save user profile data to localStorage (need to send to backend)
        // localStorage.setItem("mockUserProfile", JSON.stringify(fullUserData));

        // console.log("Preferences saved");
        // navigate("/products");
    }

    function handleGoalToggle(goal) {
        setPreferences(prev => {
            const alreadySelected = prev.skinGoals.includes(goal);

            if (alreadySelected) {
                return {
                    ...prev,
                    skinGoals: prev.skinGoals.filter(g => g !== goal)
                };
            }

            if (prev.skinGoals.length >= 3) {
                return prev; // stops user from selecting more than 3
            }

            return {
                ...prev,
                skinGoals: [...prev.skinGoals, goal]
            };
        });
    }

    return (
        <div className="preferences-page">
            <div className="preferences-card">

                <h1 className="preferences-title">Tell us about your skin!</h1>

                <form className="preferences-form" onSubmit={handleSubmit}>

                    <label className="preferences-label">Skin Type</label>
                    <select
                        className="preferences-select"
                        name="skinType"
                        value={preferences.skinType}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>What's your skin type?</option>
                        <option value="dry">Dry</option>
                        <option value="oily">Oily</option>
                        <option value="combination">Combination</option>
                        <option value="normal">Normal</option>
                    </select>

                    <label className="preferences-label">What are your skin goals? (up to 3)</label>

                    <div className="preferences-goals">
                        {skinGoalOptions.map(goal => {
                            const isSelected = preferences.skinGoals.includes(goal.value);
                            const disable =
                                preferences.skinGoals.length >= 3 && !isSelected;

                            return (
                                <div
                                    key={goal.value}
                                    className={`goal-option 
                                        ${isSelected ? "selected" : ""} 
                                        ${disable ? "disabled" : ""}`}
                                    onClick={() => !disable && handleGoalToggle(goal.value)}
                                >
                                    {goal.label}
                                </div>
                            );
                        })}
                    </div>

                    <p className="preferences-selected-count">
                        {preferences.skinGoals.length}/3 selected
                    </p>

                    <button className="preferences-button" type="submit">
                        Find my products!
                    </button>

                </form>

            </div>
        </div>
    );
}

export default Preferences;
