import { useEffect, useState } from "react";
import api from "../api";

export default function UploadedImages() {
  const [media, setMedia] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const [hoveredItem, setHoveredItem] = useState(null);

  const fetchMedia = async () => {
    const res = await api.get("/uploads-list");
    setMedia(res.data);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const deleteMedia = async (filename) => {
    const confirmDelete = window.confirm(`Delete ${filename}?`);
    if (!confirmDelete) return;

    try {
      await api.delete(`/uploads/${filename}`);
      await fetchMedia();
      alert("File deleted successfully");
    } catch (err) {
      alert("Failed to delete file: " + (err.response?.data?.error || err.message));
    }
  };

  const renderMedia = (item) => {
    const isVideo = [".mp4", ".mov"].includes(item.ext);

    if (isVideo) {
      return (
        <video
          controls
          style={{
            width: "100%",
            height: "180px",
            objectFit: "cover",
            display: "block",
            backgroundColor: "#000",
          }}
        >
          <source
            src={`${API_BASE_URL}${item.url}`}
            type={item.ext === ".mov" ? "video/quicktime" : "video/mp4"}
          />
          Your browser does not support the video tag.
        </video>
      );
    }

    return (
      <img
        src={`${API_BASE_URL}${item.url}`}
        alt={item.name}
        style={{
          width: "100%",
          height: "180px",
          objectFit: "cover",
          display: "block",
          backgroundColor: "#f3f3f3",
        }}
      />
    );
  };

  return (
    <div>
      <h2>Uploaded Media</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        {media.map((item) => (
          <div
            key={item.name}
            onMouseEnter={() => setHoveredItem(item.name)}
            onMouseLeave={() => setHoveredItem(null)}
            style={{
              position: "relative",
              border: "1px solid #ddd",
              padding: "10px",
              borderRadius: "8px",
              minHeight: "300px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
            }}
          >
            {renderMedia(item)}

            <p style={{ marginTop: "8px", wordBreak: "break-word" }}>
              {item.name}
            </p>

            <button
              onClick={() => deleteMedia(item.name)}
              title="Delete file"
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: "rgba(220, 53, 69, 0.95)",
                color: "white",
                cursor: "pointer",
                display: hoveredItem === item.name ? "flex" : "none",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              }}
            >
              🗑
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}