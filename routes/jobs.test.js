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
<<<<<<< HEAD
const Job = require("../models/job");
=======
const Company = require("../models/company");
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

<<<<<<< HEAD
/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "new job",
    salary: 1000000,
    equity: "0.050",
    company_handle: "c1"
  };

  test.only("works for admins", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          job: newJob,
=======
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
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
          user: {
            username: "admin",
            isAdmin: true
          }
        })
        .set("authorization", `Bearer ${adminToken}`);
    // expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
<<<<<<< HEAD
      job: newJob,
=======
      company: newCompany,
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
<<<<<<< HEAD
        .post("/jobs")
        .send({
          job: {
=======
        .post("/companies")
        .send({
          company: {
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
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
<<<<<<< HEAD
        .post("/jobs")
        .send({
          job: {
            ...newJob,
=======
        .post("/companies")
        .send({
          company: {
            ...newCompany,
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
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

<<<<<<< HEAD
/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
=======
/************************************** GET /companies */

describe("GET /companies", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/companies");
    expect(resp.body).toEqual({
      companies:
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
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
            {
              handle: "c4",
              name: "C4",
              description: "Desc4",
              numEmployees: 4,
              logoUrl: "http://c4.img",
            },
          ],
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
<<<<<<< HEAD
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
=======
    await db.query("DROP TABLE companies CASCADE");
    const resp = await request(app)
        .get("/companies")
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
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

<<<<<<< HEAD
describe("Filtering GET jobs results", () => {
  test("filter by part of name", async () => {
    const resp = await request(app)
      .get("/jobs") 
=======
describe("Filtering GET companies results", () => {
  test("filter by part of name", async () => {
    const resp = await request(app)
      .get("/companies") 
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
      .query({
        name: "c"
      });
    expect(resp.statusCode).toEqual(200);
<<<<<<< HEAD
    expect(resp.body.jobs.length).toEqual(4);
=======
    expect(resp.body.companies.length).toEqual(4);
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
  });

  test("filter by minimum number of employees", async () => {
    const resp = await request(app)
<<<<<<< HEAD
      .get("/jobs")
=======
      .get("/companies")
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
      .query({
        minEmployees: 3
      });
    expect(resp.statusCode).toEqual(200);
<<<<<<< HEAD
    expect(resp.body.jobs.length).toEqual(2);
=======
    expect(resp.body.companies.length).toEqual(2);
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
  });
  
  test("filter by maximum number of employees", async () => {
    const resp = await request(app)
<<<<<<< HEAD
      .get("/jobs")
=======
      .get("/companies")
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
      .query({
        maxEmployees: 1
      });
    expect(resp.statusCode).toEqual(200);
<<<<<<< HEAD
    expect(resp.body.jobs.length).toEqual(1);
  });
  test("filter by min and max number of employees", async () => {
    const resp = await request(app)
      .get("/jobs")
=======
    expect(resp.body.companies.length).toEqual(1);
  });
  test("filter by min and max number of employees", async () => {
    const resp = await request(app)
      .get("/companies")
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
      .query({
        minEmployees: 1,
        maxEmployees: 2
      });
    expect(resp.statusCode).toEqual(200);
<<<<<<< HEAD
    expect(resp.body.jobs.length).toEqual(2);
  });
  test("valid data but zero results", async() => {
    const resp = await request(app)
      .get("/jobs")
=======
    expect(resp.body.companies.length).toEqual(2);
  });
  test("valid data but zero results", async() => {
    const resp = await request(app)
      .get("/companies")
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
      .query({
        name: "fish"
      });
    expect(resp.statusCode).toEqual(200);
<<<<<<< HEAD
    expect(resp.body.jobs.length).toEqual(0);
  });
  test("invalid data: min >= max", async () => {
    const badResp = await request(app)
      .get("/jobs")
=======
    expect(resp.body.companies.length).toEqual(0);
  });
  test("invalid data: min >= max", async () => {
    const badResp = await request(app)
      .get("/companies")
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
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

<<<<<<< HEAD
/************************************** GET /jobs/:handle */

describe("GET /jobs/:handle", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/c1`);
    expect(resp.body.job).toEqual({
=======
/************************************** GET /companies/:handle */

describe("GET /companies/:handle", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/companies/c1`);
    expect(resp.body.company).toEqual({
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
      handle: "c1",
      name: "C1",
      description: "Desc1",
      numEmployees: 1,
      logoUrl: "http://c1.img",
    });
    expect(resp.body.jobs.length).toEqual(1);
    expect(resp.body.jobs).toEqual([
      {
        id: expect.any(Number),
        title: "job1",
        salary: 100000,
        equity: "0.010",
<<<<<<< HEAD
        job_handle: "c1"
=======
        company_handle: "c1"
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
      }
    ]);
  });

<<<<<<< HEAD
  test("works for anon: job w/o jobs", async function () {
    const resp = await request(app).get(`/jobs/c4`);
    expect(resp.body.job).toEqual({
=======
  test("works for anon: company w/o jobs", async function () {
    const resp = await request(app).get(`/companies/c4`);
    expect(resp.body.company).toEqual({
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
      handle: "c4",
      name: "C4",
      description: "Desc4",
      numEmployees: 4,
      logoUrl: "http://c4.img",
    });
  });

<<<<<<< HEAD
  test("not found for no such job", async function () {
    const resp = await request(app)
      .get(`/jobs/nope`);
=======
  test("not found for no such company", async function () {
    const resp = await request(app)
      .get(`/companies/nope`);
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
      expect(resp.statusCode).toEqual(404);
  });
});

<<<<<<< HEAD
/************************************** PATCH /jobs/:handle */

describe("PATCH /jobs/:handle", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .patch(`/jobs/c1`)
        .send({
          job: {
=======
/************************************** PATCH /companies/:handle */

describe("PATCH /companies/:handle", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          company: {
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
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
<<<<<<< HEAD
      job: {
=======
      company: {
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
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
<<<<<<< HEAD
        .patch(`/jobs/c1`)
=======
        .patch(`/companies/c1`)
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
        .send({
          name: "C1-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

<<<<<<< HEAD
  test("non-existent job not found", async function () {
    const resp = await request(app)
        .patch(`/jobs/nope`)
=======
  test("non-existent company not found", async function () {
    const resp = await request(app)
        .patch(`/companies/nope`)
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
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
<<<<<<< HEAD
        .patch(`/jobs/c1`)
        .send({
          job: {
=======
        .patch(`/companies/c1`)
        .send({
          company: {
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
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
<<<<<<< HEAD
        .patch(`/jobs/c1`)
        .send({
          job: {
=======
        .patch(`/companies/c1`)
        .send({
          company: {
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
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

<<<<<<< HEAD
/************************************** DELETE /jobs/:handle */

describe("DELETE /jobs/:handle", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .delete(`/jobs/c1`)
=======
/************************************** DELETE /companies/:handle */

describe("DELETE /companies/:handle", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .delete(`/companies/c1`)
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
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
<<<<<<< HEAD
        .delete(`/jobs/c1`);
=======
        .delete(`/companies/c1`);
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a

    expect(resp.statusCode).toEqual(401);
  });

<<<<<<< HEAD
  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/nope`)
=======
  test("not found for no such company", async function () {
    const resp = await request(app)
        .delete(`/companies/nope`)
>>>>>>> 0b0d626f1d59f4aef1660d97f5e816edf497ca4a
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
