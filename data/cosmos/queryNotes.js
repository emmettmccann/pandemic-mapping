g.V().hasLabel("location");
g.V().or(has("name", "Washington"), has("division", "Washington")).count();
g.V().has("name", "Washington").count();

g.V()
  .hasLabel("genome")
  .has("division", "Washington")
  .addE("in")
  .to(g.V().hasLabel("location").has("name", "Washington"));

g.V()
  .match(
    __.as("loc").hasLabel("location").has("name", "Washington"),
    __.as("gen").hasLabel("genome").has("division", "Washington")
  )
  .select("loc");

g.v().has("division", g.v("WA").values("name"));
g.v().has("division", g.v("WA").values("name")).id();

g.v().hasLabel("person").values("favColor").as("a");

// link to location via stateID info
g.V()
  .hasLabel("location")
  .as("a")
  .V()
  .hasLabel("genome")
  .as("b")
  .where("a", eq("b"))
  .by("name")
  .by("division")
  .addE("in")
  .from("b")
  .to("a");

// link days
g.V()
  .hasLabel("date")
  .as("a")
  .V()
  .hasLabel("date")
  .as("b")
  .where("a", eq("b"))
  .by("id")
  .by("prevDay")
  .addE("nextDay")
  .from("a")
  .to("b");

g.v().hasLabel("genome").has("sampled", true).has("country", "USA").values("division");

g.v().hasLabel("genome").out("in").path().unfold();

// get shape
g.E().groupCount().by("label").store("Edges").V().groupCount().by("label").store("Nodes").select("Nodes", "Edges");

// get most recent 2 case reports for state
g.v("WA").in("reportedIn").order().by(out("reportedOn").id()).tail(2).valueMap();

g.v().has("division").has("country", "USA").count();

g.V()
  .hasLabel("date")
  .as("a")
  .local(__.V().hasLabel("date").as("b").where("b", lt("a")).by(id()).order().limit(1))
  .as("c")
  .addE("nextDay")
  .from("a")
  .to("c");

g.V()
  .hasLabel("caseReports")
  .as("a")
  .out("reportedOn")
  .in("nextDay")
  .in("reportedOn")
  .as("b")
  .where("a", eq("b"))
  .by(out("reportedIn").id())
  .as("c")
  .select("a", "c")
  .by("id");

g.V().hasLabel("caseReport").as("a").out("reportedOn").in("nextDay").in("reportedOn").as("b").select("a", "b").by("id");

g.V()
  .hasLabel("caseReport")
  .where(__.in("nextDay").count().is(0))
  .limit(20)
  .as("a")
  .out("reportedOn")
  .in("nextDay")
  .in("reportedOn")
  .as("b")
  .where("a", eq("b"))
  .by(out("reportedIn").id())
  .as("c")
  .addE("nextDay")
  .to("a")
  .from("b")
  .count();

g.V().where(out("sampledIn").has("id", "WA")).repeat(__.in("mutated")).times(1).path().unfold();

g.V("NODE_0000741").out();

g.V("NODE_0000741").out().out("sampledIn").path().unfold();

g.V("USA-WA1-2020").out().out("sampledIn").path().unfold()[
  {
    Nodes: [
      {
        date: 150,
        location: 56,
        caseReport: 2910,
        genome: 6078,
      },
    ],
    Edges: [
      {
        nextDay: 149,
        reportedIn: 2910,
        reportedOn: 2910,
        nextReport: 2854,
        mutated: 6077,
        sampledOn: 2658,
        sampledIn: 1909,
      },
    ],
  }
];

9194;
