const { sqlForPartialUpdate } = require('./sql');

const dataToUpdate = {
    firstName: 'Aliya',
    age: '32'
};

const jsToSql = {
    firstName: "first_name"
};

const expectedSql = {
    "setCols": `"${jsToSql.firstName}"=$1, "age"=$2`,
    "values": [ `${dataToUpdate.firstName}`, `${dataToUpdate.age}`]
};

describe("sqlForPartialUpdate", () => {
    test("non-garbage in, non-garbage out", () => {
        expect(sqlForPartialUpdate(dataToUpdate, jsToSql)).toEqual(expectedSql);
    });
    
    test("garbage in, garbage out", () => {
        expect(sqlForPartialUpdate(jsToSql, dataToUpdate)).not.toEqual(expectedSql);
    });
});