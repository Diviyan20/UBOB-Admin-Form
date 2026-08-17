import { useEffect, useState } from "react";
import { getAllOutlets } from "../../services/outlet/OutletService";
import type { Outlet } from "../../types/Outlet";
import "../../styling/OutletDashboardStyles.css";
import type { UUID } from "crypto";

function displayValue(value: string | number | UUID | null | undefined): string {
    if (value === null || value === undefined || value === "") {
        return "Null";
    }

    return String(value);
}

export default function OutletDashboard() {
    const [outlets, setOutlets] = useState<Outlet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadOutlets();
    }, []);

    async function loadOutlets() {
        try {
            setLoading(true);
            setError(null);

            const data = await getAllOutlets();

            setOutlets(data);
        } catch (error) {
            console.error("Failed to fetch outlets:", error);

            setError("Failed to load outlet information");
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="outlet-dashboard">
                <div className="outlet-dashboard-loading">
                    Loading outlets...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="outlet-dashboard">
                <div className="outlet-dashboard-error">
                    <div>{error}</div>

                    <button onClick={loadOutlets}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="outlet-dashboard">

            <div className="outlet-dashboard-header">
                <h2>Outlets</h2>

                <button onClick={loadOutlets}>
                    Refresh
                </button>
            </div>

            {outlets.length === 0 ? (
                <div className="empty-state">
                    <p>No outlets found.</p>
                </div>
            ) : (
                <div className="outlet-table-container">

                    <table className="outlet-table">

                        <thead>
                            <tr>
                                <th>UUID</th>
                                <th>Outlet ID</th>
                                <th>Outlet Name</th>
                                <th>Outlet Location</th>
                                <th>Outlet Status</th>
                                <th>Active</th>
                                <th>Last Seen</th>
                                <th>Order URL</th>
                                <th>Order API Key</th>
                            </tr>
                        </thead>

                        <tbody>
                            {outlets.map((outlet) => (
                                <tr key={outlet.outlet_id}>

                                    <td>
                                        {displayValue(outlet.uuid)}
                                    </td>

                                    <td>
                                        {displayValue(outlet.outlet_id)}
                                    </td>

                                    <td>
                                        {displayValue(outlet.outlet_name)}
                                    </td>

                                    <td>
                                        {displayValue(outlet.outlet_location)}
                                    </td>

                                    <td>
                                        {outlet.outlet_status ? (
                                            <span
                                                className={`outlet-status ${
                                                    outlet.outlet_status.toLowerCase()
                                                }`}
                                            >
                                                {outlet.outlet_status}
                                            </span>
                                        ) : (
                                            <span className="null-value">
                                                Null
                                            </span>
                                        )}
                                    </td>

                                    <td>
                                        {displayValue(outlet.active)}
                                    </td>

                                    <td>
                                        {displayValue(outlet.last_seen)}
                                    </td>

                                    <td>
                                        {displayValue(outlet.order_api_url)}
                                    </td>

                                    <td>
                                        {displayValue(outlet.order_api_key)}
                                    </td>

                                </tr>
                            ))}
                        </tbody>

                    </table>

                </div>
            )}

        </div>
    );
}