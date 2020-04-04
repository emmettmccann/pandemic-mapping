window.onload = function () {
  var map = geo.map({
    node: "#map",
    center: { x: -97, y: 41 },
    zoom: 4,
  });

  map.createLayer("osm");
  var layer = map.createLayer("feature");

  var polygon;

  fetch("./gz_2010_us_050_00_20m.json")
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      polygon = layer
        .createFeature("polygon")
        .data(
          data.features.map(function (state) {
            return state.geometry;
          })
        )
        .polygon(function (d) {
          if (d.type == "MultiPolygon") {
            return {
              outer: d.coordinates[0][0],
              inner: d.coordinates[0][1],
            };
          }
          return {
            outer: d.coordinates[0],
          };
        })
        .position(function (d) {
          return { x: d[0], y: d[1] };
        });

      var populations = data.features.map(function (county) {
        let x = county.geometry.coordinates.flatten().flatten().flatten()
          .length;

        console.log(x);
        return x;
      });
      var domain = [
        Math.min.apply(null, populations),
        Math.max.apply(null, populations),
      ];
      var colorRange = ["rgb(0,255,0)", "rgb(255,0,0)"];
      var scale = d3.scale
        .pow()
        .exponent(0.02)
        .domain(domain)
        .interpolate(d3.interpolateHcl)
        .range(colorRange);

      polygon
        .style({
          fillColor: function (d, idx, state) {
            return scale(
              state.coordinates.flatten().flatten().flatten().length
            );
          },
          fillOpacity: 0.5,
        })
        .draw();
    });

  var states = {
    // 	type: 'FeatureCollection',
    // 	features: [
    // 		{
    // 			type: 'Feature',
    // 			properties: { name: 'Colorado', population: 5541000 },
    // 			geometry: {
    // 				type: 'Polygon',
    // 				coordinates: [
    // 					[
    // 						[-107.919731, 41.003906],
    // 						[-105.728954, 40.998429],
    // 						[-104.053011, 41.003906],
    // 						[-102.053927, 41.003906],
    // 						[-102.053927, 40.001626],
    // 						[-102.042974, 36.994786],
    // 						[-103.001438, 37.000263],
    // 						[-104.337812, 36.994786],
    // 						[-106.868158, 36.994786],
    // 						[-107.421329, 37.000263],
    // 						[-109.042503, 37.000263],
    // 						[-109.042503, 38.166851],
    // 						[-109.058934, 38.27639],
    // 						[-109.053457, 39.125316],
    // 						[-109.04798, 40.998429],
    // 						[-107.919731, 41.003906],
    // 					],
    // 				],
    // 			},
    // 		},
    // 		{
    // 			type: 'Feature',
    // 			properties: { name: 'New Mexico', population: 2081000 },
    // 			geometry: {
    // 				type: 'Polygon',
    // 				coordinates: [
    // 					[
    // 						[-107.421329, 37.000263],
    // 						[-106.868158, 36.994786],
    // 						[-104.337812, 36.994786],
    // 						[-103.001438, 37.000263],
    // 						[-103.001438, 36.501861],
    // 						[-103.039777, 36.501861],
    // 						[-103.045254, 34.01533],
    // 						[-103.067161, 33.002096],
    // 						[-103.067161, 31.999816],
    // 						[-106.616219, 31.999816],
    // 						[-106.643603, 31.901231],
    // 						[-106.528588, 31.786216],
    // 						[-108.210008, 31.786216],
    // 						[-108.210008, 31.331629],
    // 						[-109.04798, 31.331629],
    // 						[-109.042503, 37.000263],
    // 						[-107.421329, 37.000263],
    // 					],
    // 				],
    // 			},
    // 		},
    // 		{
    // 			type: 'Feature',
    // 			properties: { name: 'Utah', population: 3051000 },
    // 			geometry: {
    // 				type: 'Polygon',
    // 				coordinates: [
    // 					[
    // 						[-112.164359, 41.995232],
    // 						[-111.047063, 42.000709],
    // 						[-111.047063, 40.998429],
    // 						[-109.04798, 40.998429],
    // 						[-109.053457, 39.125316],
    // 						[-109.058934, 38.27639],
    // 						[-109.042503, 38.166851],
    // 						[-109.042503, 37.000263],
    // 						[-110.499369, 37.00574],
    // 						[-114.048427, 37.000263],
    // 						[-114.04295, 41.995232],
    // 						[-112.164359, 41.995232],
    // 					],
    // 				],
    // 			},
    // 		},
    // 		{
    // 			type: 'Feature',
    // 			properties: { name: 'Wyoming', population: 585000 },
    // 			geometry: {
    // 				type: 'Polygon',
    // 				coordinates: [
    // 					[
    // 						[-109.080842, 45.002073],
    // 						[-105.91517, 45.002073],
    // 						[-104.058488, 44.996596],
    // 						[-104.053011, 43.002989],
    // 						[-104.053011, 41.003906],
    // 						[-105.728954, 40.998429],
    // 						[-107.919731, 41.003906],
    // 						[-109.04798, 40.998429],
    // 						[-111.047063, 40.998429],
    // 						[-111.047063, 42.000709],
    // 						[-111.047063, 44.476286],
    // 						[-111.05254, 45.002073],
    // 						[-109.080842, 45.002073],
    // 					],
    // 				],
    // 			},
    // 		},
    // 	],
  };

  // var polygon = null;
  // promise.then(function(data) {
  // 	polygon = layer
  // 		.createFeature('polygon')
  // 		.data(
  // 			data.features.map(function(state) {
  // 				return state.geometry;
  // 			})
  // 		)
  // 		.polygon(function(d) {
  // 			return {
  // 				outer: d.coordinates[0],
  // 			};
  // 		})
  // 		.position(function(d) {
  // 			return { x: d[0], y: d[1] };
  // 		})
  // 		.draw();
  // });

  // var choropleth = layer
  // 	.createFeature('choropleth')
  // 	.data(states.features)
  // 	.scalar(
  // 		states.features.map(function(state) {
  // 			return {
  // 				// value and id are default scalar accessors
  // 				value: state.properties.population,
  // 				id: state.properties.name,
  // 			};
  // 		})
  // 	);

  // choropleth.choropleth({
  // 	colorRange: ['rgb(237,248,233)', 'rgb(186,228,179)', 'rgb(116,196,118)', 'rgb(35,139,69)'],
  // });
  // // set the geoId accessor
  // choropleth.choropleth('geoId', function(state) {
  // 	return state.properties.name;
  // });
  // choropleth.draw();

  // var ui = map.createLayer('ui');
  // var legend = ui.createWidget('colorLegend', {
  // 	position: {
  // 		right: 20,
  // 		top: 10,
  // 	},
  // 	categories: [
  // 		{
  // 			name: 'Population',
  // 			type: 'discrete',
  // 			scale: 'linear',
  // 			domain: domain,
  // 			colors: colorRange,
  // 		},
  // 	],
  // });
};
