import { useEffect, useState } from "react";
import { getAllOutlets } from "../services/OutletService";

import {
  createOutletScreen,
  deleteOutletScreen,
  getAllOutletScreens,
  updateOutletScreen,
} from "../services/OutletScreenService";
import type { Outlet } from "../types/Outlet";
import type {
  Orientation,
  OutletScreen,
  ScreenType,
  Tier,
} from "../types/OutletScreen";
import "../styling/OutletScreenConfigurationStyles.css"

function displayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "Null";
  }
  return String(value);
}

const SCREEN_TYPES: ScreenType[] = ["Signage", "Media Player"];
const TIERS: Tier[] = ["Tier A", "Tier B"];
const ORIENTATIONS: Orientation[] = ["Portrait", "Landscape"];

interface ScreenFormState {
  outlet_uid: string;
  screen_type: ScreenType | "";
  batch_num: string;
  tier: Tier | "";
  orientation: Orientation | "";
}

const EMPTY_FORM: ScreenFormState = {
  outlet_uid: "",
  screen_type: "",
  batch_num: "",
  tier: "",
  orientation: "",
};

export default function OutletScreenConfiguration() {
  const [screens, setScreens] = useState<OutletScreen[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingScreenId, setEditingScreenId] = useState<string | null>(null);
  const [form, setForm] = useState<ScreenFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [screenData, outletData] = await Promise.all([
        getAllOutletScreens(),
        getAllOutlets(),
      ]);

      setScreens(screenData);
      setOutlets(outletData);
    } catch (error) {
      console.error("Failed to fetch outlet screens:", error);
      setError("Failed to load outlet screen information");
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setEditingScreenId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  }

  function openEditForm(screen: OutletScreen) {
    setEditingScreenId(screen.screen_id);
    setForm({
      outlet_uid: screen.outlet_uid,
      screen_type: screen.screen_type,
      batch_num: screen.batch_num?.toString() ?? "",
      tier: screen.tier ?? "",
      orientation: screen.orientation,
    });
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingScreenId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  // outlet_name is never typed in — it's looked up from the outlet the admin
  // picked in the dropdown, using data already fetched for the dropdown itself.
  const selectedOutletName = outlets.find(
    (o) => o.uuid === form.outlet_uid,
  )?.outlet_name;

  async function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();
    setFormError(null);

    if (!form.outlet_uid || !form.screen_type || !form.orientation) {
      setFormError("Outlet, screen type, and orientation are required");
      return;
    }

    const payload = {
      outlet_uid: form.outlet_uid,
      screen_type: form.screen_type as ScreenType,
      orientation: form.orientation as Orientation,
      batch_num:
        form.screen_type === "Media Player" && form.batch_num
          ? Number(form.batch_num)
          : null,
      tier: form.tier || null,
    };

    try {
      setSubmitting(true);

      if (editingScreenId) {
        await updateOutletScreen(editingScreenId, payload);
      } else {
        await createOutletScreen(payload);
      }

      closeForm();
      await loadData();
    } catch (error) {
      console.error("Failed to save outlet screen:", error);
      setFormError(
        error instanceof Error ? error.message : "Failed to save screen",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(screen: OutletScreen) {
    const confirmed = window.confirm(
      `Delete this screen config for ${screen.outlet_name ?? "this outlet"}? This cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await deleteOutletScreen(screen.screen_id);
      await loadData();
    } catch (error) {
      console.error("Failed to delete outlet screen:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete screen",
      );
    }
  }

  if (loading) {
    return (
      <div className="outlet-screen-dashboard">
        <div className="outlet-screen-dashboard-loading">
          Loading outlet screens...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="outlet-screen-dashboard">
        <div className="outlet-screen-dashboard-error">
          <div>{error}</div>
          <button onClick={loadData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="outlet-screen-dashboard">
      <div className="outlet-screen-dashboard-header">
        <h2>Outlet Screens</h2>
        <div>
          <button onClick={loadData}>Refresh</button>
          <button onClick={openAddForm}>Add Screen</button>
        </div>
      </div>

      {screens.length === 0 ? (
        <div className="empty-state">
          <p>No outlet screens configured.</p>
        </div>
      ) : (
        <div className="outlet-screen-table-container">
          <table className="outlet-screen-table">
            <thead>
              <tr>
                <th>Outlet</th>
                <th>Screen Type</th>
                <th>Batch</th>
                <th>Tier</th>
                <th>Orientation</th>
                <th>Video</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {screens.map((screen) => (
                <tr key={screen.screen_id}>
                  <td>{displayValue(screen.outlet_name)}</td>
                  <td>{displayValue(screen.screen_type)}</td>
                  <td>{displayValue(screen.batch_num)}</td>
                  <td>{displayValue(screen.tier)}</td>
                  <td>{displayValue(screen.orientation)}</td>
                  <td>{displayValue(screen.video_uuid)}</td>
                  <td className="outlet-screen-actions">
                    <button onClick={() => openEditForm(screen)}>Edit</button>
                    <button onClick={() => handleDelete(screen)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="outlet-screen-modal-backdrop">
          <div className="outlet-screen-modal">
            <h3>{editingScreenId ? "Edit Screen" : "Add Screen"}</h3>

            <form onSubmit={handleSubmit}>
              <label>
                Outlet
                <select
                  value={form.outlet_uid}
                  onChange={(e) =>
                    setForm({ ...form, outlet_uid: e.target.value })
                  }
                  required
                >
                  <option value="">Select an outlet</option>
                  {outlets.map((outlet) => (
                    <option key={outlet.uuid} value={outlet.uuid ?? ""}>
                      {outlet.outlet_name ?? outlet.outlet_id}
                    </option>
                  ))}
                </select>
              </label>

              {form.outlet_uid && (
                <p className="outlet-screen-name-preview">
                  Outlet name: {selectedOutletName ?? "Unknown"}
                </p>
              )}

              <label>
                Screen Type
                <select
                  value={form.screen_type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      screen_type: e.target.value as ScreenType,
                      batch_num: "",
                    })
                  }
                  required
                >
                  <option value="">Select a screen type</option>
                  {SCREEN_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              {form.screen_type === "Media Player" && (
                <label>
                  Batch Number
                  <select
                    value={form.batch_num}
                    onChange={(e) =>
                      setForm({ ...form, batch_num: e.target.value })
                    }
                  >
                    <option value="">Select a batch</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </label>
              )}

              <label>
                Tier
                <select
                  value={form.tier}
                  onChange={(e) =>
                    setForm({ ...form, tier: e.target.value as Tier })
                  }
                >
                  <option value="">None</option>
                  {TIERS.map((tier) => (
                    <option key={tier} value={tier}>
                      {tier}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Orientation
                <select
                  value={form.orientation}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      orientation: e.target.value as Orientation,
                    })
                  }
                  required
                >
                  <option value="">Select orientation</option>
                  {ORIENTATIONS.map((orientation) => (
                    <option key={orientation} value={orientation}>
                      {orientation}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Video
                <select disabled>
                  <option>No media available yet</option>
                </select>
              </label>

              {formError && (
                <p className="outlet-screen-form-error">{formError}</p>
              )}

              <div className="outlet-screen-form-actions">
                <button type="button" onClick={closeForm} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
