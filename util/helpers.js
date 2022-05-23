const { DateTime } = require("luxon");

// getter function for timestamp
const getTimestamp = (date) => {
  console.log("making datetime from : ", date);
  const get = DateTime.fromJSDate(date);
  console.log("get is: ", get);
  return (
    get.toLocaleString(DateTime.DATE_FULL) +
    " at " +
    get.toLocaleString(DateTime.TIME_SIMPLE)
  );
};

/**
 * Creates a time stamp using the local date and time rather than international
 * @returns {Date}
 */
const setTimestamp = () => {
  const now = DateTime.local();
  return Date(now.toISO());
};
module.exports = { getTimestamp, setTimestamp };
