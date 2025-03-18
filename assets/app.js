  const apiKey = "5b3ce3597851110001cf62481e8742d73f854911923ceb0967d16137";

    // Fungsi untuk mencari lokasi dan mendapatkan koordinat
    async function fetchRoute(location) {
      const apiUrl = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(location)}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Accept: "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    }

    // Fungsi untuk mendapatkan koordinat dari nama lokasi
    async function getCoordinates(location) {
      const data = await fetchRoute(location);
      if (data.features && data.features.length > 0) {
        const exactMatch = data.features.find(
          (feature) =>
            feature.properties.name.toLowerCase() === location.toLowerCase()
        );

        if (exactMatch) {
          console.log("Exact Match Found:", exactMatch.properties.name);
          console.log("Coordinates:", exactMatch.geometry.coordinates);
          return exactMatch.geometry.coordinates; // [longitude, latitude]
        } else {
          console.log("No exact match found for:", location);
          return null;
        }
      } else {
        console.log("No results found for:", location);
        return null;
      }
    }

    // Fungsi untuk mengambil rute dan menampilkan di peta
    async function fetchRouteMap(coordinates) {
      const apiUrl = "https://api.openrouteservice.org/v2/directions/driving-car";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Accept: "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
          "Content-Type": "application/json",
          Authorization: apiKey,
        },
        body: JSON.stringify({
          coordinates: coordinates,
          instructions: false, 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    }

    // Fungsi untuk menampilkan rute di peta
    function displayRouteOnMap(route, coordinates) {
      const map = L.map("map").setView([coordinates[0][1], coordinates[0][0]], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      coordinates.forEach((loc, index) => {
        L.marker([loc[1], loc[0]])
          .addTo(map)
          .bindPopup(`Location ${index + 1}`)
          .openPopup();
      });

      const routeCoordinates = route.features[0].geometry.coordinates;
      const latLngs = routeCoordinates.map((coord) => [coord[1], coord[0]]);

      L.polyline(latLngs, { color: "blue", weight: 5 }).addTo(map);

      map.fitBounds(latLngs);
    }

    // Event listener untuk tombol
    document.getElementById("btn").addEventListener("click", async function () {
      const location1 = document.getElementById("location1").value;
      const location2 = document.getElementById("location2").value;

      if (location1 && location2) {
        try {
          // Dapatkan koordinat untuk kedua lokasi
          const coordinates1 = await getCoordinates(location1);
          const coordinates2 = await getCoordinates(location2);

          if (coordinates1 && coordinates2) {
            // Perbarui requestData.locations dengan koordinat baru
            const updatedLocations = [coordinates1, coordinates2];

            // Dapatkan rute dan tampilkan di peta
            const routeData = await fetchRouteMap(updatedLocations);
            displayRouteOnMap(routeData, updatedLocations);
          } else {
            console.log("Unable to get coordinates for one or both locations.");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      } else {
        console.log("Please enter both locations.");
      }
    });