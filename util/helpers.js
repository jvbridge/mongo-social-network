// getter function for timestamp
const getTimestamp = (date) => {
  if (date) return date.toISOString().split("T")[0];
};

module.exports = { getTimestamp };
