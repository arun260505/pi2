  import { useEffect, useState, useCallback } from "react";
  import { ChromePicker } from "react-color";
  import {
    getPlaylists,
    createPlaylist,
    getPlaylistAssets,
    addAssetsToPlaylist,
    getAssets,
    removeAssetFromPlaylist,
    deletePlaylist,
    savePlaylistOrder,
    saveAssetDuration,
    saveTickerConfig,
  } from "../services/api";



  import "../styles/playlists.css";
  import {
    DndContext,
    closestCenter
  } from "@dnd-kit/core";

  import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove
  } from "@dnd-kit/sortable";

  import { CSS } from "@dnd-kit/utilities";


  function SortableAssetRow({ asset, selected, children }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition
    } = useSortable({ id: asset.id, disabled: !selected });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      cursor: selected ? "grab" : "default"
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...(selected ? listeners : {})}
        {...attributes}
      >
        {children}
      </div>
    );
  }



  function PlaylistsPage() {
    let user = null;

  try {
    const rawUser = localStorage.getItem("user");
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch (err) {
    console.error("Invalid user in localStorage:", err);
    localStorage.removeItem("user");
  }




    const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);


    const [playlists, setPlaylists] = useState([]);
    const [newName, setNewName] = useState("");
    const [activePlaylist, setActivePlaylist] = useState(null);

    const [assets, setAssets] = useState([]);
    const [playlistItems, setPlaylistItems] = useState([]);

    const [tickerOpen, setTickerOpen] = useState(false);
  const [tickerConfig, setTickerConfig] = useState({
  enabled: false,
  place: "landscape", // 🔥 NEW ("landscape" | "portrait")
  direction: "left",
  speed: "medium",
  height: 50,
  fontSize: 20,
  color: "#00ff66",
  bgColor: "rgba(0,0,0,0.85)",
  messages: [""],
});





    


  const loadPlaylists = useCallback(async () => {
    const data = await getPlaylists(user.userId);
    setPlaylists(data);
  }, [user.userId]);


  const loadAssets = useCallback(async () => {
    const data = await getAssets(user.userId);
    setAssets(data);
  }, [user.userId]);

  useEffect(() => {
    loadPlaylists();
    loadAssets();
  }, [loadPlaylists, loadAssets]);






    


    const openPlaylist = async (pl) => {
    setActivePlaylist(pl);

    const data = await getPlaylistAssets(pl.id);

    // ✅ IMPORTANT FIX: assets are inside data.assets
    setPlaylistItems(data.assets || []);

    const defaultTicker = {
    enabled: false,
    direction: "left",
    speed: "medium",
    height: 50,
    fontSize: 20,
    color: "#00ff66",
    bgColor: "rgba(0,0,0,0.85)",
   messages: [""]
  };

  const normalizeMessages = (messages) => {
  if (Array.isArray(messages)) return messages;
  if (typeof messages === "string" && messages.trim())
    return [messages];
  return [""];
};



    // ✅ Prefer ticker from API response (latest)
    if (data.tickerConfig) {
      if (typeof data.tickerConfig === "object") {
        setTickerConfig({
  ...defaultTicker,
  ...data.tickerConfig,
  messages: normalizeMessages(data.tickerConfig.messages)
});

      } else {
        try {
          const parsed = JSON.parse(data.tickerConfig);
         setTickerConfig({
  ...defaultTicker,
  ...parsed,
  messages: normalizeMessages(parsed.messages)
});

        } catch (err) {
          console.error("Invalid tickerConfig from API:", data.tickerConfig);
          setTickerConfig(defaultTicker);
        }
      }
    } 
    // fallback (older playlists / safety)
    else if (pl.ticker_config) {
      try {
        const parsed = JSON.parse(pl.ticker_config);
        setTickerConfig({
  ...defaultTicker,
  ...parsed,
  messages: normalizeMessages(parsed.messages)
});

      } catch {
        setTickerConfig(defaultTicker);
      }
    } 
    else {
    setTickerConfig(defaultTicker);
  }



  };



    const addPlaylist = async () => {
      if (!newName.trim()) return;
      await createPlaylist(newName, user.userId);
      setNewName("");
      loadPlaylists();
    };

  const toggleAsset = (asset) => {
    const exists = playlistItems.some((p) => p.id === asset.id);

    if (exists) {
      // 🔽 UPDATE UI FIRST (MOVE DOWN)
      setPlaylistItems((prev) =>
        prev.filter((p) => p.id !== asset.id)
      );

      // 🔄 SAVE TO DB (ASYNC, NON-BLOCKING)
      removeAssetFromPlaylist(activePlaylist.id, asset.id);
    } else {
      // 🔼 UPDATE UI FIRST (MOVE UP)
      setPlaylistItems((prev) => [
        ...prev,
        { ...asset, duration: 10 }
      ]);

      // 🔄 SAVE TO DB
      addAssetsToPlaylist(activePlaylist.id, [asset.id]);
    }
  };





    


    

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const newItems = arrayMove(
      playlistItems,
      playlistItems.findIndex(i => i.id === active.id),
      playlistItems.findIndex(i => i.id === over.id)
    );

    // 1️⃣ Update UI immediately
    setPlaylistItems(newItems);

    // 2️⃣ AUTO SAVE ORDER TO DB
    await savePlaylistOrder(
      activePlaylist.id,
      newItems.map(i => i.id)
    );
  };




    const handleDeletePlaylist = async (id) => {
      if (!window.confirm("Delete this playlist?")) return;
      await deletePlaylist(id);
      setActivePlaylist(null);
      loadPlaylists();
    };

    /* ================= PLAYLIST LIST ================= */
    const updateDuration = async (assetId, newDuration) => {
    setPlaylistItems((prev) =>
      prev.map((item) =>
        item.id === assetId
          ? { ...item, duration: newDuration }
          : item
      )
    );

    await saveAssetDuration(
      activePlaylist.id,
      assetId,
      newDuration
    );
  };


  const startPreview = () => {
    if (!playlistItems.length) return;
    setPreviewIndex(0);
    setPreviewOpen(true);
  };

  useEffect(() => {
    if (!previewOpen || !playlistItems.length) return;

    const current = playlistItems[previewIndex];
    let timer;

    if (current.file_type === "image") {
      timer = setTimeout(() => {
        setPreviewIndex(
          (prev) => (prev + 1) % playlistItems.length
        );
      }, (current.duration || 10) * 1000);
    }

    return () => clearTimeout(timer);
  }, [previewOpen, previewIndex, playlistItems]);




    

    if (!activePlaylist) {
      return (
        <div className="playlist-page">
          <h1>Available Playlists</h1>

          <div className="playlist-add">
            <input
              placeholder="Add a new playlist"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button onClick={addPlaylist}>ADD</button>
          </div>

          {playlists.map((p) => (
            <div
              key={p.id}
              className="playlist-row"
              onClick={() => openPlaylist(p)}
            >
              <span className="playlist-name">{p.name}</span>
              <button
                className="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePlaylist(p.id);
                }}
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      );
    }

    

  const unselectedItems = assets.filter(
    (a) => !playlistItems.some((p) => p.id === a.id)
  );

  const isSelected = (assetId) =>
    playlistItems.some((p) => p.id === assetId);









    /* ================= PLAYLIST DETAIL ================= */

    return (
      <div className="playlist-page">
        <h1>{activePlaylist.name}</h1>

  <div style={{ display: "flex", gap: "10px" }}>
    <button onClick={() => setActivePlaylist(null)}>← Back</button>
    <button onClick={startPreview}>▶ Preview</button>

    <button
    className={tickerConfig.enabled ? "selected" : ""}
    onClick={() => setTickerOpen(true)}
  >
    📢 Ticker
  </button>

  

  </div>



        <h3>Available Assets</h3>
        <div className="asset-row selected">
    <strong>📢 Ticker</strong>

    <div style={{ flex: 1, marginLeft: 10 }}>
      {tickerConfig.enabled
        ? "Ticker enabled"
        : "Ticker disabled"}
    </div>

    <input
      type="checkbox"
      checked={tickerConfig.enabled}
      onChange={async (e) => {
        const updated = {
          ...tickerConfig,
          enabled: e.target.checked
        };
        setTickerConfig(updated);
        await saveTickerConfig(activePlaylist.id, updated);
      }}
    />
  </div>

        

        {/* ===== SELECTED (DRAGGABLE) ===== */}
  <DndContext
    collisionDetection={closestCenter}
    onDragEnd={handleDragEnd}
  >
    <SortableContext
      items={playlistItems.map(p => p.id)}
      strategy={verticalListSortingStrategy}
    >
      <div className="asset-list selected-list">
        {playlistItems.map((a) => (
          <SortableAssetRow key={a.id} asset={a} selected={true}>
            <div className="asset-row selected">
              <img src={`http://localhost:5000${a.file_path}`} alt="" />

              <div className="asset-info">
                <span>{a.file_name}</span>
              </div>

              <input
                type="number"
                className="duration-input"
                min="1"
                value={a.duration ?? 10}
                onChange={(e) =>
                  updateDuration(a.id, Number(e.target.value))
                }
              />
              <span>sec</span>

            <input
    type="checkbox"
    checked={true}
    onPointerDown={(e) => e.stopPropagation()}
    onChange={() => toggleAsset(a)}
  />





            </div>
          </SortableAssetRow>
        ))}
      </div>
    </SortableContext>
  </DndContext>

  {/* ===== UNSELECTED (STATIC, ALWAYS BELOW) ===== */}
  <div className="asset-list unselected-list">
    {unselectedItems.map((a) => (
      <div key={a.id} className="asset-row">
        <img src={`http://localhost:5000${a.file_path}`} alt="" />

        <div className="asset-info">
          <span>{a.file_name}</span>
        </div>

        <input
    type="checkbox"
    checked={isSelected(a.id)}
    onPointerDown={(e) => e.stopPropagation()}   // 🔥 CRITICAL
    onChange={() => toggleAsset(a)}
  />


      </div>
    ))}
  </div>


  {previewOpen && (
  <div className="preview-overlay">
    {/* CLOSE BUTTON */}
    <button
      className="preview-close"
      onClick={() => setPreviewOpen(false)}
    >
      ✕
    </button>

    {/* STAGE */}
    <div className="preview-stage">
      {/* MEDIA */}
      <div className="preview-media-wrapper">
        {playlistItems[previewIndex].file_type === "image" ? (
          <img
            src={`http://localhost:5000${playlistItems[previewIndex].file_path}`}
            className="preview-media"
            alt=""
          />
        ) : (
          <video
            className="preview-media"
            src={`http://localhost:5000${playlistItems[previewIndex].file_path}`}
            autoPlay
            onEnded={() =>
              setPreviewIndex(
                (prev) => (prev + 1) % playlistItems.length
              )
            }
          />
        )}
      </div>

      {/* TICKER — ALWAYS AT BOTTOM */}
      {tickerConfig?.enabled &&
  tickerConfig?.messages?.some(m => m.trim()) && (

        <div
  className={`display-ticker 
  ${tickerConfig.speed || "medium"} 
  ${tickerConfig.direction === "right" ? "right" : "left"}
  ${tickerConfig.place === "portrait" ? "portrait" : "landscape"}
`}

  style={{
    height:
      tickerConfig.place === "landscape"
        ? tickerConfig.height || 60
        : "100%",
    width:
      tickerConfig.place === "portrait"
        ? tickerConfig.height || 60
        : "100%",
    fontSize: `${tickerConfig.fontSize || 20}px`,
    color: tickerConfig.color,
    background: tickerConfig.bgColor || "rgba(0,0,0,0.85)"
  }}
>

         <div className="display-ticker-track">
  {tickerConfig.messages
    .filter(m => m.trim())
    .map((msg, index) => (
      <div key={index} className="ticker-item">
        <span className="display-ticker-text">
          {msg}
        </span>
      </div>
    ))}
</div>


        </div>
      )}
    </div>
  </div>
)}





  {tickerOpen && (
    <div className="modal-overlay">
      <div className="modal">

        {/* HEADER */}
        <div className="modal-header">
          <h2>Add a ticker to your Screen</h2>
        </div>

        {/* BODY (SCROLLABLE) */}
        <div className="modal-body">

          <label>
            <input
              type="checkbox"
              checked={tickerConfig.enabled}
              onChange={(e) =>
                setTickerConfig({ ...tickerConfig, enabled: e.target.checked })
              }
            /> Enable Ticker
          </label>

          <h4>Scroll Direction</h4>
          <label>
            <input
              type="radio"
              checked={tickerConfig.direction === "left"}
              onChange={() =>
                setTickerConfig({ ...tickerConfig, direction: "left" })
              }
            /> Scroll left
          </label>
          <label style={{ marginLeft: 10 }}>
            <input
              type="radio"
              checked={tickerConfig.direction === "right"}
              onChange={() =>
                setTickerConfig({ ...tickerConfig, direction: "right" })
              }
            /> Scroll right
          </label>

          <h4>Optional CSS</h4>
          <input
            style={{ width: "100%" }}
            placeholder="e.g color:#eee;font-style:italic;"
            value={tickerConfig.css || ""}
            onChange={(e) =>
              setTickerConfig({ ...tickerConfig, css: e.target.value })
            }
          />
          <h4>Ticker Placement</h4>

<label>
  <input
    type="radio"
    checked={tickerConfig.place === "landscape"}
    onChange={() =>
      setTickerConfig({ ...tickerConfig, place: "landscape" })
    }
  />
  Landscape (Bottom)
</label>

<label style={{ marginLeft: 10 }}>
  <input
    type="radio"
    checked={tickerConfig.place === "portrait"}
    onChange={() =>
      setTickerConfig({ ...tickerConfig, place: "portrait" })
    }
  />
  Portrait (Right side)
</label>


          <h4>Ticker Speed</h4>
          {["slow", "medium", "fast"].map((s) => (
            <label key={s} style={{ display: "block" }}>
              <input
                type="radio"
                checked={tickerConfig.speed === s}
                onChange={() =>
                  setTickerConfig({ ...tickerConfig, speed: s })
                }
              /> {s}
            </label>
          ))}

          <h4>Ticker Height</h4>

  <label>
    <input
      type="radio"
      checked={tickerConfig.height === 40}
      onChange={() =>
        setTickerConfig({ ...tickerConfig, height: 40 })
      }
    /> Compact (40px)
  </label>

  <label style={{ marginLeft: 10 }}>
    <input
      type="radio"
      checked={tickerConfig.height === 80}
      onChange={() =>
        setTickerConfig({ ...tickerConfig, height: 80 })
      }
    /> Medium (80px)
  </label>

  <label style={{ marginLeft: 10 }}>
    <input
      type="radio"
      checked={tickerConfig.height === 120}
      onChange={() =>
        setTickerConfig({ ...tickerConfig, height: 120 })
      }
    /> Large (120px)
  </label>


          <h4>Font Size</h4>
  <input
    type="range"
    min="12"
    max="60"
    value={tickerConfig.fontSize}
    onChange={(e) =>
      setTickerConfig({
        ...tickerConfig,
        fontSize: Number(e.target.value)
      })
    }
  />
  <span style={{ marginLeft: 10 }}>
    {tickerConfig.fontSize}px
  </span>

  <h4>Text Color</h4>
  <ChromePicker
    color={tickerConfig.color}
    onChange={(color) =>
      setTickerConfig({
        ...tickerConfig,
        color: color.hex
      })
    }
  />

  <span style={{ marginLeft: 10 }}>
    {tickerConfig.color}
  </span>

  <h4>Ticker Background</h4>
  <ChromePicker
    color={tickerConfig.bgColor}
    onChange={(color) =>
      setTickerConfig({
        ...tickerConfig,
        bgColor: `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`
      })
    }
  />




          <h4>Ticker Messages</h4>

{tickerConfig.messages.map((msg, index) => (
  <div
    key={index}
    style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
  >
    <input
      type="text"
      value={msg}
      placeholder={`Message ${index + 1}`}
      style={{ flex: 1 }}
      onChange={(e) => {
        const updated = [...tickerConfig.messages];
        updated[index] = e.target.value;
        setTickerConfig({ ...tickerConfig, messages: updated });
      }}
    />

    {/* ❌ delete only if more than one */}
    {tickerConfig.messages.length > 1 && (
      <button
        onClick={() => {
          const updated = tickerConfig.messages.filter(
            (_, i) => i !== index
          );
          setTickerConfig({ ...tickerConfig, messages: updated });
        }}
      >
        ❌
      </button>
    )}
  </div>
))}

<button
  onClick={() =>
    setTickerConfig({
      ...tickerConfig,
      messages: [...tickerConfig.messages, ""]
    })
  }
>
  ➕ Add Message
</button>

        </div>

        {/* FOOTER (ALWAYS VISIBLE) */}
        <div className="modal-footer">
          <button onClick={() => setTickerOpen(false)}>Cancel</button>
          <button
            onClick={async () => {
              await saveTickerConfig(activePlaylist.id, tickerConfig);
              setTickerOpen(false);
            }}
          >
            SAVE
          </button>
        </div>

      </div>
    </div>
  )}




      

      </div>
    );
  }

  export default PlaylistsPage;
  