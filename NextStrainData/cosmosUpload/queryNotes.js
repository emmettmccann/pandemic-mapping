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

g.v().hasLabel("genome").has("sampled", true).has("country", "USA").values("division");

g.v().hasLabel("genome").out("in").path().unfold();
