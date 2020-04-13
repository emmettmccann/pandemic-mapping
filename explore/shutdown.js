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

  let data = await getTimeSeries();
  data = await addShutdown(data);
  console.log(data);

  data = data.filter((el) => {
    return (
      typeof el.cases !== "undefined" && typeof el.cases.cases !== "undefined"
    );
  });

  //   console.log(data);

  states = layer
    .createFeature("point")
    .data(data)
    .position(function (state) {
      let coords = state.stateData.coordinates;
      return {
        x: coords[0].toFixed(3),
        y: coords[1].toFixed(3),
      };
    })
    .draw();
  var caseCount = data.map(function (state) {
    return state.cases.cases;
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

  var scale = d3.scale.linear().domain(domain).range([1, 2000]);
  //   return;
  states
    .style({
      fillColor: function (d, idx, state) {
        return cScale(d.cases.cases);
      },
      stroke: false,
      fillOpacity: 0.8,
      radius: function (d, idx, state) {
        return Math.sqrt(scale(d.cases.cases) / Math.PI);
      },
    })
    .geoOff(geo.event.feature.mouseover)
    .geoOff(geo.event.feature.mouseout)
    .geoOn(geo.event.feature.mouseover, function (evt) {
      if (!evt.top) {
        return;
      }
      console.log(evt.data.cases.cases);
    });
  states.draw();

  states.geoOn(geo.event.feature.mouseclick, function (evt) {
    if (!evt.top) {
      return;
    }
    console.log("click");
    let coords = evt.data.stateData.coordinates;
    let ct = {
      x: coords[0].toFixed(3),
      y: coords[1].toFixed(3),
    };
    map.transition({
      center: ct,
      zoom: 6,
      duration: 1000,
      // done: () => {
      //   map.transition({
      //     center: ct,
      //     zoom: 6,
      //     duration: 500,
      //   });
      // },
    });
  });

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
