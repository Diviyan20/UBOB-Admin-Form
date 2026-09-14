import { useEffect, useState } from "react";

import {
  getSystemConfig,
  updateSystemConfigField,
  createSystemConfigField,
  deleteSystemConfigField,
  milliSecondsToTime,
  timetoMilliseconds,
  SYSTEM_CONFIG_LABELS,
} from "../../services/system/SystemConfigService";

import "../../styling/SystemConfigTableStyles.css";

interface ConfigEntry {
  fieldName: string;
  value: number;
}

export default function SystemConfigTable() {
  const [config, setConfig] = useState<ConfigEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingField, setEditingField] = useState<string | null>(null);

  const [editValue, setEditValue] = useState("");

  const [saving, setSaving] = useState(false);

  // -------------------------------------------------------
  // Load configuration
  // -------------------------------------------------------

  async function loadConfig() {
    try {
      setLoading(true);
      setError(null);

      const data = await getSystemConfig();

      if (!data || typeof data !== "object") {
            throw new Error(
                "Invalid system configuration data received from server"
            );
        }

      const entries: ConfigEntry[] = Object.entries(data)
        .map(([fieldName, value]) => ({
            fieldName,
            value: Number(value),
        }))
        .filter((entry) => Number.isFinite(entry.value));

      setConfig(entries);
    } catch (error) {
      console.error("Failed to load system configuration:", error);

      setError("Failed to load system configuration");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConfig();
  }, []);

  // -------------------------------------------------------
  // Edit
  // -------------------------------------------------------

  function startEditing(entry: ConfigEntry) {
    setEditingField(entry.fieldName);

    setEditValue(milliSecondsToTime(entry.value));
  }

  function cancelEditing() {
    setEditingField(null);
    setEditValue("");
  }

  async function saveField(fieldName: string) {
    try {
      setSaving(true);
      setError(null);

      const milliseconds = timetoMilliseconds(editValue);

      await updateSystemConfigField(fieldName, milliseconds);

      await loadConfig();

      setEditingField(null);
      setEditValue("");
    } catch (error) {
      console.error("Failed to update system configuration:", error);

      setError(
        error instanceof Error ? error.message : "Failed to update field",
      );
    } finally {
      setSaving(false);
    }
  }

  // -------------------------------------------------------
  // Create field
  // -------------------------------------------------------

  async function handleCreateField() {
    const fieldName = window.prompt("Enter the new field name:");

    if (!fieldName) {
      return;
    }

    try {
      setError(null);

      await createSystemConfigField(fieldName, 0);

      await loadConfig();
    } catch (error) {
      console.error("Failed to create field:", error);

      setError(
        error instanceof Error ? error.message : "Failed to create field",
      );
    }
  }

  // -------------------------------------------------------
  // Delete field
  // -------------------------------------------------------

  async function handleDeleteField(fieldName: string) {
    const confirmed = window.confirm(`Delete the "${fieldName}" field?`);

    if (!confirmed) {
      return;
    }

    try {
      setError(null);

      await deleteSystemConfigField(fieldName);

      await loadConfig();
    } catch (error) {
      console.error("Failed to delete field:", error);

      setError(
        error instanceof Error ? error.message : "Failed to delete field",
      );
    }
  }

  // -------------------------------------------------------
  // Loading
  // -------------------------------------------------------

  if (loading) {
    return (
      <div className="system-config-table">Loading system configuration...</div>
    );
  }

  return (
    <div className="system-config-table">
      <div className="system-config-header">
        <div>
          <h2>System Configuration</h2>

          <p>Manage system timing and configuration values</p>
        </div>

        <div className="system-config-actions">
          <button onClick={loadConfig}>Refresh</button>

          <button onClick={handleCreateField}>Add Field</button>
        </div>
      </div>

      {error && <div className="system-config-error">{error}</div>}

      <div className="system-config-table-container">
        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {config.map((entry) => (
              <tr key={entry.fieldName}>
                <td>
                  {SYSTEM_CONFIG_LABELS[entry.fieldName] ?? entry.fieldName}
                </td>

                <td>
                  {editingField === entry.fieldName ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(event) => setEditValue(event.target.value)}
                      placeholder="HH:MM:SS"
                      disabled={saving}
                    />
                  ) : (
                    milliSecondsToTime(entry.value)
                  )}
                </td>

                <td>
                  {editingField === entry.fieldName ? (
                    <>
                      <button
                        onClick={() => saveField(entry.fieldName)}
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>

                      <button onClick={cancelEditing} disabled={saving}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEditing(entry)}>Edit</button>

                      <button
                        onClick={() => handleDeleteField(entry.fieldName)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
