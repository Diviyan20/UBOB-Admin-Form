import { useEffect, useState } from "react";
import { refreshMediaLibrary } from "../services/media/MediaLibraryService";

import type { Media } from "../types/Media";

import "../styling/MediaLibraryStyling.css";

function displayValue(value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "Null";
  }

  return value;
}

export default function MediaLibrary() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    try {
      setLoading(true);
      setError(null);

      const data = await refreshMediaLibrary();

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

      const data = await refreshMediaLibrary();

      setMedia(data);
    } catch (error) {
      console.error("Failed to refresh media library:", error);

      setError("Failed to refresh media library.");
    } finally {
      setRefreshing(false);
    }
  }

  if(loading){
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

                    <p>
                        Media currently stored in
                        the Global S3 folder.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}
                </button>

            </div>


            {error && (
                <div className="media-library-error">
                    {error}
                </div>
            )}


            {media.length === 0 ? (

                <div className="media-library-empty">
                    <p>
                        No media found in the Global folder.
                    </p>
                </div>

            ) : (

                <div className="media-library-table-container">

                    <table className="media-library-table">

                        <thead>

                            <tr>
                                <th>ID</th>
                                <th>File Name</th>
                                <th>Object Key</th>
                            </tr>

                        </thead>

                        <tbody>

                            {media.map((item) => (

                                <tr key={item.media_id}>

                                    <td>
                                        {displayValue(item.media_id)}
                                    </td>

                                    <td>
                                        {displayValue(
                                            item.file_name
                                        )}
                                    </td>

                                    <td>
                                        {displayValue(
                                            item.object_key
                                        )}
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
