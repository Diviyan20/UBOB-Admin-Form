import { useEffect, useState } from "react";
import { getAllOutlets } from "../services/outlet/OutletService";
import { getAllMedia } from "../services/media/MediaLibraryService";

import {
  createOutletScreen,
  deleteOutletScreen,
  getAllOutletScreens,
  updateOutletScreen,
} from "../services/outlet/OutletScreenService";
import type { Outlet } from "../types/Outlet";
import type { MediaLibraryItem } from "../types/Media";
import type {
  Frequency,
  Orientation,
  OutletScreen,
  ScreenType,
  Tier,
} from "../types/OutletScreen";
import "../styling/OutletScreenConfigurationStyles.css";

function displayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "Null";
  }
  return String(value);
}

function displayDate(value: string | null | undefined): string {
  if (!value) return "Null";
  return new Date(value).toLocaleString();
}

/*
  Pulls "YYYY-MM-DD" and "HH:MM" straight out of the stored ISO string,
    without going through a Date object, so we don't get timezone drift
    when round-tripping into separate date/time inputs.
*/ 
function splitDateTime(iso: string | null | undefined): {
  date: string;
  time: string;
} {
  if (!iso) return { date: "", time: "" };
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
}

/*
  * "Daily" only cares about time of day
  * Date is pinned to a sentinel so the column stays a normal TIMESTAMPTZ
  * Whatever reads this for playback later must ignore the date portion for Daily screens.
*/ 
const DAILY_SENTINEL_DATE = "1970-01-01";

function displayScreenSchedule(screen: OutletScreen): string {
  if (screen.frequency === "Evergreen") return "All day";
  if (screen.frequency === "Daily") {
    const start = splitDateTime(screen.start_datetime).time;
    const end = splitDateTime(screen.end_datetime).time;
    if (!start && !end) return "Null";
    return `${start || "?"} – ${end || "?"}`;
  }
  // LTO (Limited Time Offer)
  if (!screen.start_datetime && !screen.end_datetime) return "Null";
  return `${displayDate(screen.start_datetime)} – ${displayDate(screen.end_datetime)}`;
}

const SCREEN_TYPES: ScreenType[] = ["Signage", "Media Player"];
const TIERS: Tier[] = ["Tier A", "Tier B"];
const ORIENTATIONS: Orientation[] = ["Portrait", "Landscape"];
const FREQUENCIES: Frequency[] = ["Evergreen", "Daily", "LTO"];

interface ScreenFormState {
  outlet_uid: string;
  screen_type: ScreenType | "";
  batch_num: string;
  tier: Tier | "";
  orientation: Orientation | "";
  video_uuid: string;
  frequency: Frequency;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
}

const EMPTY_FORM: ScreenFormState = {
  outlet_uid: "",
  screen_type: "",
  batch_num: "",
  tier: "",
  orientation: "",
  video_uuid: "",
  frequency: "Evergreen",
  start_date: "",
  start_time: "",
  end_date: "",
  end_time: "",
};

export default function OutletScreenConfiguration() {
  const [screens, setScreens] = useState<OutletScreen[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [media, setMedia] = useState<MediaLibraryItem[]>([]);
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

      const [screenData, outletData, mediaData] = await Promise.all([
        getAllOutletScreens(),
        getAllOutlets(),
        getAllMedia(),
      ]);

      setScreens(screenData);
      setOutlets(outletData);
      setMedia(mediaData);
    } catch (error) {
      console.error("Failed to fetch outlet screens:", error);
      setError("Failed to load outlet screen information");
    } finally {
      setLoading(false);
    }
  }

  // Opens the form to add a new outlet screen
  function openAddForm() {
    setEditingScreenId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  }

  // Opens the editing form of an existing outlet screen
  function openEditForm(screen: OutletScreen) {
    const start = splitDateTime(screen.start_datetime);
    const end = splitDateTime(screen.end_datetime);

    setEditingScreenId(screen.screen_id);
    setForm({
      outlet_uid: screen.outlet_uid,
      screen_type: screen.screen_type,
      batch_num: screen.batch_num?.toString() ?? "",
      tier: screen.tier ?? "",
      orientation: screen.orientation,
      video_uuid: screen.video_uuid ?? "",
      frequency: screen.frequency,
      start_date: start.date,
      start_time: start.time,
      end_date: end.date,
      end_time: end.time,
    });
    setFormError(null);
    setShowForm(true);
  }

  // Closes forms
  function closeForm() {
    setShowForm(false);
    setEditingScreenId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  /*
    * outlet_name is never typed in — it's looked up from the outlet the admin
    * Picked in the dropdown, using data already fetched for the dropdown itself.
  */ 
  const selectedOutletName = outlets.find(
    (o) => o.uuid === form.outlet_uid,
  )?.outlet_name;

  function buildScheduleFields(): {
    start_datetime: string | null;
    end_datetime: string | null;
  } {
    // Schedule for media running all day
    if (form.frequency === "Evergreen") {
      return { start_datetime: null, end_datetime: null };
    }

    // Schedule for media running every day, at a certain time
    if (form.frequency === "Daily") {
      return {
        start_datetime: form.start_time
          ? `${DAILY_SENTINEL_DATE}T${form.start_time}:00`
          : null,
        end_datetime: form.end_time
          ? `${DAILY_SENTINEL_DATE}T${form.end_time}:00`
          : null,
      };
    }

    // LTO (Limited Time Offer scehdule)
    return {
      start_datetime:
        form.start_date && form.start_time
          ? `${form.start_date}T${form.start_time}:00`
          : null,
      end_datetime:
        form.end_date && form.end_time
          ? `${form.end_date}T${form.end_time}:00`
          : null,
    };
  }

  async function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();
    setFormError(null);

    if (!form.outlet_uid || !form.screen_type || !form.orientation) {
      setFormError("Outlet, screen type, and orientation are required");
      return;
    }

    const { start_datetime, end_datetime } = buildScheduleFields();

    const payload = {
      outlet_uid: form.outlet_uid,
      screen_type: form.screen_type as ScreenType,
      orientation: form.orientation as Orientation,
      batch_num:
        form.screen_type === "Media Player" && form.batch_num
          ? Number(form.batch_num)
          : null,
      tier: form.tier || null,
      video_uuid: form.video_uuid || null,
      frequency: form.frequency,
      start_datetime,
      end_datetime,
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
                <th></th>
                <th>Outlet</th>
                <th>Screen Type</th>
                <th>Batch</th>
                <th>Tier</th>
                <th>Orientation</th>
                <th>Video</th>
                <th>Frequency</th>
                <th>Schedule</th>
                <th>Created</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {screens.map((screen) => (
                <tr key={screen.screen_id}>
                  <td className="outlet-screen-actions">
                    <button
                      className="outlet-screen-edit-btn"
                      onClick={() => openEditForm(screen)}
                    >
                      Edit
                    </button>
                    <button
                      className="outlet-screen-delete-btn"
                      onClick={() => handleDelete(screen)}
                    >
                      Delete
                    </button>
                  </td>
                  <td>{displayValue(screen.outlet_name)}</td>
                  <td>{displayValue(screen.screen_type)}</td>
                  <td>{displayValue(screen.batch_num)}</td>
                  <td>{displayValue(screen.tier)}</td>
                  <td>{displayValue(screen.orientation)}</td>
                  <td>{displayValue(screen.video_name)}</td>
                  <td>{displayValue(screen.frequency)}</td>
                  <td>{displayScreenSchedule(screen)}</td>
                  <td>{displayDate(screen.created_at)}</td>
                  <td>{displayDate(screen.updated_at)}</td>
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
                <select
                  value={form.video_uuid}
                  onChange={(e) =>
                    setForm({ ...form, video_uuid: e.target.value })
                  }
                >
                  <option value="">None</option>
                  {media.map((item) => (
                    <option key={item.media_id} value={item.media_id}>
                      {item.file_name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Frequency
                <select
                  value={form.frequency}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      frequency: e.target.value as Frequency,
                      start_date: "",
                      start_time: "",
                      end_date: "",
                      end_time: "",
                    })
                  }
                  required
                >
                  {FREQUENCIES.map((freq) => (
                    <option key={freq} value={freq}>
                      {freq}
                    </option>
                  ))}
                </select>
              </label>

              {form.frequency === "Daily" && (
                <>
                  <label>
                    Start Time
                    <input
                      type="time"
                      value={form.start_time}
                      onChange={(e) =>
                        setForm({ ...form, start_time: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    End Time
                    <input
                      type="time"
                      value={form.end_time}
                      onChange={(e) =>
                        setForm({ ...form, end_time: e.target.value })
                      }
                    />
                  </label>
                </>
              )}

              {form.frequency === "LTO" && (
                <>
                  <label>
                    Start Date
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={(e) =>
                        setForm({ ...form, start_date: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Start Time
                    <input
                      type="time"
                      value={form.start_time}
                      onChange={(e) =>
                        setForm({ ...form, start_time: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    End Date
                    <input
                      type="date"
                      value={form.end_date}
                      onChange={(e) =>
                        setForm({ ...form, end_date: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    End Time
                    <input
                      type="time"
                      value={form.end_time}
                      onChange={(e) =>
                        setForm({ ...form, end_time: e.target.value })
                      }
                    />
                  </label>
                </>
              )}

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
