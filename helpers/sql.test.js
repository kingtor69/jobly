const { sqlForPartialUpdate } = require('./sql');

const dataToUpdate = {
    age: 33
};

const jsToSql = {
    firstName: 'Aliya',
    age: 32
};

const expectedSql = ['"first_name"=$1', '"age"=$2'];

describe("sqlForPartialUpdate", () => {
    test("non-garbage in, non-garbage out", () => {
        expect(sqlForPartialUpdate(dataToUpdate, jsToSql)).toEqual(expectedSql);
    });
});