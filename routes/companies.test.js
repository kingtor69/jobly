"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  adminToken
} = require("./_testCommon");
const Company = require("../models/company");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /companies */

describe("POST /companies", function () {
  const newCompany = {
    handle: "new",
    name: "New",
    logoUrl: "http://new.img",
    description: "DescNew",
    numEmployees: 10,
  };

  test("works for admins", async function () {
    const resp = await request(app)
        .post("/companies")
        .send({
          company: newCompany,
          user: {
            username: "admin",
            isAdmin: true
          }
        })
        .set("authorization", `Bearer ${adminToken}`);
    // expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      company: newCompany,
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/companies")
        .send({
          company: {
            handle: "new",
            numEmployees: 10,
          },
          user: {
            username: "admin",
            isAdmin: true
          }
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/companies")
        .send({
          company: {
            ...newCompany,
            logoUrl: "not-a-url",
          },
          user: {
            username: "admin",
            isAdmin: true
          }
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /companies */

describe("GET /companies", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/companies");
    expect(resp.body).toEqual({
      companies:
          [
            {
              handle: "c1",
              name: "C1",
              description: "Desc1",
              numEmployees: 1,
              logoUrl: "http://c1.img",
            },
            {
              handle: "c2",
              name: "C2",
              description: "Desc2",
              numEmployees: 2,
              logoUrl: "http://c2.img",
            },
            {
              handle: "c3",
              name: "C3",
              description: "Desc3",
              numEmployees: 3,
              logoUrl: "http://c3.img",
            },
          ],
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE companies CASCADE");
    const resp = await request(app)
        .get("/companies")
        .send({
          user: {
            username: "admin",
            isAdmin: true
          }
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(500);
  });
});

describe("Filtering GET companies results", () => {
  test("filter by part of name", async () => {
    const resp = await request(app)
      .get("/companies") 
      .query({
        name: "c"
      });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.companies.length).toEqual(3);
  });

  test("filter by minimum number of employees", async () => {
    const resp = await request(app)
      .get("/companies")
      .query({
        minEmployees: 2
      });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.companies.length).toEqual(2);
  });
  
  test("filter by maximum number of employees", async () => {
    const resp = await request(app)
      .get("/companies")
      .query({
        maxEmployees: 1
      });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.companies.length).toEqual(1);
  });
  test("filter by min and max number of employees", async () => {
    const resp = await request(app)
      .get("/companies")
      .query({
        minEmployees: 1,
        maxEmployees: 2
      });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.companies.length).toEqual(2);
  });
  test("valid data but zero results", async() => {
    const resp = await request(app)
      .get("/companies")
      .query({
        name: "fish"
      });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.companies.length).toEqual(0);
  });
  test("invalid data: min >= max", async () => {
    const badResp = await request(app)
      .get("/companies")
      .query({
        minEmployees: 10,
        maxEmployees: 1
      })
      .send({
        user: {
          username: "admin",
          isAdmin: true
        }
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(badResp.statusCode).toEqual(400);
    expect(badResp.body.error.message).toEqual("Minimum can not be greater than maximum.");
  });
});

/************************************** GET /companies/:handle */

describe("GET /companies/:handle", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/companies/c1`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("works for anon: company w/o jobs", async function () {
    const resp = await request(app).get(`/companies/c2`);
    expect(resp.body).toEqual({
      company: {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
    });
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
      .get(`/companies/nope`);
      expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /companies/:handle", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          company: {
            name: "ch-ch-ch-changes1"
          }
        })
        .send({
          user: {
            username: "admin",
            isAdmin: true
          }
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "ch-ch-ch-changes1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          name: "C1-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("non-existent company not found", async function () {
    const resp = await request(app)
        .patch(`/companies/nope`)
        .send({
          name: "new nope",
        })
        .send({
          user: {
            username: "admin",
            isAdmin: true
          }
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          company: {
            handle: "c1-new",
          }
        })
        .send({
          user: {
            username: "admin",
            isAdmin: true
          }
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          company: {
            logoUrl: "not-a-url",
          }
        })
        .send({
          user: {
            username: "admin",
            isAdmin: true
          }
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /companies/:handle */

describe("DELETE /companies/:handle", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .delete(`/companies/c1`)
        .send({
          user: {
            username: "admin",
            isAdmin: true
          }
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: "c1" });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/companies/c1`);

    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
        .delete(`/companies/nope`)
        .send({
          user: {
            username: "admin",
            isAdmin: true
          }
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
