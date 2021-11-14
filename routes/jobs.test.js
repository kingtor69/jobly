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
          user: {
            username: "admin",
            isAdmin: true
          }
        })
        .set("authorization", `Bearer ${adminToken}`);
    // expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: newJob,
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          job: {
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
        .post("/jobs")
        .send({
          job: {
            ...newJob,
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

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
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
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
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

describe("Filtering GET jobs results", () => {
  test("filter by part of name", async () => {
    const resp = await request(app)
      .get("/jobs") 
      .query({
        name: "c"
      });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs.length).toEqual(4);
  });

  test("filter by minimum number of employees", async () => {
    const resp = await request(app)
      .get("/jobs")
      .query({
        minEmployees: 3
      });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs.length).toEqual(2);
  });
  
  test("filter by maximum number of employees", async () => {
    const resp = await request(app)
      .get("/jobs")
      .query({
        maxEmployees: 1
      });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs.length).toEqual(1);
  });
  test("filter by min and max number of employees", async () => {
    const resp = await request(app)
      .get("/jobs")
      .query({
        minEmployees: 1,
        maxEmployees: 2
      });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs.length).toEqual(2);
  });
  test("valid data but zero results", async() => {
    const resp = await request(app)
      .get("/jobs")
      .query({
        name: "fish"
      });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs.length).toEqual(0);
  });
  test("invalid data: min >= max", async () => {
    const badResp = await request(app)
      .get("/jobs")
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

/************************************** GET /jobs/:handle */

describe("GET /jobs/:handle", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/c1`);
    expect(resp.body.job).toEqual({
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
        job_handle: "c1"
      }
    ]);
  });

  test("works for anon: job w/o jobs", async function () {
    const resp = await request(app).get(`/jobs/c4`);
    expect(resp.body.job).toEqual({
      handle: "c4",
      name: "C4",
      description: "Desc4",
      numEmployees: 4,
      logoUrl: "http://c4.img",
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .get(`/jobs/nope`);
      expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:handle */

describe("PATCH /jobs/:handle", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .patch(`/jobs/c1`)
        .send({
          job: {
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
      job: {
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
        .patch(`/jobs/c1`)
        .send({
          name: "C1-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("non-existent job not found", async function () {
    const resp = await request(app)
        .patch(`/jobs/nope`)
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
        .patch(`/jobs/c1`)
        .send({
          job: {
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
        .patch(`/jobs/c1`)
        .send({
          job: {
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

/************************************** DELETE /jobs/:handle */

describe("DELETE /jobs/:handle", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .delete(`/jobs/c1`)
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
        .delete(`/jobs/c1`);

    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/nope`)
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
