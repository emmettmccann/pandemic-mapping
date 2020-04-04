window.onload = async function () {
  var map = geo.map({
    node: "#map",
    center: { x: -97, y: 41 },
    zoom: 4,
  });

  map.createLayer("osm").opacity(0.5);
  map.createLayer("");
  var layer = map.createLayer("feature");

  var states;

  let data = await getData();

  console.log(data);

  states = layer
    .createFeature("point")
    .data(data)
    .position(function (state) {
      return {
        x: state.longitude,
        y: state.latitude,
      };
    })
    .draw();
  var caseCount = data.map(function (state) {
    return state.data.positive;
  });
  var domain = [
    Math.min.apply(null, caseCount),
    Math.max.apply(null, caseCount),
  ];
  var colorRange = ["rgb(0,255,0)", "rgb(255,0,0)"];
  var cScale = d3.scale
    .pow()
    .exponent(0.2)
    .domain(domain)
    .interpolate(d3.interpolateHcl)
    .range(colorRange);

  var scale = d3.scale.pow().exponent(0.3).domain(domain).range([1, 30]);
  // return;
  states
    .style({
      fillColor: function (d, idx, state) {
        console.log(d.data.positive);
        return cScale(d.data.positive);
      },
      stroke: false,
      fillOpacity: 0.8,
      radius: function (d, idx, state) {
        return scale(d.data.positive);
      },
    })
    .geoOff(geo.event.feature.mouseover)
    .geoOff(geo.event.feature.mouseout)
    .geoOn(geo.event.feature.mouseover, function (evt) {
      if (!evt.top) {
        return;
      }
      console.log(evt.data.data.positive);
    });
  states.draw();
  var ui = map.createLayer("ui");
  var legend = ui.createWidget("colorLegend", {
    position: {
      right: 20,
      top: 10,
    },
    categories: [
      {
        name: "COVID-19 Cases",
        type: "continuous",
        scale: "pow",
        domain: domain,
        colors: colorRange,
      },
    ],
  });
};
