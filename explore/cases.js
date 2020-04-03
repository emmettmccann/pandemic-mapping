window.onload = function() {
  var map = geo.map({
    node: "#map",
    center: { x: -97, y: 41 },
    zoom: 4
  });

  map.createLayer("osm").opacity(0.5);
  map.createLayer("");
  var layer = map.createLayer("feature");

  var states;

  fetch("./USstates_avg_latLong.json")
    .then(res => res.json())
    .then(data => {
      states = layer
        .createFeature("point")
        .data(data)
        .position(function(state) {
          return {
            x: state.longitude,
            y: state.latitude
          };
        })
        .draw();
      fetch("https://covidtracking.com/api/states")
        .then(res => res.json())
        .then(cases => {
          var caseCount = cases.map(function(stateCases) {
            return stateCases.positive;
          });
          var domain = [
            Math.min.apply(null, caseCount),
            Math.max.apply(null, caseCount)
          ];
          var colorRange = ["rgb(0,255,0)", "rgb(255,0,0)"];
          var cScale = d3.scale
            .pow()
            .exponent(0.2)
            .domain(domain)
            .interpolate(d3.interpolateHcl)
            .range(colorRange);

          var scale = d3.scale
            .pow()
            .exponent(0.3)
            .domain(domain)
            .range([1, 30]);
          states
            .style({
              fillColor: function(d, idx, state) {
                let x = cases.find(function(c) {
                  return c.state === d.state;
                });
                if (x) {
                  return cScale(x.positive);
                } else {
                  return false;
                }
              },
              stroke: false,
              fillOpacity: 0.8,
              radius: function(d, idx, state) {
                let x = cases.find(function(c) {
                  return c.state === d.state;
                });
                if (x) {
                  return scale(x.positive);
                } else {
                  return false;
                }
              }
            })
            .draw();
          var ui = map.createLayer("ui");
          var legend = ui.createWidget("colorLegend", {
            position: {
              right: 20,
              top: 10
            },
            categories: [
              {
                name: "COVID-19 Cases",
                type: "continuous",
                scale: "pow",
                domain: domain,
                colors: colorRange
              }
            ]
          });
        });
    });
};
