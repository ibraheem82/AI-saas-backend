export const calculateNextBillingDate = () => {
  // new Date() creates a new Date object representing the current date and time.
  // * -> Gets the current month with getMonth() (which returns 0-11, where 0 is January)
  // * -> Adds 1 to that value to get the next month
  // * -> Sets the month of the oneMonthFromNow date to this new value
  /*
  -> if today is March 14, it will return April 14. If today is January 31, it will return February 28 (or 29 in leap years), as JavaScript's Date object automatically adjusts for months with different numbers of days.
  */
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
  return oneMonthFromNow;
};