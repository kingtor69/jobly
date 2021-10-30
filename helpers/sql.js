const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // this is used to convert JavaScript-friendly object keys into SQL-friendly column headers
  // dataToUpdate represents the JS object of data to be converted to an SQL friendly string
  // jsToSql is an object with comprised of the keys from dataToUpdate that need to be changed with the value on that key being a SQL-friendly string for the column header
  
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");
  
  // function returns an object containing two strings to be used in a db query
    // setCols is the string of columns to be INSERTed into in sql format
    // values are the values to be INSERT into the row
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  // '"first_name"=$1', '"age"=$2' => {
  //   setCols: ['"first_name"=$1', '"age"=$2'],
  //   values: [ 'Aliya', 33 ]
  // }
  // i think
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
