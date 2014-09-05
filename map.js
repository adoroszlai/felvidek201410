function init_map() {
	var map = L.map('map');
	new L.OSM.MapQuestOpen().addTo(map);
	L.control.scale().addTo(map);

	var markers = L.featureGroup().addTo(map);
	pois.forEach(function(poi) {
		var marker = L.marker(poi.latlng, { icon: L.MakiMarkers.icon({ color: poi.color }) });
		marker.bindLabel(poi.name, { direction: 'auto' });
		marker.addTo(markers);
	});

	map.fitBounds(markers.getBounds());
}
