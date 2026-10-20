import React, { useEffect, useRef, useState } from "react";
import * as mapboxgl from "mapbox-gl/esm";
import "mapbox-gl/dist/mapbox-gl.css";
import landmarks from "../data/landmarks";

const Map = () => {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const markerRef = useRef([]);
  const accessToken = import.meta.env.VITE_MAPBOX_ACCESSTOKEN;

  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedLandmark, setSelectedLandmark] = useState(null);

  const filteredLandmarks = landmarks.filter((landmark) => {
    if (activeCategory === "all") return true;
    return landmark.category === activeCategory;
  });

  // Initialize Mapbox
  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      accessToken: accessToken,
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [8.6753, 9.082],
      zoom: 5,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-left");

    return () => {
      mapRef.current.remove();
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;

    markerRef.current.forEach((marker) => marker.remove());
    markerRef.current = [];

    filteredLandmarks.forEach((landmark) => {
      const isSelected = selectedLandmark?.id === landmark.id;

      const el = document.createElement("div");

      el.innerHTML = `
        <div style="
          width: ${isSelected ? "40px" : "32px"};
          height: ${isSelected ? "40px" : "32px"};
          background: ${landmark.color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: all 0.2s;
        ">
          <span style="
            transform: rotate(45deg);
            font-size: ${isSelected ? "18px" : "14px"};
          ">
            ${landmark.emoji}
          </span>
        </div>
      `;

      el.addEventListener("click", () => {
        setSelectedLandmark(landmark);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(landmark.coordinates)
        .addTo(mapRef.current);

      markerRef.current.push(marker);
    });
  }, [filteredLandmarks, selectedLandmark]);

  return (
    <div className="min-h-screen">
      {/* ================= HEADER ================= */}
      <header className="bg-[#367038]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 w-full p-4">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/20 p-2 rounded-lg text-xl">
              <p>🗺️</p>
            </div>

            <div>
              <h1 className="text-white font-bold text-lg">NigeriaExplore</h1>

              <p className="text-green-200 text-xs">
                Famous landmarks across Nigeria
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="w-full lg:w-[55%]">
            <label className="input flex items-center w-full">
              <svg
                className="h-[1em] opacity-50 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <g
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </g>
              </svg>

              <input
                type="search"
                placeholder="Search landmarks..."
                className="w-full"
              />
            </label>
          </div>

          {/* Landmark Count */}
          <div className="flex justify-center">
            <div className="flex gap-2 items-center bg-gray-700 py-1.5 px-4 rounded-full cursor-pointer">
              <p className="text-green-200 text-sm whitespace-nowrap">
                {filteredLandmarks.length}
              </p>

              <p className="text-green-200 text-sm whitespace-nowrap">
                landmarks
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ================= CATEGORY FILTERS ================= */}
      <div className="flex gap-2 p-3 overflow-x-auto border-b border-gray-200">
        {[
          { value: "all", label: "🌍 All" },
          { value: "historical", label: "🏛️ Historical" },
          { value: "nature", label: "🌿 Nature" },
          { value: "beach", label: "🏖️ Beach" },
          { value: "wildlife", label: "🦁 Wildlife" },
          { value: "cultural", label: "🕌 Cultural" },
        ].map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-4 py-1.5 rounded-full text-sm border whitespace-nowrap transition-colors shrink-0 ${
              activeCategory === cat.value
                ? "bg-green-100 border-green-600 text-green-700 font-medium"
                : "border-gray-300 text-gray-300 hover:bg-gray-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ================= MAP + SIDEBAR ================= */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-140px)]">
        {/* ================= MAP ================= */}
        <div className="w-full lg:w-[70%] h-[55vh] sm:h-[60vh] lg:h-[calc(100vh-140px)]">
          <div ref={mapContainerRef} className="h-full w-full"></div>
        </div>

        {/* ================= SIDEBAR ================= */}
        <div className="w-full lg:w-[30%] min-h-[45vh] lg:h-[calc(100vh-140px)] overflow-y-auto border-t lg:border-t-0 lg:border-l border-gray-200">
          {/* No landmark selected */}
          {!selectedLandmark && (
            <div>
              <div className="flex flex-col justify-center items-center text-center p-6">
                <div className="text-4xl mb-4">📍</div>

                <h3 className="text-gray-700 mb-2">Click any landmark</h3>

                <p className="text-sm text-gray-400 max-w-sm">
                  Click a pin on the map to learn about that landmark
                </p>
              </div>

              <div className="p-4">
                <p className="text-xs text-gray-400 uppercase mb-2">
                  All landmarks
                </p>

                <div className="space-y-2">
                  {filteredLandmarks.map((filter) => (
                    <div
                      key={filter.id}
                      onClick={() => {
                        setSelectedLandmark(filter);

                        mapRef.current.flyTo({
                          center: filter.coordinates,
                          zoom: 5,
                          duration: 1500,
                        });
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-xl shrink-0">{filter.emoji}</span>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {filter.name}
                        </p>

                        <p className="text-xs text-gray-400 truncate">
                          {filter.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= SELECTED LANDMARK ================= */}
          {selectedLandmark && (
            <div>
              {/* Landmark Hero */}
              <div
                className="h-36 sm:h-44 flex items-center justify-center text-6xl relative"
                style={{
                  background: `linear-gradient(135deg, ${selectedLandmark.color}, ${selectedLandmark.color}99)`,
                }}
              >
                {selectedLandmark.emoji}

                <span
                  className="absolute top-2 left-2 bg-white text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                  style={{ color: selectedLandmark.color }}
                >
                  {selectedLandmark.category}
                </span>

                <button
                  onClick={() => setSelectedLandmark(null)}
                  className="absolute top-2 right-2 bg-white/80 text-gray-600 w-7 h-7 rounded-full text-sm hover:bg-white"
                >
                  ✕
                </button>
              </div>

              {/* Landmark Information */}
              <div className="p-4">
                <p className="text-lg font-bold text-gray-800">
                  {selectedLandmark.name}
                </p>

                <div className="flex items-start gap-2 mt-2">
                  <span>📍</span>

                  <p className="text-sm text-gray-500">
                    {selectedLandmark.location}
                  </p>
                </div>

                <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                  {selectedLandmark.description}
                </p>

                <h3 className="text-sm font-semibold text-gray-700 mt-4 mb-2">
                  Quick facts
                </h3>

                <div className="mt-2">
                  {selectedLandmark.facts.map((fact, index) => (
                    <div key={index} className="flex items-start gap-2 mb-2">
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{
                          background: selectedLandmark.color,
                        }}
                      ></div>

                      <p className="text-xs text-gray-500 leading-relaxed">
                        {fact}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ================= BUTTONS ================= */}
              <div className="flex flex-col sm:flex-row items-stretch p-4 gap-3 border-t border-gray-200">
                <button
                  className="w-full sm:flex-1 py-2 px-4 rounded-lg cursor-pointer text-sm font-medium"
                  style={{
                    background: selectedLandmark.color,
                  }}
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${selectedLandmark.coordinates[1]},${selectedLandmark.coordinates[0]}`,
                      "_blank",
                    );
                  }}
                >
                  🗺 Directions
                </button>

                <button
                  className="w-full sm:w-auto border border-gray-300 text-sm text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-50"
                  onClick={() => {
                    setSelectedLandmark(null);

                    mapRef.current.flyTo({
                      center: [8.6753, 9.082],
                      zoom: 5,
                      duration: 1500,
                    });
                  }}
                >
                  ← Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;
