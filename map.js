function init_map() {
	var map = L.map('map');
	new L.OSM.CycleMap().addTo(map);
	L.control.scale().addTo(map);

	var markers = L.featureGroup().addTo(map);
	pois.forEach(function(poi) {
		var marker = L.marker(poi.latlng, { icon: L.MakiMarkers.icon({ color: poi.color }) });
		marker.bindLabel(poi.name, { direction: 'auto' });
		marker.addTo(markers);
	});

	var routes = L.gpxGroup(tracks, {
		highlight: { color: '#d00' },
		zoomOnSelected: true,
	});
	routes.on('loaded', function() {
		map.fitBounds(routes.getBounds());
	});
	routes.addTo(map);
}
