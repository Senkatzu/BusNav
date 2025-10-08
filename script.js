document.addEventListener('DOMContentLoaded', () => {
    const mainNav = document.querySelector('.main-nav');
    const hamburger = document.querySelector('.hamburger');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.main-nav a');

    // --- Dummy Data (Replace with actual API fetches in a real app) ---
    const dummyRoutes = [
        { id: '101', name: 'Downtown Express', origin: 'Main St & 1st Ave', destination: 'Waterfront Park', color: '#e74c3c',
            stops: [
                { name: 'Main St & 1st Ave', lat: 34.0522, lng: -118.2437, ETA: '5 min' },
                { name: 'Central Plaza', lat: 34.055, lng: -118.25, ETA: '10 min' },
                { name: 'City Hall', lat: 34.06, lng: -118.26, ETA: '15 min' },
                { name: 'Financial District', lat: 34.065, lng: -118.27, ETA: '20 min' },
                { name: 'Waterfront Park', lat: 34.07, lng: -118.28, ETA: '25 min' }
            ],
            busPositions: [ // Simulated bus positions for Route 101
                { id: 'BUS001', lat: 34.053, lng: -118.245, heading: 'NW', crowding: 'moderate' },
                { id: 'BUS002', lat: 34.062, lng: -118.263, heading: 'NW', crowding: 'low' }
            ]
        },
        { id: '202', name: 'University Link', origin: 'Campus North', destination: 'Metro Station East', color: '#3498db',
            stops: [
                { name: 'Campus North', lat: 34.07, lng: -118.27, ETA: '3 min' },
                { name: 'University Library', lat: 34.075, lng: -118.28, ETA: '8 min' },
                { name: 'Student Union', lat: 34.08, lng: -118.29, ETA: '13 min' },
                { name: 'Residential Towers', lat: 34.085, lng: -118.30, ETA: '18 min' },
                { name: 'Metro Station East', lat: 34.09, lng: -118.31, ETA: '23 min' }
            ],
            busPositions: [ // Simulated bus positions for Route 202
                { id: 'BUS003', lat: 34.073, lng: -118.275, heading: 'W', crowding: 'high' }
            ]
        },
        { id: '303', name: 'Coastal Scenic', origin: 'Pier 32', destination: 'Sunset Beach', color: '#2ecc71',
            stops: [
                { name: 'Pier 32', lat: 33.99, lng: -118.49, ETA: '7 min' },
                { name: 'Marina Entrance', lat: 34.00, lng: -118.50, ETA: '12 min' },
                { name: 'Ocean View Point', lat: 34.01, lng: -118.51, ETA: '17 min' },
                { name: 'Sunset Beach', lat: 34.02, lng: -118.52, ETA: '22 min' }
            ],
            busPositions: [
                { id: 'BUS004', lat: 33.995, lng: -118.495, heading: 'N', crowding: 'low' }
            ]
        }
    ];

    const dummyBusStops = [ // For AR simulation and quick search
        { name: "Main St & 1st Ave", lat: 34.0522, lng: -118.2437, nextArrival: 'Route 101: 5 min', id: 'stop-main', routeId: '101' },
        { name: "Central Plaza", lat: 34.055, lng: -118.25, nextArrival: 'Route 101: 10 min', id: 'stop-central', routeId: '101' },
        { name: "University Library", lat: 34.075, lng: -118.28, nextArrival: 'Route 202: 8 min', id: 'stop-uni', routeId: '202' },
        { name: "Pier 32", lat: 33.99, lng: -118.49, nextArrival: 'Route 303: 7 min', id: 'stop-pier', routeId: '303' },
        { name: "New Street Station", lat: 34.04, lng: -118.23, nextArrival: 'Route 101: 12 min', id: 'stop-new', routeId: '101' }, // An extra stop
        { name: "Tech Hub", lat: 34.03, lng: -118.26, nextArrival: 'Route 202: 15 min', id: 'stop-tech', routeId: '202' }
    ];

    // --- UI/UX Enhancements ---

    // Hamburger Menu Toggle
    hamburger.addEventListener('click', () => {
        mainNav.classList.toggle('active');
    });

    // Smooth Scrolling & Active Nav Links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            mainNav.classList.remove('active'); // Close mobile menu
            const targetId = this.getAttribute('href');
            if (targetId === '#home') { // Special handling for home to scroll to top
                 window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - header.offsetHeight, // Offset by header height
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    const header = document.querySelector('header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        // Highlight active nav link based on scroll position
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - header.offsetHeight;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
            // Special handling for #home when at the very top
            if (window.scrollY < sections[0].offsetTop - header.offsetHeight / 2) {
                 document.querySelector('nav a[href="#home"]').classList.add('active');
            }
        });
    });

    // --- Modals Logic ---
    const feedbackModal = document.getElementById('feedbackModal');
    const journeyPlanModal = document.getElementById('journeyPlanModal');
    const closeButtons = document.querySelectorAll('.modal .close-button');
    const feedbackModalBtns = document.querySelectorAll('.feedback-modal-btn');
    const journeyPlanForm = document.getElementById('journeyPlanForm');
    const journeyPlanModalBtn = document.getElementById('plan-journey');

    function openModal(modalId, title = '', description = '') {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            const modalTitle = modal.querySelector('#modal-title');
            const modalDesc = modal.querySelector('#modal-description');
            if (modalTitle) modalTitle.textContent = title;
            if (modalDesc) modalDesc.textContent = description;
            document.body.style.overflow = 'hidden'; // Prevent scrolling background
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            closeModal(e.target.closest('.modal').id);
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === feedbackModal) closeModal('feedbackModal');
        if (e.target === journeyPlanModal) closeModal('journeyPlanModal');
    });


    // --- Quick Actions ---
    const findMyBusBtn = document.getElementById('find-my-bus');
    const quickReportBtn = document.getElementById('report-quick');
    const viewSchedulesBtn = document.getElementById('view-schedules');

    findMyBusBtn.addEventListener('click', () => {
        // Scroll to map and potentially center on user's location (if available)
        alert('Finding nearby buses & stops... (Simulated: Scrolling to map)');
        document.getElementById('map-routes').scrollIntoView({ behavior: 'smooth', block: 'start', offsetTop: header.offsetHeight });
        // In real app: map.locate({setView: true, maxZoom: 16});
    });

    journeyPlanModalBtn.addEventListener('click', () => {
        openModal('journeyPlanModal');
        // Pre-fill if geolocation available?
        document.getElementById('startLocation').value = "My Current Location";
    });

    quickReportBtn.addEventListener('click', () => {
        openModal('feedbackModal', 'Quick Report', 'Select an option to provide feedback.');
        // Maybe make a simpler form pop up instantly
    });

    viewSchedulesBtn.addEventListener('click', () => {
        alert('Viewing schedules... (Simulated: Scrolling to map controls for route selection)');
        document.getElementById('map-routes').scrollIntoView({ behavior: 'smooth', block: 'start', offsetTop: header.offsetHeight });
        document.getElementById('routeSelector').focus();
    });

    // --- Map Integration (Leaflet) ---
    let map;
    let busMarkers = L.layerGroup(); // For real-time bus positions
    let routePolylines = L.layerGroup(); // For drawing routes
    let stopMarkers = L.layerGroup(); // For bus stops
    let selectedRouteLayer; // To hold the specific route polyline for easier removal/update

   if (document.getElementById('busMap')) {
        map = L.map('busMap').setView([9.6556, 123.8520], 13); // Centered on Tagbilaran City, Bohol
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        busMarkers.addTo(map);
        routePolylines.addTo(map);
        stopMarkers.addTo(map);

        // Custom bus icon
        const busIcon = L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/179/179294.png', // Generic bus icon
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
                map.setView([34.0522, -118.2437], 13); // Reset view
                return;
            }

            const route = dummyRoutes.find(r => r.id === routeId);
            if (route) {
                // Draw route polyline
                const latlngs = route.stops.map(stop => [stop.lat, stop.lng]);
                selectedRouteLayer = L.polyline(latlngs, { color: route.color, weight: 5, opacity: 0.7 }).addTo(routePolylines);
                map.fitBounds(selectedRouteLayer.getBounds().pad(0.1)); // Zoom to route with padding

                // Add bus stop markers
                route.stops.forEach(stop => {
                    L.marker([stop.lat, stop.lng], { icon: stopIcon })
                     .bindPopup(`<b>${stop.name}</b><br>Next: ${route.name} in ${stop.ETA}`)
                     .addTo(stopMarkers);
                });

                // Add bus markers
                route.busPositions.forEach(bus => {
                    const marker = L.marker([bus.lat, bus.lng], { icon: busIcon })
                                    .bindPopup(`<b>Bus ${bus.id}</b><br>Crowding: ${bus.crowding}<br>Route: ${route.name}`)
                                    .addTo(busMarkers);
                    // Add animation for bus movement (simple simulation)
                    animateBus(marker, bus.lat, bus.lng, route.stops);
                });

                // Display route details
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
            routeSelector.value = ''; // Deselect specific route

            let allLayers = [];

            dummyRoutes.forEach(route => {
                // Draw all route polylines
                const latlngs = route.stops.map(stop => [stop.lat, stop.lng]);
                if (latlngs.length > 0) {
                    const polyline = L.polyline(latlngs, { color: route.color, weight: 5, opacity: 0.5 }).addTo(routePolylines);
                    allLayers.push(polyline);
                }

                // Add all bus stop markers
                route.stops.forEach(stop => {
                    const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon })
                     .bindPopup(`<b>${stop.name}</b><br>Next: ${route.name} in ${stop.ETA}`)
                     .addTo(stopMarkers);
                    allLayers.push(marker);
                });

                // Add all bus markers
                route.busPositions.forEach(bus => {
                    const marker = L.marker([bus.lat, bus.lng], { icon: busIcon })
                                    .bindPopup(`<b>Bus ${bus.id}</b><br>Crowding: ${bus.crowding}<br>Route: ${route.name}`)
                                    .addTo(busMarkers);
                    animateBus(marker, bus.lat, bus.lng, route.stops); // Still animate
                    allLayers.push(marker);
                });
            });

            if (allLayers.length > 0) {
                const combinedFeatureGroup = L.featureGroup(allLayers);
                map.fitBounds(combinedFeatureGroup.getBounds().pad(0.1)); // Add some padding
            } else {
                map.setView([34.0522, -118.2437], 13); // Default view
            }
        }

        // Simple bus animation (moves bus towards next stop)
        function animateBus(marker, initialLat, initialLng, stops) {
            let currentLat = initialLat;
            let currentLng = initialLng;
            let currentStopIndex = 0;

            // Find the closest stop to initialize animation
            let minDistance = Infinity;
            stops.forEach((stop, index) => {
                const distance = map.distance([currentLat, currentLng], [stop.lat, stop.lng]);
                if (distance < minDistance) {
                    minDistance = distance;
                    currentStopIndex = index;
                }
            });

            // If bus is very close to a stop, advance to next one for animation
            if (minDistance < 50 && currentStopIndex < stops.length - 1) { // 50 meters
                currentStopIndex++;
            }

            function moveBusSegment() {
                if (!arActive && !map.hasLayer(marker)) { // Stop animating if AR is active or marker removed
                    return;
                }

                if (currentStopIndex >= stops.length) {
                    currentStopIndex = 0; // Loop back to first stop
                    currentLat = stops[stops.length - 1].lat; // Start from end of route to loop
                    currentLng = stops[stops.length - 1].lng;
                }

                const targetStop = stops[currentStopIndex];
                const startLatLng = marker.getLatLng(); // Use current marker position as start
                const targetLatLng = L.latLng(targetStop.lat, targetStop.lng);

                const duration = 7000; // milliseconds for this segment (simulated travel time)
                const steps = 200;
                let step = 0;

                const interval = setInterval(() => {
                    if (!arActive && !map.hasLayer(marker)) { // Check again inside interval
                        clearInterval(interval);
                        return;
                    }

                    step++;
                    const progress = step / steps;
                    const newLat = startLatLng.lat + (targetLatLng.lat - startLatLng.lat) * progress;
                    const newLng = startLatLng.lng + (targetLatLng.lng - startLatLng.lng) * progress;
                    marker.setLatLng([newLat, newLng]);

                    if (step >= steps) {
                        clearInterval(interval);
                        currentStopIndex++;
                        setTimeout(moveBusSegment, 3000); // Pause for 3 seconds at stop
                    }
                }, duration / steps);
            }
            moveBusSegment(); // Start the animation loop
        }


        // Initialize map with all buses shown by default
        displayAllBusesOnMap();

        // Download schedule button in route details
        document.querySelector('.download-schedule-btn').addEventListener('click', () => {
            const selectedRouteId = routeSelector.value;
            if (selectedRouteId) {
                // This triggers the service worker to save route data
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({
                        type: 'SAVE_ROUTE_FOR_OFFLINE',
                        routeId: selectedRouteId
                    });
                    alert(`Request sent to download schedule for Route ${selectedRouteId}. Check offline section.`);
                } else {
                    alert('Service Worker not active or supported. Cannot download for offline.');
                }
            } else {
                alert('Please select a route first.');
            }
        });
    }

    // --- Predictive Crowding Indicator ---
    const crowdingStopInput = document.getElementById('crowdingStopInput');
    const getCrowdingButton = document.getElementById('getCrowdingButton');
    const crowdingResults = document.getElementById('crowding-results');
    const crowdingTarget = document.getElementById('crowding-target');
    const crowdingStatus = document.getElementById('crowding-status');
    const crowdingBar = document.getElementById('crowding-bar');
    const crowdingLastUpdated = document.getElementById('crowding-last-updated');
    const routeStopSearchInput = document.getElementById('routeStopSearchInput');
    const searchRouteStopButton = document.getElementById('searchRouteStopButton');

    searchRouteStopButton.addEventListener('click', () => {
        const query = routeStopSearchInput.value.trim();
        if (query) {
            // Attempt to find a route or stop
            const foundRoute = dummyRoutes.find(r => r.name.toLowerCase().includes(query.toLowerCase()) || r.id.includes(query));
            const foundStop = dummyBusStops.find(s => s.name.toLowerCase().includes(query.toLowerCase()));

            if (foundRoute) {
                alert(`Found Route ${foundRoute.id}: ${foundRoute.name}. Navigating to map.`);
                document.getElementById('map-routes').scrollIntoView({ behavior: 'smooth', block: 'start', offsetTop: header.offsetHeight });
                routeSelector.value = foundRoute.id;
                displayRouteOnMap(foundRoute.id);
            } else if (foundStop) {
                alert(`Found Stop: ${foundStop.name}. Navigating to map.`);
                document.getElementById('map-routes').scrollIntoView({ behavior: 'smooth', block: 'start', offsetTop: header.offsetHeight });
                map.setView([foundStop.lat, foundStop.lng], 16); // Zoom to stop
                L.marker([foundStop.lat, foundStop.lng], { icon: stopIcon })
                 .bindPopup(`<b>${foundStop.name}</b><br>Next: ${foundStop.nextArrival}`)
                 .openPopup()
                 .addTo(stopMarkers);
                // Also show its route if possible
                const relatedRoute = dummyRoutes.find(r => r.id === foundStop.routeId);
                if (relatedRoute) {
                    displayRouteOnMap(relatedRoute.id);
                    routeSelector.value = relatedRoute.id;
                }
            }
            else {
                alert(`No route or stop found for "${query}".`);
            }
        } else {
            alert('Please enter a route, stop or destination to search.');
        }
    });

    getCrowdingButton.addEventListener('click', () => {
        const query = crowdingStopInput.value.trim();
        if (query) {
            fetchCrowdingPrediction(query);
        } else {
            alert('Please enter a bus stop or route number.');
            crowdingResults.style.display = 'none';
        }
    });

    function fetchCrowdingPrediction(query) {
        crowdingResults.style.display = 'block';
        crowdingTarget.textContent = query;
        crowdingStatus.textContent = 'Fetching data...';
        crowdingBar.style.width = '0%';
        crowdingBar.className = 'crowding-bar'; // Reset classes

        // Simulate API call delay
        setTimeout(() => {
            const predictions = [
                { status: "Plenty of Seats", level: 20, class: 'low' },
                { status: "Usually Moderate", level: 50, class: 'moderate' },
                { status: "Likely Crowded", level: 85, class: 'high' }
            ];
            const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];

            crowdingStatus.textContent = randomPrediction.status;
            crowdingBar.style.width = `${randomPrediction.level}%`;
            crowdingBar.classList.add(randomPrediction.class);
            crowdingLastUpdated.textContent = new Date().toLocaleTimeString();
        }, 1500);
    }

    // --- AR Bus Stop Finder (Simulated) ---
    const startArButton = document.getElementById('startArButton');
    const arCameraFeed = document.getElementById('ar-camera-feed');
    const arOverlays = document.getElementById('ar-overlays');
    let arActive = false;
    let videoStream; // To store the camera stream

    // Add a video element dynamically for AR simulation
    const arVideo = document.createElement('video');
    arVideo.id = 'ar-camera-video';
    arVideo.autoplay = true;
    arVideo.playsInline = true; // Important for iOS
    arVideo.style.position = 'absolute';
    arVideo.style.top = '0';
    arVideo.style.left = '0';
    arVideo.style.width = '100%';
    arVideo.style.height = '100%';
    arVideo.style.objectFit = 'cover';
    arVideo.style.zIndex = '1';
    arVideo.style.display = 'none';
    arCameraFeed.prepend(arVideo);


    startArButton.addEventListener('click', () => {
        if (arActive) {
            stopAR();
            startArButton.innerHTML = '<i class="fas fa-camera"></i> Activate AR View';
        } else {
            activateAR();
            startArButton.innerHTML = '<i class="fas fa-stop-circle"></i> Stop AR View';
        }
    });

    function activateAR() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            arCameraFeed.classList.add('active'); // Style for active AR
            arVideo.style.display = 'block'; // Show video element

            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }) // Prefer rear camera
                .then(stream => {
                    videoStream = stream;
                    arVideo.srcObject = stream;
                    arVideo.play();
                    arActive = true;
                    // Clear existing map layers when AR is active to avoid visual clutter
                    if (map) {
                        busMarkers.clearLayers();
                        routePolylines.clearLayers();
                        stopMarkers.clearLayers();
                        document.getElementById('route-details').style.display = 'none';
                    }
                    simulateAROverlays();
                })
                .catch(err => {
                    console.error("Error accessing camera for AR:", err);
                    alert("Could not access camera for AR. Please ensure permissions are granted.");
                    arVideo.style.display = 'none';
                    arCameraFeed.classList.remove('active');
                    startArButton.innerHTML = '<i class="fas fa-camera"></i> Activate AR View';
                });
        } else {
            alert('Your browser does not support camera access needed for AR.');
            arCameraFeed.classList.remove('active');
        }
    }

    function stopAR() {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            arVideo.srcObject = null;
        }
        arActive = false;
        arOverlays.innerHTML = ''; // Clear overlays
        arCameraFeed.classList.remove('active');
        arVideo.style.display = 'none';
        // Restore map if it was cleared
        if (map) {
            displayAllBusesOnMap();
        }
    }

    function simulateAROverlays() {
        // In a real AR.js/A-Frame setup, this would be handled by the AR library
        // and would actually position elements relative to detected markers or GPS.
        // Here, we're just making them appear at random points on the screen.
        arOverlays.innerHTML = ''; // Clear previous overlays

        if (!arActive) return; // Stop if AR is no longer active

        const arPlaceholderRect = arCameraFeed.getBoundingClientRect();
        const centerX = arPlaceholderRect.width / 2;
        const centerY = arPlaceholderRect.height / 2;

        dummyBusStops.forEach(stop => {
            // Simulate random positions for overlays
            const offsetX = (Math.random() - 0.5) * arPlaceholderRect.width * 0.8; // within 80% width
            const offsetY = (Math.random() - 0.5) * arPlaceholderRect.height * 0.8; // within 80% height

            const overlayDiv = document.createElement('div');
            overlayDiv.className = 'ar-bus-stop-overlay';
            overlayDiv.style.left = `${centerX + offsetX}px`;
            overlayDiv.style.top = `${centerY + offsetY}px`;
            overlayDiv.innerHTML = `<strong>${stop.name}</strong><br>${stop.nextArrival}`;
            arOverlays.appendChild(overlayDiv);
        });

        // Re-simulate after a delay to change positions or add new ones
        setTimeout(simulateAROverlays, 5000); // Update overlays every 5 seconds
    }


    // --- Community-Driven Feedback ---
    feedbackModalBtns.forEach(button => {
        button.addEventListener('click', (e) => {
            const formType = e.target.dataset.formType;
            let title = 'Submit Feedback';
            let description = 'Please provide details for your submission.';
            if (formType === 'report') {
                title = 'Report an Issue';
                description = 'Describe the problem you encountered (e.g., late bus, cleanliness, safety).';
            } else if (formType === 'lost_found') {
                title = 'Lost & Found Portal';
                description = 'Describe the item and provide details of where/when it was lost or found.';
            }
            openModal('feedbackModal', title, description);
        });
    });

    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackSuccessMessage = document.getElementById('feedback-success-message');

    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = document.getElementById('feedbackMessage').value;
        const contact = document.getElementById('contactInfo').value;

        if (message.trim()) {
            console.log('Feedback Submitted:', { message, contact });
            alert('Thank you for your feedback! Your submission has been received.');
            feedbackForm.reset();
            closeModal('feedbackModal');
            feedbackSuccessMessage.style.display = 'flex'; // Show success message
            setTimeout(() => {
                feedbackSuccessMessage.style.display = 'none'; // Hide after a few seconds
            }, 5000);
        } else {
            alert('Please enter your message before submitting.');
        }
    });

    // --- Journey Planning ---
    const journeyResults = document.getElementById('journey-results');
    const recommendedRoutesList = document.getElementById('recommended-routes-list');

    journeyPlanForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const start = document.getElementById('startLocation').value.trim();
        const end = document.getElementById('endLocation').value.trim();

        if (start && end) {
            recommendedRoutesList.innerHTML = '<li>Searching for routes...</li>';
            // Simulate route finding
            setTimeout(() => {
                const possibleRoutes = dummyRoutes.filter(route =>
                    route.stops.some(stop => stop.name.toLowerCase().includes(start.toLowerCase())) &&
                    route.stops.some(stop => stop.name.toLowerCase().includes(end.toLowerCase()))
                );

                if (possibleRoutes.length > 0) {
                    recommendedRoutesList.innerHTML = '';
                    possibleRoutes.forEach(route => {
                        const li = document.createElement('li');
                        li.innerHTML = `<strong>Route ${route.id}: ${route.name}</strong><br>
                                        Approx. travel time: ${Math.floor(Math.random() * 30) + 20} min<br>
                                        <button class="small-button primary-button view-route-btn" data-route-id="${route.id}">View on Map</button>`;
                        recommendedRoutesList.appendChild(li);

                        li.querySelector('.view-route-btn').addEventListener('click', (btnE) => {
                            closeModal('journeyPlanModal');
                            const routeIdToView = btnE.target.dataset.routeId;
                            document.getElementById('map-routes').scrollIntoView({ behavior: 'smooth', block: 'start', offsetTop: header.offsetHeight });
                            routeSelector.value = routeIdToView;
                            displayRouteOnMap(routeIdToView);
                        });
                    });
                } else {
                    recommendedRoutesList.innerHTML = '<li>No direct routes found. Consider transfers or different search terms.</li>';
                }
            }, 2000);
        } else {
            alert('Please enter both start and destination for your journey.');
        }
    });

    // --- Offline Access ---
    const offlineRouteSelector = document.getElementById('offlineRouteSelector');
    const downloadRouteButton = document.getElementById('downloadRouteButton');
    const viewOfflineContentButton = document.getElementById('viewOfflineContentButton');
    const offlineSavedContent = document.getElementById('offline-saved-content');
    const savedRoutesList = document.getElementById('saved-routes-list');

    // Populate offline route selector with available dummy routes
    dummyRoutes.forEach(route => {
        const option = document.createElement('option');
        option.value = route.id;
        offlineRouteSelector.appendChild(option);
    });

    // Simulate offline route saving (would use Service Worker in real app)
    downloadRouteButton.addEventListener('click', () => {
        const selectedRouteId = offlineRouteSelector.value;
        if (selectedRouteId) {
            // Simulate saving route for offline
            let savedRoutes = JSON.parse(localStorage.getItem('offlineRoutes') || '[]');
            if (!savedRoutes.includes(selectedRouteId)) {
                savedRoutes.push(selectedRouteId);
                localStorage.setItem('offlineRoutes', JSON.stringify(savedRoutes));
                alert(`Route ${selectedRouteId} saved for offline access.`);
            } else {
                alert('This route is already saved for offline.');
            }
        } else {
            alert('Please select a route to download.');
        }
    });

    viewOfflineContentButton.addEventListener('click', () => {
        offlineSavedContent.style.display = 'block';
        savedRoutesList.innerHTML = '';
        let savedRoutes = JSON.parse(localStorage.getItem('offlineRoutes') || '[]');
        if (savedRoutes.length === 0) {
            savedRoutesList.innerHTML = '<li>No routes saved for offline access.</li>';
        } else {
            savedRoutes.forEach(routeId => {
                const route = dummyRoutes.find(r => r.id === routeId);
                if (route) {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>Route ${route.id}: ${route.name}</strong>
                        <button class="small-button view-offline-route-btn" data-route-id="${route.id}">View Details</button>
                        <button class="small-button remove-offline-route-btn" data-route-id="${route.id}">Remove</button>`;
                    savedRoutesList.appendChild(li);

                    li.querySelector('.view-offline-route-btn').addEventListener('click', (e) => {
                        displayOfflineRouteDetails(route.id);
                    });
                    li.querySelector('.remove-offline-route-btn').addEventListener('click', (e) => {
                        removeOfflineRoute(route.id);
                    });
                }
            });
        }
    });

    function displayOfflineRouteDetails(routeId) {
        const route = dummyRoutes.find(r => r.id === routeId);
        if (route) {
            alert(`Offline Details:\nRoute ${route.id}: ${route.name}\nOrigin: ${route.origin}\nDestination: ${route.destination}\nStops:\n${route.stops.map(s => s.name).join('\n')}`);
        }
    }

    function removeOfflineRoute(routeId) {
        let savedRoutes = JSON.parse(localStorage.getItem('offlineRoutes') || '[]');
        savedRoutes = savedRoutes.filter(id => id !== routeId);
        localStorage.setItem('offlineRoutes', JSON.stringify(savedRoutes));
        viewOfflineContentButton.click(); // Refresh list
    }

    // Hide offline content section when clicking outside
    window.addEventListener('click', (e) => {
        if (offlineSavedContent.style.display === 'block' && !offlineSavedContent.contains(e.target) && e.target !== viewOfflineContentButton) {
            offlineSavedContent.style.display = 'none';
        }
    });

});

s