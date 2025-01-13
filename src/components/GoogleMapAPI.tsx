import { useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

export default function GoogleMapAPI() {
  const markerPosition = {
    lat: 37.7749,
    lng: -122.4194,
  };
  const [selectedMarker, setSelectedMarker] = useState(markerPosition);

  const mapContainerStyle = {
    width: "300px",
    height: "300px",
  };

  const onClickMarker = () => setSelectedMarker(markerPosition);
  const onCloseClick = () => setSelectedMarker(markerPosition);

  return (
    <LoadScript googleMapsApiKey="TU_API_KEY">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={markerPosition}
        zoom={12}
      >
        <Marker position={markerPosition} onClick={onClickMarker} />
        {selectedMarker && (
          <InfoWindow position={selectedMarker} onCloseClick={onCloseClick}>
            <div>
              <h4>Ubicación</h4>
              <p>Este es un marcador en San Francisco.</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}
