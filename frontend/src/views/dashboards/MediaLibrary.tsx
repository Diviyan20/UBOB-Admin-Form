import { useEffect, useState } from "react";
import { getAllMedia, getMediaPreviewUrl } from "../../services/media/MediaLibraryService";

import type { MediaLibraryItem } from "../../types/Media";

import "../../styling/MediaLibraryStyling.css";

function displayValue(value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "Null";
  }

  return value;
}

const VIDEO_EXTENSIONS = ["mp4", "mov", "webm", "avi", "mkv"];
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg"];

function getFileKind(fileName: string): "video" | "image" | "unsupported" {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (VIDEO_EXTENSIONS.includes(ext)) return "video";
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  return "unsupported";
}

export default function MediaLibrary() {
  const [media, setMedia] = useState<MediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [previewItem, setPreviewItem] = useState<MediaLibraryItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    try {
      setLoading(true);
      setError(null);

      const data = await getAllMedia();

      setMedia(data);
    } catch (error) {
      console.error("Failed to load media library:", error);

      setError("Failed to load media library.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    try {
      setRefreshing(true);
      setError(null);

      const data = await getAllMedia();

      setMedia(data);
    } catch (error) {
      console.error("Failed to refresh media library:", error);

      setError("Failed to refresh media library.");
    } finally {
      setRefreshing(false);
    }
  }

  async function openPreview(item: MediaLibraryItem) {
    setPreviewItem(item);
    setPreviewUrl(null);
    setPreviewError(null);
    setPreviewLoading(true);

    try {
      const url = await getMediaPreviewUrl(item.media_id);
      setPreviewUrl(url);
    } catch (error) {
      console.error("Failed to load preview:", error);
      setPreviewError(
        error instanceof Error ? error.message : "Failed to load preview",
      );
    } finally {
      setPreviewLoading(false);
    }
  }

  function closePreview() {
    setPreviewItem(null);
    setPreviewUrl(null);
    setPreviewError(null);
  }

  if (loading) {
    return (
      <div className="media-library">
        <p>Loading media library...</p>
      </div>
    );
  }

  return (
    <div className="media-library">
      <div className="media-library-header">
        <div>
          <h2>Media Library</h2>

          <p>Media currently stored in the Global S3 folder.</p>
        </div>

        <button type="button" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && <div className="media-library-error">{error}</div>}

      {media.length === 0 ? (
        <div className="media-library-empty">
          <p>No media found in the Global folder.</p>
        </div>
      ) : (
        <div className="media-library-table-container">
          <table className="media-library-table">
            <thead>
              <tr>
                <th></th>
                <th>ID</th>
                <th>File Name</th>
                <th>Object Key</th>
              </tr>
            </thead>

            <tbody>
              {media.map((item) => (
                <tr key={item.media_id}>
                  <td>
                    <button
                      type="button"
                      className="media-library-preview-btn"
                      onClick={() => openPreview(item)}
                    >
                      Preview
                    </button>
                  </td>

                  <td>{displayValue(item.media_id)}</td>

                  <td>{displayValue(item.file_name)}</td>

                  <td>{displayValue(item.object_key)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {previewItem && (
        <div className="media-library-preview-backdrop" onClick={closePreview}>
          <div
            className="media-library-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="media-library-preview-header">
              <span>{previewItem.file_name}</span>
              <button type="button" onClick={closePreview}>
                Close
              </button>
            </div>

            <div className="media-library-preview-body">
              {previewLoading && <p>Loading preview...</p>}

              {previewError && (
                <p className="media-library-error">{previewError}</p>
              )}

              {previewUrl &&
                !previewLoading &&
                !previewError &&
                (() => {
                  const kind = getFileKind(previewItem.file_name);

                  if (kind === "video") {
                    return (
                      <video
                        src={previewUrl}
                        controls
                        autoPlay
                        className="media-library-preview-media"
                      />
                    );
                  }

                  if (kind === "image") {
                    return (
                      <img
                        src={previewUrl}
                        alt={previewItem.file_name}
                        className="media-library-preview-media"
                      />
                    );
                  }

                  return <p>Preview not supported for this file type.</p>;
                })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
