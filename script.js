document.addEventListener('DOMContentLoaded', () => {
    // --- Dummy Data (Replace with actual API fetches in a real app) ---
    const dummyRoutes = [
        { id: '1', name: 'Tagbilaran to Panglao', origin: 'Tagbilaran City', destination: 'Panglao', color: '#e74c3c',
            stops: [
                { name: 'Tagbilaran City', lat: 9.6556, lng: 123.8520, ETA: '5 min' },
                { name: 'Dao Terminal', lat: 9.6386, lng: 123.8572, ETA: '10 min' },
                { name: 'Dauis', lat: 9.6172, lng: 123.8506, ETA: '20 min' },
                { name: 'Panglao', lat: 9.5792, lng: 123.7490, ETA: '35 min' }
            ],
            busPositions: [
                { id: 'BUS001', lat: 9.6450, lng: 123.8500, heading: 'SW', crowding: 'moderate' }
            ]
        },
        { id: '2', name: 'Tagbilaran to Tubigon', origin: 'Tagbilaran City', destination: 'Tubigon', color: '#3498db',
            stops: [
                { name: 'Tagbilaran City', lat: 9.6556, lng: 123.8520, ETA: '5 min' },
                { name: 'Cortes', lat: 9.7012, lng: 123.8483, ETA: '15 min' },
                { name: 'Maribojoc', lat: 9.7431, lng: 123.8222, ETA: '25 min' },
                { name: 'Tubigon', lat: 9.9047, lng: 123.9606, ETA: '50 min' }
            ],
            busPositions: [
                { id: 'BUS002', lat: 9.7200, lng: 123.8400, heading: 'NW', crowding: 'low' }
            ]
        }
    ];

    const dummyBusStops = [
        { name: "Tagbilaran City", lat: 9.6556, lng: 123.8520, nextArrival: 'Route 1: 5 min', id: 'stop-tagb', routeId: '1' },
        { name: "Dao Terminal", lat: 9.6386, lng: 123.8572, nextArrival: 'Route 1: 10 min', id: 'stop-dao', routeId: '1' },
        { name: "Dauis", lat: 9.6172, lng: 123.8506, nextArrival: 'Route 1: 20 min', id: 'stop-dauis', routeId: '1' },
        { name: "Panglao", lat: 9.5792, lng: 123.7490, nextArrival: 'Route 1: 35 min', id: 'stop-panglao', routeId: '1' },
        { name: "Cortes", lat: 9.7012, lng: 123.8483, nextArrival: 'Route 2: 15 min', id: 'stop-cortes', routeId: '2' },
        { name: "Maribojoc", lat: 9.7431, lng: 123.8222, nextArrival: 'Route 2: 25 min', id: 'stop-maribojoc', routeId: '2' },
        { name: "Tubigon", lat: 9.9047, lng: 123.9606, nextArrival: 'Route 2: 50 min', id: 'stop-tubigon', routeId: '2' }
    ];

    // --- Map Integration (Leaflet) ---
    let map;
    let busMarkers = L.layerGroup();
    let routePolylines = L.layerGroup();
    let stopMarkers = L.layerGroup();
    let selectedRouteLayer;

    if (document.getElementById('busMap')) {
        // Centered on Bohol, zoomed out to show the island
        map = L.map('busMap').setView([9.849992, 124.143542], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        busMarkers.addTo(map);
        routePolylines.addTo(map);
        stopMarkers.addTo(map);

        const busIcon = L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/179/179294.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });

        const stopIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        // Populate route selector
        const routeSelector = document.getElementById('routeSelector');
        dummyRoutes.forEach(route => {
            const option = document.createElement('option');
            option.value = route.id;
            option.textContent = `Route ${route.id} - ${route.name}`;
            routeSelector.appendChild(option);
        });

        routeSelector.addEventListener('change', (e) => {
            const selectedRouteId = e.target.value;
            displayRouteOnMap(selectedRouteId);
        });

        document.getElementById('showAllBusesButton').addEventListener('click', () => {
            displayAllBusesOnMap();
        });

        function displayRouteOnMap(routeId) {
            routePolylines.clearLayers();
            busMarkers.clearLayers();
            stopMarkers.clearLayers();
            document.getElementById('route-details').style.display = 'none';

            if (!routeId) {
                map.setView([9.849992, 124.143542], 10); // Reset to Bohol
                return;
            }

            const route = dummyRoutes.find(r => r.id === routeId);
            if (route) {
                const latlngs = route.stops.map(stop => [stop.lat, stop.lng]);
                selectedRouteLayer = L.polyline(latlngs, { color: route.color, weight: 5, opacity: 0.7 }).addTo(routePolylines);
                map.fitBounds(selectedRouteLayer.getBounds().pad(0.1));

                route.stops.forEach(stop => {
                    L.marker([stop.lat, stop.lng], { icon: stopIcon })
                     .bindPopup(`<b>${stop.name}</b><br>Next: ${route.name} in ${stop.ETA}`)
                     .addTo(stopMarkers);
                });

                route.busPositions.forEach(bus => {
                    const marker = L.marker([bus.lat, bus.lng], { icon: busIcon })
                                    .bindPopup(`<b>Bus ${bus.id}</b><br>Crowding: ${bus.crowding}<br>Route: ${route.name}`)
                                    .addTo(busMarkers);
                });

                document.getElementById('selected-route-name').textContent = route.name;
                document.getElementById('route-origin').textContent = route.origin;
                document.getElementById('route-destination').textContent = route.destination;
                const stopsList = document.getElementById('route-stops-list');
                stopsList.innerHTML = '';
                route.stops.forEach(stop => {
                    const li = document.createElement('li');
                    li.textContent = `${stop.name} (ETA: ${stop.ETA})`;
                    stopsList.appendChild(li);
                });
                document.getElementById('route-details').style.display = 'block';
            }
        }

        function displayAllBusesOnMap() {
            routePolylines.clearLayers();
            busMarkers.clearLayers();
            stopMarkers.clearLayers();
            document.getElementById('route-details').style.display = 'none';
            routeSelector.value = '';

            let allLayers = [];

            dummyRoutes.forEach(route => {
                const latlngs = route.stops.map(stop => [stop.lat, stop.lng]);
                if (latlngs.length > 0) {
                    const polyline = L.polyline(latlngs, { color: route.color, weight: 5, opacity: 0.5 }).addTo(routePolylines);
                    allLayers.push(polyline);
                }

                route.stops.forEach(stop => {
                    const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon })
                     .bindPopup(`<b>${stop.name}</b><br>Next: ${route.name} in ${stop.ETA}`)
                     .addTo(stopMarkers);
                    allLayers.push(marker);
                });

                route.busPositions.forEach(bus => {
                    const marker = L.marker([bus.lat, bus.lng], { icon: busIcon })
                                    .bindPopup(`<b>Bus ${bus.id}</b><br>Crowding: ${bus.crowding}<br>Route: ${route.name}`)
                                    .addTo(busMarkers);
                    allLayers.push(marker);
                });
            });

            if (allLayers.length > 0) {
                const combinedFeatureGroup = L.featureGroup(allLayers);
                map.fitBounds(combinedFeatureGroup.getBounds().pad(0.1));
            } else {
                map.setView([9.849992, 124.143542], 10);
            }
        }

        // Show all buses by default
        displayAllBusesOnMap();

        // Download schedule button in route details (if present)
        const downloadBtn = document.querySelector('.download-schedule-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const selectedRouteId = routeSelector.value;
                if (selectedRouteId) {
                    alert(`Request sent to download schedule for Route ${selectedRouteId}.`);
                } else {
                    alert('Please select a route first.');
                }
            });
        }
    }
});
