"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

interface mapData {
  _id: string;
  name: string;
  lat: number;
  lon: number;
  premium: number;
  unleaded: number;
  diesel: number;
}

export default function Map() {
  // Position of the map marker  
  const [position, setPosition] = useState<[number, number]>([14.63494394304946, 120.99652638211907]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [gasData, setGasData] = useState<mapData[]>([]);
  const [kilometerRadius, setKilometerRadius] = useState("");
  const [filteredData, setFilteredData] = useState<mapData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/mapdata");
        const json = await res.json();
        setGasData(json);
        setFilteredData(json);
      } catch (err) {
        console.error("Error loading map data:", err);
      }
    };
    
    fetchData();
    console.log ("Gas prices are: " + gasData);
  }, []);

  // Handle on change of longitude input
  const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lng = parseFloat(e.target.value);
    if (!isNaN(lng)) setPosition([position[0], lng]);
  };

  // Handle on change of latitude input
  const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lat = parseFloat(e.target.value);
    if (!isNaN(lat)) setPosition([lat, position[1]]);
  };

  // Handle on change of kilometer radius input
  const handleKilometerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const km = e.target.value;
    setKilometerRadius(km);

    const radius = parseFloat(km);
    if (isNaN(radius)) return;

    const filtered = gasData.filter(station => {
      const distance = getDistance(
        position[0], position[1],
        station.lat, station.lon
      );
      return distance <= radius;
    });

    setFilteredData(filtered);
  };


  // Calculate kilometer radius distance
  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }


  // Refreshes map on change
  function RecenterMap({ position }: { position: [number, number] }) {
    const map = useMap();
  
    useEffect(() => {
      map.setView(position);
    }, [position, map]);
  
    return null;
  }

  // Custom image of the map marker
  const customIcon = new L.Icon({
    iconUrl: "/map-marker.png",
    iconSize: [18, 28.5],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });

  // Nominatim Search
  const searchAddress = async (searchText: string) => {
    if (!searchText) {
      setResults([]);
      return;
    }
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Error fetching Nominatim:", err);
    }
  };

  return (
    <div>
      <div>
        <input
          className='text-black p-1 border border-black w-full'
          placeholder='Where are you now?'
          type='text'
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            searchAddress(e.target.value);
          }}
        />
        {results.length > 0 && (
          <ul className="bg-white text-black border max-h-40 overflow-y-auto mt-1">
            {results.map((place, index) => (
              <li
                key={index}
                className="p-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                  setPosition([parseFloat(place.lat), parseFloat(place.lon)]);
                  setQuery(place.display_name);
                  setResults([]);
                }}
              >
                {place.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className='flex flex-row'>
        <input
          type="number"
          className='text-black p-1 border border-black'
          placeholder='Latitude'
          value={position[0]}
          onChange={handleLatitudeChange}
        />
        <input
          type="number"
          className='text-black p-1 border border-black'
          placeholder='Longitude'
          value={position[1]}
          onChange={handleLongitudeChange}
        />
        <input
          type="number"
          className='text-black p-1 border border-black'
          placeholder='kilometer radius'
          value={kilometerRadius[0]}
          onChange={handleKilometerChange}
        />
        <div className="block relative">
          <div className="dropdown-content">
            <p>Hello World!</p>
          </div>
        </div>
      </div>
      <MapContainer center={position} zoom={13} scrollWheelZoom={true} className="w-[500px] h-[500px]">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredData.map((data) => (
          <div key={data._id}>
            {data._id}
            <Marker position={[data.lat, data.lon]} icon={customIcon}>
              <Popup>
                Name: {data.name}
                <br></br>
                Latitude: {data.lat}
                <br></br>
                Longitude: {data.lon}
                <br></br>
                Premium: {data.premium}
                <br></br>
                Unleaded: {data.unleaded}
                <br></br>
                Diesel: {data.diesel}
              </Popup>
            </Marker>
          </div>
        ))}
        <RecenterMap position={position} />
      </MapContainer>
    </div>
  );
}
