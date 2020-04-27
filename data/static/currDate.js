const currDate = (() => {
  let d = new Date();
  return d.getMonth() + "-" + d.getDate();
})();

module.exports = currDate;
