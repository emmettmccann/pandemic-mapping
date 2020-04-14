async function time(fn) {
  let t0 = performance.now();
  await fn();
  console.log(performance.now() - t0);
}
