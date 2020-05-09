<script>
  // your script goes here
  export let state;

  $: name = state.properties.name;
  $: pop = state.properties.pop;
</script>

<style>
  /* your styles go here */
</style>

<div>{name}: {pop}</div>
