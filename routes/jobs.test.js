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
const Job = require("../models/job");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "new job",
    salary: 1000000,
    equity: 0.05,
    companyHandle: "c1"
  };

  test("works for admins", async function () {
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
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {companyHandle: newJob.companyHandle, salary: newJob.salary, title: newJob.title, equity: newJob.equity.toString(), id: expect.any(Number)},
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
            equity: "five percent",
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
              id: expect.any(Number),
              title: "job1",
              salary: 100000,
              equity: "0.010",
              companyHandle: "c1"
            },
            {
              id: expect.any(Number),
              title: "job2",
              salary: 200000,
              equity: "0.020",
              companyHandle: "c2"
            },
            {
              id: expect.any(Number),
              title: "job3",
              salary: 300000,
              equity: "0.030",
              companyHandle: "c3"
            }
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
        companyHandle: "c"
      });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs.length).toEqual(3);
  });

  test("filter by minimum salary", async () => {
    const resp = await request(app)
      .get("/jobs")
      .query({
        salaryMin: 250000
      });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs.length).toEqual(1);
  });
  test("filter by maximum salary", async () => {
    const resp = await request(app)
      .get("/jobs")
      .query({
        salaryMax: 150000
      });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs.length).toEqual(1);
  });
  test("filter by min and max salary", async () => {
    const resp = await request(app)
      .get("/jobs")
      .query({
        salaryMin: 99000,
        salaryMax: 250000
      });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs.length).toEqual(2);
  });

  test("filter by minimum equity", async () => {
    const resp = await request(app)
      .get("/jobs")
      .query({
        equityMin: 0.025
      });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs.length).toEqual(1);
  });
  test("filter by maximum equity", async () => {
    const resp = await request(app)
      .get("/jobs")
      .query({
        equityMax: 0.011
      });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs.length).toEqual(1);
  });
  test("filter by min and max equity", async () => {
    const resp = await request(app)
      .get("/jobs")
      .query({
        equityMin: 0.015,
        equityMax: 0.025
      });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs.length).toEqual(1);
  });

  test("valid data but zero results", async() => {
    const resp = await request(app)
      .get("/jobs")
      .query({
        title: "fish"
      });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs.length).toEqual(0);
  });
  test.only("invalid data: salary min >= max", async () => {
    const badResp = await request(app)
      .get("/jobs")
      .query({
        salaryMin: 10000000,
        salaryMax: 10
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
  test("invalid data: equity min >= max", async () => {
    const badResp = await request(app)
      .get("/jobs")
      .query({
        equityMin: 0.5,
        equityMax: 0.05
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
  test("invalid data: equity min out of range", async() => {
    const badResp = await request(app)
      .get('/jobs')
      .query({
        equityMin: -0.2
      })
      .send({
        user: {
          username: "admin",
          isAdmin: true
        }
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(badResp.statusCode.toEqual(400));
  });
  test("invalid data: equity max out of range", async() => {
    const badResp = await request(app)
      .get('/jobs')
      .query({
        equityMax: 1.5
      })
      .send({
        user: {
          username: "admin",
          isAdmin: true
        }
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(badResp.statusCode.toEqual(400));
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
