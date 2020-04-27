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
