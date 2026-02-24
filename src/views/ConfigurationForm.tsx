import "../styling/ConfigurationStyles.css"
import DropdownComponent from "../components/DropdownComponent";
import { useState } from "react";

export default function ConfigurationForm() {
    const [selectedOutlet, setSelectedOutlet] = useState<{ id: string, name: string, region: string } | null>(null);
    
    const handleOutletSelect = (outletId: string, outletName: string, outletRegion:string) => {
        setSelectedOutlet({ id: outletId, name: outletName, region:outletRegion });
        console.log("Selected:", outletId, outletName);
    };

    return (
        <div className="container">
            <div className="form-wrapper">
                <h2>Configure Outlet ID and Access Token</h2>

                <form>
                    <div className="form-group">
                        <label htmlFor="outlet_id" id="outlet_id">Outlet ID</label>
                        <DropdownComponent onSelect={handleOutletSelect}/>

                        {selectedOutlet && (
                <p>Selected: {selectedOutlet.id} - {selectedOutlet.name}</p>
            )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="order_url">Preparation Screen URL</label>
                        <input id="outlet_id" placeholder="Preparation Screen URL" readOnly={true} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="outlet_id">Access Token</label>
                        <input type="text" id="access_token" placeholder="Enter Access Token" />
                    </div>

                    <input type="submit" value="Configure" />
                </form>
            </div>

        </div>
    );
};