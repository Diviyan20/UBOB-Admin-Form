import "../styling/ConfigurationStyles.css"
import DropdownComponent from "../components/DropdownComponent";
import React,{ useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SERVER_URL = "https://ubob-admin-form.onrender.com";

export default function ConfigurationForm() {
    const [selectedOutlet, setSelectedOutlet] = useState<{ id: string, name: string, region: string } | null>(null);
    const [accessToken, setAccessToken] = useState<string>("");
    const [loading, setLoading] = useState<boolean>();
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () =>{
            try{
                const response = await fetch(`${SERVER_URL}/admin/check-auth`,{
                    method:"GET",
                    credentials: "include"
                });

                if(!response.ok){
                    navigate("/");
                }
            }
            catch{
                navigate("/");
            }
        };
        checkAuth();
    },[]);

    const handleOutletSelect = (outletId: string, outletName: string, outletRegion: string) => {
        setSelectedOutlet({ id: outletId, name: outletName, region: outletRegion });
    };

    // Load the order tracking url
    const baseUrl = import.meta.env.VITE_ORDER_TRACKING_URL

    // This function runs when the form is submitted
    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault(); // Stop the browser from doing a normal form submit (page reload)

        if (loading) return;

        // Make sure the admin selects an outlet
        if (!selectedOutlet) {
            alert("Please select an outlet first.");
            return
        }

        // Make sure the user enters the access token
        if (!accessToken.trim()) {
            alert("Access Token missing!");
            return;
        }

        try {
            setLoading(true);

            // Store what has been retrieved from the selectedOutlet
            const body = {
                outlet_id: selectedOutlet.id,
                outlet_name: selectedOutlet.name,
                region_name: selectedOutlet.region,
                order_api_url: baseUrl,             // The order tracking URL
                order_api_key: accessToken.trim(),  // Access token entered by user
            }

            // Update the credentials
            const response = await fetch(`${SERVER_URL}/api/register_outlet`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(body),
            });

            const data = await response.json()

            if (response.ok && data.success) {
                alert("Success! Outlet has been registered");
            }
            else {
                throw new Error(data.error || "Configuration Failed");
            }
        }
        catch (err: any) {
            alert(`Configuration Error: ${err.message || err}`)
        }
        finally {
            setLoading(false);
        }
    }

    const handleAccessTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAccessToken(event.target.value);
    }

    const handleLogout = async () => {
        try {
            await fetch(`${SERVER_URL}/admin/logout`, {
                method: "POST",
                credentials: "include"
            });
    
            navigate("/");
        } catch {
            navigate("/");
        }
    };

    return (
        <div className="container">
            <button
                type="button"
                className="logout-button"
                onClick={handleLogout}>
                Logout
            </button>
            <div className="form-wrapper">
                <h2>Configure Outlet ID and Access Token</h2>

                {/*Attach onSubmit to the form, not the input*/}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <DropdownComponent onSelect={handleOutletSelect} />

                        {selectedOutlet && (
                            <p>Selected: {selectedOutlet.id} - {selectedOutlet.name}</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="order_url">Preparation Screen URL</label>
                        <textarea
                            id="order_url"
                            value={baseUrl}
                            readOnly
                            className="order-url-field"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="outlet_id">Access Token</label>
                        <input
                            type="text"
                            id="access_token"
                            value={accessToken}
                            placeholder="Enter Access Token"
                            onChange={handleAccessTokenChange} />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Configuring..." : "Configure"}
                    </button>
                </form>
            </div>
        </div>
    );
};