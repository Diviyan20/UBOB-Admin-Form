import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styling/AdminLoginStyles.css"


const SERVER_URL = "http://localhost:5000";

export default function AdminLoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.ChangeEvent) =>{
        e.preventDefault();
        setError("");

        // Validate inputs
        if (!email.trim() || !password.trim()){
            setError("Please enter your email and password.");
            return;
        }

        try{
            setLoading(true);

            const response = await fetch(`${SERVER_URL}/admin/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"},
                body: JSON.stringify({email, password})
            });

            const data = await response.json();

            if (response.ok && data.access_token){
                localStorage.setItem("admin_token", data.access_token);
                navigate("/configuration");
                
            }
            else{
                setError(data.error || "Login Failed");
            }
        }

        catch (err){
            setError("Could not connect to the server.");
        }
        finally{
            setLoading(false);
        }
    };


    return (
        <div className="container">
            <div className="form-wrapper">
                <h2>Login as Admin</h2>

                {error && <div className="error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                        type="email" 
                        id="email" 
                        placeholder="Enter your email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}/>

                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                        type="password" 
                        id="password" 
                        placeholder="Enter your password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}/>
                    </div>

                    <input 
                    type="submit" 
                    value={loading? "Logging In.." : "Login"}
                    disabled={loading}/>
                </form>
            </div>
        </div>
    );
};