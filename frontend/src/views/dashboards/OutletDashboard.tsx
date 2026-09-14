import { useEffect, useState } from "react";

import {
  getAllOutlets,
  refreshOutletStatus as refreshOutletStatusFromServer,
} from "../../services/outlet/OutletService";

import type { Outlet } from "../../types/Outlet";

import "../../styling/OutletDashboardStyles.css";
import type { UUID } from "crypto";

/*
 * Automatic status refresh interval.
 *
 * 5 minutes = 300 seconds
 */
const STATUS_REFRESH_INTERVAL = 5 * 60;

/*
 * Convert seconds into MM:SS format.
 *
 * Example:
 * 300 -> 05:00
 * 125 -> 02:05
 * 8   -> 00:08
 */
function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

/*
 * Display database values safely.
 *
 * Null / undefined / empty strings become "Null".
 */
function displayValue(
  value: string | number | UUID | null | undefined,
): string {
  if (value === null || value === undefined || value === "") {
    return "Null";
  }

  return String(value);
}

export default function OutletDashboard() {
  /*
   * Outlet data displayed in the table.
   */
  const [outlets, setOutlets] = useState<Outlet[]>([]);

  /*
   * Initial page loading state.
   */
  const [loading, setLoading] = useState(true);

  /*
   * General dashboard error.
   */
  const [error, setError] = useState<string | null>(null);

  /*
   * Indicates that the status refresh request is currently running.
   */
  const [refreshing, setRefreshing] = useState(false);

  /*
   * Countdown until the next automatic status check.
   */
  const [secondsRemaining, setSecondsRemaining] = useState(
    STATUS_REFRESH_INTERVAL,
  );

  /*
   * ==========================================================
   * Initial outlet fetch
   * ==========================================================
   *
   * This simply reads the current outlet information.
   *
   * GET /admin/outlets
   */
  useEffect(() => {
    loadOutlets();
  }, []);

  /*
   * ==========================================================
   * Automatic refresh timer
   * ==========================================================
   *
   * Every second:
   *
   * 1. Countdown decreases
   * 2. When it reaches 0:
   *      - Run status refresh
   *      - Reset countdown
   *
   * Cleanup removes the timer when the component unmounts.
   */
  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsRemaining((previous) => {
        if (previous <= 1) {
          /*
           * Don't await here.
           *
           * The refresh function handles its own
           * loading/error state.
           */
          refreshOutletStatusFromServerData();

          return STATUS_REFRESH_INTERVAL;
        }

        return previous - 1;
      });
    }, 1000);

    /*
     * Clear timer when component is removed.
     */
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  /*
   * ==========================================================
   * Fetch all outlets
   * ==========================================================
   */
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

  /*
   * ==========================================================
   * Refresh outlet statuses
   * ==========================================================
   *
   * This calls the backend maintenance endpoint:
   *
   * POST /admin/outlets/refresh-status
   *
   * Backend:
   * 1. Checks last_seen
   * 2. Marks inactive outlets offline
   * 3. Fetches latest outlet data
   * 4. Returns the updated list
   */
  async function refreshOutletStatusFromServerData() {
    /*
     * Don't start another refresh while one is already running.
     */
    if (refreshing) {
      return;
    }

    try {
      setRefreshing(true);
      setError(null);

      const data = await refreshOutletStatusFromServer();

      setOutlets(data);

      /*
       * Restart the countdown only after a
       * successful refresh.
       */
      setSecondsRemaining(STATUS_REFRESH_INTERVAL);
    } catch (error) {
      console.error("Failed to refresh outlet status:", error);

      setError("Failed to refresh outlet status");
    } finally {
      setRefreshing(false);
    }
  }

  /*
   * ==========================================================
   * Initial loading UI
   * ==========================================================
   */
  if (loading) {
    return (
      <div className="outlet-dashboard">
        <div className="outlet-dashboard-loading">Loading outlets...</div>
      </div>
    );
  }

  /*
   * ==========================================================
   * Error UI
   * ==========================================================
   */
  if (error && outlets.length === 0) {
    return (
      <div className="outlet-dashboard">
        <div className="outlet-dashboard-error">
          <div>{error}</div>

          <button onClick={loadOutlets}>Retry</button>
        </div>
      </div>
    );
  }

  /*
   * ==========================================================
   * Progress calculation
   * ==========================================================
   *
   * 0%  = timer just restarted
   * 100% = timer reached the end
   */
  const progress =
    ((STATUS_REFRESH_INTERVAL - secondsRemaining) / STATUS_REFRESH_INTERVAL) *
    100;

  return (
    <div className="outlet-dashboard">
      {/* ==================================================
                Header
            ================================================== */}

      <div className="outlet-dashboard-header">
        <div>
          <h2>Outlets</h2>

          <p>Monitor outlet connection status</p>
        </div>

        <button
          onClick={refreshOutletStatusFromServerData}
          disabled={refreshing}
        >
          {refreshing ? "Checking..." : "Refresh"}
        </button>
      </div>

      {/* ==================================================
                Automatic Refresh Status
            ================================================== */}

      <div className="outlet-refresh-status">
        <div className="outlet-refresh-header">
          <span>
            {refreshing
              ? "Checking outlet statuses..."
              : `Next automatic check in ${formatCountdown(secondsRemaining)}`}
          </span>
        </div>

        <div className="outlet-refresh-progress">
          <div
            className="outlet-refresh-progress-bar"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* ==================================================
                Non-blocking error
            ================================================== */}

      {error && outlets.length > 0 && (
        <div className="outlet-dashboard-inline-error">{error}</div>
      )}

      {/* ==================================================
                Empty state
            ================================================== */}

      {outlets.length === 0 ? (
        <div className="empty-state">
          <p>No outlets found.</p>
        </div>
      ) : (
        /* ==================================================
                   Outlet Table
                ================================================== */

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
                  <td>{displayValue(outlet.uuid)}</td>

                  <td>{displayValue(outlet.outlet_id)}</td>

                  <td>{displayValue(outlet.outlet_name)}</td>

                  <td>{displayValue(outlet.outlet_location)}</td>

                  {/* STATUS */}

                  <td>
                    {outlet.outlet_status ? (
                      <span
                        className={`outlet-status ${outlet.outlet_status.toLowerCase()}`}
                      >
                        {outlet.outlet_status}
                      </span>
                    ) : (
                      <span className="null-value">Null</span>
                    )}
                  </td>

                  <td>{displayValue(outlet.active)}</td>

                  <td>{displayValue(outlet.last_seen)}</td>

                  <td>{displayValue(outlet.order_api_url)}</td>

                  <td>{displayValue(outlet.order_api_key)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
