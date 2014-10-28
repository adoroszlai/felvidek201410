L.GPX.include(L.Mixin.Selectable);

L.GpxGroup = L.Class.extend({
	options: {
		highlight: {
			color: '#fff',
			opacity: 1,
		},
		zoomOnSelected: false,
	},

	initialize: function (routes, options) {
		this._routes = routes;
		this._layers = L.featureGroup();
		this._elevation = L.control.elevation({ width: 500 });
		L.Util.setOptions(this, options);
	},

	getBounds: function() {
		return this._layers.getBounds();
	},

	addTo: function (map) {
		this._layers.addTo(map);

		var this_ = this;
		var elevation_ = this._elevation;

		var routeCount = this._routes.length;
		var colors = ColorUtils.uniqueColors(routeCount);
		var count = 0;
		var loadedCount = 0;

		this.on('selectionChanged', function() {
			var route = this_.getSelection();
			if (route && route.isSelected()) {
				if (!elevation_.getContainer()) {
					elevation_.addTo(map);
				}
				elevation_.clear();
				route.getLayers().forEach(function(layer) {
					if (layer instanceof L.Polyline) {
						elevation_.addData(layer);
					}
				});
			} else {
				if (elevation_.getContainer()) {
					elevation_.removeFrom(map);
				}
				elevation_.clear();
			}
		});

		this._routes.forEach(function(track) {
			$.get(track, function(data) {
				var route = new L.GPX(data, {
					async: true,
					marker_options: { startIconUrl: null, endIconUrl: null },
					polyline_options: {
						color: colors[count++],
						opacity: 0.75,
						distanceMarkers: { lazy: true },
					}
				});
				route.on('addline', function(evt) {
					var polyline = evt.line;
					var originalStyle = polyline.options;
					var marker = null;

					var highlight = function() {
						polyline.setStyle(this_.options.highlight)
						polyline.addDistanceMarkers();
					};
					var unhighlight = function() {
						polyline.setStyle(originalStyle)
						polyline.removeDistanceMarkers();
					};
					polyline.on('mouseover', function() {
						if (!route.isSelected()) {
							highlight();
						}
					});
					polyline.on('mouseout', function() {
						if (!route.isSelected()) {
							unhighlight();
						}
					});
					polyline.on('click', function() {
						this_.setSelection(route);
					});
					route.on('selected', function() {
						if (!route.isSelected()) {
							unhighlight();
						}
						if (this_.options.zoomOnSelected) {
							if (route.isSelected()) {
								map.fitBounds(polyline.getBounds());
							} else {
								map.fitBounds(this_.getBounds());
							}
						}
					});
					if (route.get_distance() < 20000) {
						map.on('zoomend', function() {
							if (map.getZoom() < 12) { // TODO relative to route length
								if (marker === null) {
									marker = L.marker(polyline.getBounds().getCenter(), { icon: L.MakiMarkers.icon({ color: originalStyle.color }) });
									marker.on('mouseover', function() {
										if (!route.isSelected()) {
											highlight();
										}
									});
									marker.on('mouseout', function() {
										if (!route.isSelected()) {
											unhighlight();
										}
									});
									marker.on('click', function() {
										this_.setSelection(route);
									});
									marker.bindLabel(route.get_name(), { direction: 'auto' });
								}
								marker.addTo(map);
							} else {
								if (marker !== null) {
									map.removeLayer(marker);
								}
							}
						});
					}

					polyline.bindLabel(route.get_name(), { direction: 'auto' });
				});
				route.on('loaded', function() {
					if (++loadedCount === routeCount) {
						this_.fire('loaded');
					}
				});
				route.addTo(this_._layers);
			});
		});
	},

	removeFrom: function (map) {
		this._layers.removeFrom(map);
	},

});
L.GpxGroup.include(L.Mixin.Events);
L.GpxGroup.include(L.Mixin.Selection);

L.gpxGroup = function(routes, options) {
	return new L.GpxGroup(routes, options);
};
