// Global variables
let map;
let userLocationMarker = null;
let userLocation = null;
let currentRoute = null;
let routeLayers = null;
let stopMarkers = null;

// Define destinations for search
const destinations = [
    // Panglao Route
    { name: 'Panglao', type: 'destination', routeId: 'tagbilaran-panglao' },
    { name: 'Island City Mall', type: 'stop', routeId: 'tagbilaran-panglao' },
    { name: 'Integrated Bus Terminal', type: 'origin', routeId: 'tagbilaran-panglao' },
    { name: 'Bohol Tarsier Conservation Area', type: 'landmark', routeId: 'tagbilaran-panglao' },
    { name: 'Bilar Man-Made Forest', type: 'landmark', routeId: 'tagbilaran-panglao' },
    { name: 'Chocolate Hills Complex', type: 'landmark', routeId: 'tagbilaran-panglao' },
    
    // Tubigon Route
    { name: 'Tubigon', type: 'destination', routeId: 'tagbilaran-tubigon' },
    { name: 'President Carlos P. Garcia Park', type: 'landmark', routeId: 'tagbilaran-tubigon' },
    { name: 'Baranggay Mangga Public Market', type: 'stop', routeId: 'tagbilaran-tubigon' },
    { name: 'Abatan River Community Life Tour', type: 'landmark', routeId: 'tagbilaran-tubigon' },
    { name: 'Maribojoc Public Market', type: 'stop', routeId: 'tagbilaran-tubigon' },
    { name: 'Basdacu White Sand', type: 'landmark', routeId: 'tagbilaran-tubigon' },
    { name: 'Loon Public Market', type: 'stop', routeId: 'tagbilaran-tubigon' },
    { name: 'Bohol Island State University', type: 'landmark', routeId: 'tagbilaran-tubigon' },
    { name: 'Dreamers Coffee Cahayag Tubigon', type: 'landmark', routeId: 'tagbilaran-tubigon' },
    { name: 'Tubigon Public Market', type: 'destination', routeId: 'tagbilaran-tubigon' },
    { id: '8', name: 'Panglao Town Proper', type: 'stop', routeId: '1' },
    { id: '9', name: 'Alona Beach', type: 'stop', routeId: '1' },
    { id: '10', name: 'Tubigon Port', type: 'stop', routeId: '2' },
    { id: '11', name: 'Tubigon Town Proper', type: 'stop', routeId: '2' }
];

// Custom control for location button
L.Control.LocationControl = L.Control.extend({
    onAdd: function(map) {
        const container = L.DomUtil.create('div', 'leaflet-control-location');
        const link = L.DomUtil.create('a', '', container);
        link.href = '#';
        link.title = 'Locate me';
        
        L.DomEvent
            .on(link, 'click', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.preventDefault)
            .on(link, 'click', this._locate, this);
            
        return container;
    },
    
    _locate: function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    userLocation = { lat: latitude, lng: longitude };
                    this._updateUserLocation(userLocation);
                    if (currentRoute) {
                        updateRouteWithUserLocation(currentRoute);
                    }
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Unable to retrieve your location. Please ensure location services are enabled.');
                },
                { enableHighAccuracy: true }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    },
    
    _updateUserLocation: function(location) {
        if (!userLocationMarker) {
            userLocationMarker = L.circleMarker([location.lat, location.lng], {
                radius: 8,
                fillColor: '#4285f4',
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 1,
                className: 'user-location-marker'
            }).addTo(map);
            
            userLocationMarker.bindPopup('Your Location').openPopup();
        } else {
            userLocationMarker.setLatLng([location.lat, location.lng]);
        }
        
        map.setView([location.lat, location.lng], 15);
    }
});

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the map
    map = L.map('busMap').setView([9.6425, 123.85], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ' OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Add location control
    new L.Control.LocationControl({ position: 'topleft' }).addTo(map);
    
    // Initialize route layers
    routeLayers = L.layerGroup().addTo(map);
    stopMarkers = L.layerGroup().addTo(map);
    
    // Initialize search functionality
    initSearch();
    
    // Request location access on page load
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                userLocation = { lat: latitude, lng: longitude };
                // Update user location marker
                if (userLocationMarker) {
                    userLocationMarker.setLatLng([userLocation.lat, userLocation.lng]);
                } else {
                    userLocationMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
                        radius: 8,
                        fillColor: '#4285f4',
                        color: '#fff',
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 1,
                        className: 'user-location-marker'
                    }).addTo(map);
                    userLocationMarker.bindPopup('Your Location').openPopup();
                }
                
                // If a route is already selected, update it with the new location
                if (currentRoute) {
                    updateRouteWithUserLocation(currentRoute);
                }
            },
            (error) => {
                console.log('Location access denied or not available');
                // If location is denied, still show the default route if one is selected
                if (currentRoute) {
                    showRoute(currentRoute.id);
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }

    // Route data with accurate coordinates
    const routes = [
        { 
            id: '1', 
            name: 'Tagbilaran to Panglao', 
            color: '#e74c3c',
            stops: [
                // Island City Mall and Tagbilaran Integrated Bus Terminal are very close to each other
                { name: 'Island City Mall', lat: 9.65496690313405, lng: 123.86972976392552, type: 'departure' },
                { name: 'Tagbilaran Integrated Bus Terminal', lat: 9.65508395817522, lng: 123.87153193587336, type: 'stop' },
                { name: 'Dauis Church (Roadside Stop)', lat: 9.6265, lng: 123.8648, type: 'stop' },
                { name: 'Panglao Town Proper', lat: 9.550670149463727, lng: 123.77227851887896, type: 'destination' }
            ]
        },
        { 
            id: '2', 
            name: 'Tagbilaran to Tubigon', 
            color: '#3498db',
            stops: [
                { name: 'Island City Mall', lat: 9.6392, lng: 123.8583 },
                { name: 'Integrated Bus Terminal', lat: 9.6425, lng: 123.85 },
                { name: 'President Carlos P. Garcia Park', lat: 9.6599486, lng: 123.8583126, isLandmark: true },
                { name: 'Baranggay Mangga Public Market', lat: 9.6935372, lng: 123.8635565, isBusStop: true },
                { name: 'Abatan River Community Life Tour', lat: 9.7148202, lng: 123.8741641, isLandmark: true },
                { name: 'Maribojoc Public Market', lat: 9.7422900, lng: 123.8439659, isBusStop: true },
                { name: 'Basdacu White Sand', lat: 9.7886230, lng: 123.7855161, isLandmark: true },
                { name: 'Loon Public Market', lat: 9.8111236, lng: 123.8009762, isBusStop: true },
                { name: 'Bohol Island State University', lat: 9.8954041, lng: 123.8825387, isLandmark: true },
                { name: 'Dreamers Coffee Cahayag Tubigon', lat: 9.9184680, lng: 123.9280579, isLandmark: true },
                { name: 'Tubigon Public Market', lat: 9.9526917, lng: 123.9615936, isDestination: true }
            ]
        }
    ];

    // Custom icons
    const icons = {
        departure: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
        }),
        destination: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
        }),
        landmark: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
        }),
        stop: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
        })
    };

    // Function to get icon by type
    function getIcon(type) {
        return icons[type] || icons.stop;
    }

    // Layer groups for routes and markers are now defined at the top of the document ready function

    // Function to get route from OSRM
    async function getRoute(route) {
        const coordinates = route.stops.map(stop => `${stop.lng},${stop.lat}`).join(';');
        const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.routes && data.routes[0]) {
                const routeData = data.routes[0];
                return {
                    coordinates: routeData.geometry.coordinates.map(coord => [coord[1], coord[0]]),
                    distance: (routeData.distance / 1000).toFixed(1) + ' km',
                    duration: Math.ceil(routeData.duration / 60) + ' min'
                };
            }
        } catch (error) {
            console.error('Error fetching route:', error);
            // Fallback to straight line if OSRM fails
            return {
                coordinates: route.stops.map(stop => [stop.lat, stop.lng]),
                distance: 'N/A',
                duration: 'N/A'
            };
        }
    }

    // Function to update route with user's current location
    async function updateRouteWithUserLocation(route) {
        if (!userLocation) return;
        
        try {
            // Create a temporary route that includes user's location
            const tempRoute = {
                ...route,
                stops: [
                    { name: 'Your Location', lat: userLocation.lat, lng: userLocation.lng, type: 'departure' },
                    ...route.stops
                ]
            };
            
            // Get route from OSRM
            const routeData = await getRoute(tempRoute);
            
            // Clear previous route
            routeLayers.clearLayers();
            stopMarkers.clearLayers();
            
            // Create a polyline for the route
            const polyline = L.polyline(routeData.coordinates, {
                color: route.color, 
                weight: 5, 
                opacity: 0.7,
                smoothFactor: 1
            }).addTo(routeLayers);
            
            // Add user location marker
            if (userLocationMarker) {
                stopMarkers.addLayer(userLocationMarker);
            }
            
            // Add markers for each stop (excluding the temporary user location)
            route.stops.forEach(stop => {
                L.marker([stop.lat, stop.lng], {
                    icon: getIcon(stop.type)
                }).addTo(stopMarkers)
                .bindPopup(`<b>${stop.name}</b><br>${route.name}`);
            });
            
            // Update route details with distance and duration
            route.distance = routeData.distance;
            route.duration = routeData.duration;
            updateRouteDetails(route);
            
            // Fit map to show the route with some padding
            map.fitBounds(polyline.getBounds().pad(0.2));
            
        } catch (error) {
            console.error('Error updating route with user location:', error);
            // Fallback to regular route if there's an error
            showRoute(route.id);
        }
    }
    
    // Function to show a specific route
    function showRoute(routeId) {
        // Clear existing layers
        routeLayers.clearLayers();
        stopMarkers.clearLayers();
        
        // Hide route details initially
        document.getElementById('route-details').style.display = 'none';
        
        // If no route ID provided, just clear the map
        if (!routeId) {
            const distanceElement = document.getElementById('route-distance') || document.createElement('div');
            distanceElement.id = 'route-distance';
            distanceElement.innerHTML = `<strong>Distance:</strong> ${route.distance} | <strong>Duration:</strong> ${route.duration || 'N/A'}`;
            if (!document.getElementById('route-distance')) {
                detailsDiv.insertBefore(distanceElement, stopsList);
            } else {
                distanceElement.textContent = `Distance: ${route.distance} | Duration: ${route.duration || 'N/A'}`;
            }
        }
        
        stopsList.innerHTML = '';
        route.stops.forEach((stop, index) => {
            const li = document.createElement('li');
            li.className = `stop-item ${stop.type}`;
            li.innerHTML = `
                <span class="stop-name">${stop.name}</span>
                <span class="stop-type">${stop.type.charAt(0).toUpperCase() + stop.type.slice(1)}</span>
            `;
            stopsList.appendChild(li);
        });
        
        detailsDiv.style.display = 'block';
    }
    
    // Function to show all routes
    function showAllRoutes() {
        routeLayers.clearLayers();
        stopMarkers.clearLayers();
        document.getElementById('route-details').style.display = 'none';
        
        routes.forEach(route => {
            const latlngs = route.stops.map(stop => [stop.lat, stop.lng]);
            L.polyline(latlngs, {
                color: route.color,
                weight: 3,
                opacity: 0.5
            }).addTo(routeLayers);
            
            route.stops.forEach(stop => {
                L.marker([stop.lat, stop.lng], {
                    icon: getIcon(stop.type),
                    opacity: 0.8
                }).addTo(stopMarkers);
            });
        });
        
        // Fit map to show all routes
        const bounds = L.latLngBounds(
            routes.flatMap(route => route.stops.map(stop => [stop.lat, stop.lng]))
        );
        map.fitBounds(bounds.pad(0.2));
    }
    
    // Initialize search functionality
    const searchInput = document.getElementById('routeStopSearchInput');
    const searchButton = document.getElementById('searchRouteStopButton');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    // Show popular destinations when search is focused
    searchInput.addEventListener('focus', function() {
        showSuggestions('');
    });

    // Handle search input
    searchInput.addEventListener('input', function() {
        showSuggestions(this.value);
    });

    // Handle search button click
    searchButton.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (!query) return;
        
        // Find exact match first
        const destination = destinations.find(dest => 
            dest.name.toLowerCase() === query.toLowerCase()
        );
        
        if (destination) {
            showRoute(destination.routeId);
            document.getElementById('map-routes').scrollIntoView({ behavior: 'smooth' });
        } else {
            // If no exact match, try to find a partial match
            const partialMatch = destinations.find(dest => 
                dest.name.toLowerCase().includes(query.toLowerCase())
            );
            
            if (!query) {
                // Show popular destinations when input is empty
                const popularDestinations = destinations.filter(dest => 
                    ['Panglao', 'Tubigon', 'Dauis'].includes(dest.name)
                );
                
                if (popularDestinations.length > 0) {
                    const heading = document.createElement('div');
                    heading.className = 'suggestion-heading';
                    heading.textContent = 'Popular Destinations';
                    suggestionsList.appendChild(heading);
                    
                    popularDestinations.forEach(dest => {
                        const item = createSuggestionItem(dest);
                        suggestionsList.appendChild(item);
                    });
                }
            } else {
                // Filter destinations based on search query
                const filtered = destinations.filter(dest => 
                    dest.name.toLowerCase().includes(query.toLowerCase())
                );
                
                if (filtered.length > 0) {
                    filtered.forEach(dest => {
                        const item = createSuggestionItem(dest);
                        suggestionsList.appendChild(item);
                    });
                } else {
                    const noResults = document.createElement('div');
                    noResults.className = 'suggestion-item no-results';
                    noResults.textContent = 'No destinations found';
                    suggestionsList.appendChild(noResults);
                }
            }
            
            // Update suggestions container
            suggestionsContainer.innerHTML = '';
    
    // If user location is available, use it as the starting point
    if (userLocation) {
        updateRouteWithUserLocation(route);
    } else {
        // Otherwise, show the default route
        getRoute(route);
    }
    
    // Update route details
    updateRouteDetails(route);
    
    // Show route details
    document.getElementById('route-details').style.display = 'block';
    
    // Scroll to map section
    document.getElementById('map-routes').scrollIntoView({ behavior: 'smooth' });
}

// Function to update route details in the UI
function updateRouteDetails(route) {
    const detailsDiv = document.getElementById('route-details');
    const stopsList = document.getElementById('route-stops-list');
    
    document.getElementById('selected-route-name').textContent = route.name;
    document.getElementById('route-origin').textContent = route.stops[0].name;
    document.getElementById('route-destination').textContent = route.stops[route.stops.length - 1].name;
    
    // Update distance and duration if available
    if (route.distance) {
        const distanceElement = document.getElementById('route-distance') || document.createElement('div');
        distanceElement.id = 'route-distance';
        distanceElement.innerHTML = `<strong>Distance:</strong> ${route.distance} | <strong>Duration:</strong> ${route.duration || 'N/A'}`;
        if (!document.getElementById('route-distance')) {
            detailsDiv.insertBefore(distanceElement, stopsList);
        } else {
            distanceElement.textContent = `Distance: ${route.distance} | Duration: ${route.duration || 'N/A'}`;
        }
    }
    
    stopsList.innerHTML = '';
    route.stops.forEach((stop, index) => {
        const li = document.createElement('li');
        li.className = `stop-item ${stop.type}`;
        li.innerHTML = `
            <span class="stop-name">${stop.name}</span>
            <span class="stop-type">${stop.type.charAt(0).toUpperCase() + stop.type.slice(1)}</span>
        `;
        stopsList.appendChild(li);
    });
    
    detailsDiv.style.display = 'block';
}



// Initialize search functionality
const searchInput = document.getElementById('routeStopSearchInput');
const searchButton = document.getElementById('searchRouteStopButton');
const searchSuggestions = document.getElementById('searchSuggestions');

// Show popular destinations when search is focused
searchInput.addEventListener('focus', function() {
    showSuggestions('');
});