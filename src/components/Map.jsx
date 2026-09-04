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

  useEffect(() => {
    if (!mapRef.current) return;
    markerRef.current.forEach((marker) => marker.remove());
    markerRef.current = [];
    filteredLandmarks.forEach((landmark) => {
      const isSelected = selectedLandmark?.id === landmark.id;
      const el = document.createElement("div");

      el.innerHTML = `<div style="
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
          <span style="transform: rotate(45deg); font-size: ${isSelected ? "18px" : "14px"}">
            ${landmark.emoji}
          </span>
        </div>`;

      el.addEventListener("click", () => {
        setSelectedLandmark(landmark);
      });
      mapRef.current.flyTo({
        center: landmark.coordinates,
        zoom: 5,
        duration: 1500,
      });
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(landmark.coordinates)
        .addTo(mapRef.current);

      markerRef.current.push(marker);
    });
  }, [filteredLandmarks, selectedLandmark]);

  return (
    <div>
      <header className="bg-[#367038]">
        <div className="flex items-center justify-between w-full p-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg text-xl">
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
          <div className="w-[70%]">
            <label className="input flex items-center w-full">
              <svg
                className="h-[1em] opacity-50"
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
                required
                placeholder="Search"
                className="w-full"
              />
            </label>
          </div>

          {/* Right text */}
          <div className="flex gap-2 items-center bg-gray-700 py-1.5 px-4 rounded-full cursor-pointer">
            <p className="text-green-200 text-sm whitespace-nowrap">
              {filteredLandmarks.length}
            </p>
            <p className="text-green-200 text-sm whitespace-nowrap">
              landmarks
            </p>
          </div>
        </div>
      </header>
      <div className="flex gap-2 p-3 overflow-x-auto">
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
            className={`px-4 py-1.5 rounded-full text-sm border whitespace-nowrap transition-colors
              ${
                activeCategory === cat.value
                  ? "bg-green-100 border-green-600 text-green-700 font-medium"
                  : "border-gray-300 text-gray-300 hover:bg-gray-50"
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="flex">
        <div className="w-[70%]">
          <div ref={mapContainerRef} style={{ height: "100vh" }}></div>
        </div>
        <div className="w-[30%]"></div>
      </div>
    </div>
  );
};

export default Map;
