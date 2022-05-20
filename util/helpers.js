// getter function for timestamp
// TODO: test
const getTimestamp = (date) => {
  if (date) return date.toISOString().split("T")[0];
};

module.exports = { getTimestamp };
