import { useEffect, useState } from "react";
import { uploadAsset, getAssets, deleteAsset } from "../services/api";
import "../styles/dashboard.css";

function AssetsPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [assets, setAssets] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const loadAssets = async () => {
    if (!user) return;
    const data = await getAssets(user.userId);
    setAssets(data);
  };

  useEffect(() => {
    loadAssets();
    // eslint-disable-next-line
  }, []);

  const handleUpload = async () => {
    if (!file) {
      alert("Select a file");
      return;
    }
    await uploadAsset(file, user.userId);
    setFile(null);
    loadAssets();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this asset?")) return;
    await deleteAsset(id);
    loadAssets();
  };

  return (
    <div>
      <h1>Assets</h1>

      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload}>Upload</button>

      {/* 🔹 ASSETS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "16px",
          marginTop: "20px"
        }}
      >
        {assets.map((a) => (
          <div
            key={a.id}
            style={{
              position: "relative",
              border: "1px solid #ddd",
              padding: "8px",
              cursor: "pointer"
            }}
            onClick={() => setPreview(a)}
          >
            {/* 🗑 DELETE BUTTON */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(a.id);
              }}
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              🗑
            </button>

            {a.file_type === "image" ? (
              <img
                src={`http://localhost:5000${a.file_path}`}
                alt=""
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover"
                }}
              />
            ) : (
              <video
                src={`http://localhost:5000${a.file_path}`}
                muted
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover"
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* 🔍 PREVIEW MODAL */}
      {preview && (
        <div className="modal-backdrop" onClick={() => setPreview(null)}>
          <div
            className="modal"
            style={{ maxWidth: "900px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Preview</h2>

            {preview.file_type === "image" ? (
              <img
                src={`http://localhost:5000${preview.file_path}`}
                alt=""
                style={{ maxWidth: "100%", maxHeight: "80vh" }}
              />
            ) : (
              <video
                src={`http://localhost:5000${preview.file_path}`}
                controls
                autoPlay
                style={{ maxWidth: "100%", maxHeight: "80vh" }}
              />
            )}

            <div className="modal-actions">
              <button
                className="secondary"
                onClick={() => setPreview(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssetsPage;