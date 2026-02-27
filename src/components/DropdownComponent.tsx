import { useEffect, useState } from "react";
import React from "react";
import "../styling/DropdownStyles.css"

const SERVER_URL = "http://localhost:5000";

interface Outlet{
    outlet_id: string;
    outlet_name: string;
    region_name: string;
}

interface DropdownComponentProps {
    onSelect: (outletId: string, outletName: string, regionName:string) => void;
}

const DropdownComponent: React.FC<DropdownComponentProps> = ({onSelect}) =>{
    const [search, setSearch] = useState("");
    const [outlets, setOutlets] = useState<Outlet[]>([]);
    const [filteredOutlets, setFilteredOutlets] = useState<Outlet[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);

    const jwt_token = localStorage.getItem("admin_token");

    // Fetch all outlets on mount
    useEffect(() =>{
       fetchAllOutlets();
    }, []);

    console.log(localStorage.getItem("admin_token"));

    // Debounced search - filter outlets as user types
    useEffect(() =>{
        if (search.trim() === ""){
            setFilteredOutlets([]);
            setShowDropdown(false);
            return;
        }

        const timer = setTimeout(() =>{
            const filtered = outlets.filter(outlet =>
                outlet.outlet_id.includes(search) ||
                outlet.outlet_name.toLowerCase().includes(search.toLowerCase()) ||
                outlet.region_name.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredOutlets(filtered);
            setShowDropdown(filtered.length > 0);
        }, 300); // Wait 300 ms after user stops typing (Prevents API call spamming)

        return () => clearTimeout(timer);
    }, [search, outlets]);

    const fetchAllOutlets = async () =>{
        try{
            setLoading(true);
            const response = await fetch(`${SERVER_URL}/api/outlets`, {
                method:"GET",
                headers:{
                    "Content-Type": "application/json",
                    "Authorization":`Bearer ${jwt_token}`
                }
            });
            const data = await response.json();

            if(response.ok){
                setOutlets(data.outlets);
            }
        }
        catch(err){
            console.error("Failed to fetch outlets: ", err);
        }
        finally{
            setLoading(false);
        }
    }

    const handleSelect = (outlet:Outlet)=>{
        setSearch(`${outlet.outlet_id} - ${outlet.outlet_name}`);
        setShowDropdown(false);
        onSelect(outlet.outlet_id, outlet.outlet_name, outlet.region_name);
    }

    return(
        <div className="dropdown-container">
            <label>Outlet ID</label>
            <input
                type="text"
                placeholder="Enter Outlet ID or Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={loading}
            />

            {showDropdown && (
                <div className="dropdown-list">
                    {filteredOutlets.map((outlet) => (
                        <div
                            key={outlet.outlet_id}
                            className="dropdown-item"
                            onClick={() => handleSelect(outlet)}
                        >
                            <span className="outlet-id">{outlet.outlet_id}</span>
                            <span className="outlet-name">{outlet.outlet_name}</span>
                            <span className="outlet-region">{outlet.region_name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default DropdownComponent;