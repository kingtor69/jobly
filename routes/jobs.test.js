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
  test("invalid data: salary min >= max", async () => {
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
    expect(badResp.body.error.message).toEqual("Minimum salary can not be greater than maximum.");
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
    expect(badResp.body.error.message).toEqual("Minimum equity can not be greater than maximum.");
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
    expect(badResp.statusCode).toEqual(400);
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
    expect(badResp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs/:handle */

describe("GET /jobs/:handle", function () {
  test("works for anon", async function () {
    const job1 = await db.query(`
      SELECT id, title, salary, equity, company_handle AS "companyHandle" 
      FROM jobs LIMIT 1
    `);
    const job = job1.rows[0];
    const resp = await request(app).get(`/jobs/${job.id}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({job});
  });

  test("not found for no such id", async function () {
    const jobs = await db.query(`
      SELECT id
      FROM jobs
    `);
    let wrongId = 9999;
    let carryOn = 0;
    while (carryOn <= jobs.rows.length) {
      for (let job of jobs.rows) {
        if (job.id === wrongId) {
          wrongId ++;
        } else {
          carryOn ++;
        };
      };
    };
    const resp = await request(app)
      .get(`/jobs/${wrongId}`);
    expect(resp.statusCode).toEqual(404);
  });
  test("bad request if id is formatted incorrectly", async() => {
    const resp = await request(app)
      .get(`/jobs/nope`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** PATCH /jobs/:handle */

describe("PATCH /jobs/:handle", function () {
  test("works for admins", async function () {
    const jobs = await db.query(`
      SELECT id, title, salary, equity, company_handle AS "companyHandle"
      FROM jobs
      LIMIT 1
    `);
    const oldJob = jobs.rows[0];
    const resp = await request(app)
        .patch(`/jobs/${oldJob.id}`)
        .send({
          job: {
            title: "ch-ch-ch-changes1"
          }
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        ...oldJob,
        title: "ch-ch-ch-changes1",
      }
    });
  });

  test("unauth for anon", async function () {
    const jobs = await db.query(`
      SELECT id, title, salary, equity, company_handle AS "companyHandle"
      FROM jobs
      LIMIT 1
    `);
    const oldJob = jobs.rows[0];
    const resp = await request(app)
        .patch(`/jobs/${oldJob.id}`)
        .send({
          job: {
            title: "ch-ch-ch-changes1"
          }
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("non-existent job id not found", async function () {
    const jobs = await db.query(`
      SELECT id
      FROM jobs
    `);
    let wrongId = 9999;
    let carryOn = 0;
    while (carryOn <= jobs.rows.length) {
      for (let job of jobs.rows) {
        if (job.id === wrongId) {
          wrongId ++;
        } else {
          carryOn ++;
        };
      };
    };
    const resp = await request(app)
      .patch(`/jobs/${wrongId}`)
      .send({
        job: {
          title: "ch-ch-ch-changes1"
        }
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const jobs = await db.query(`
      SELECT id, title, salary, equity, company_handle AS "companyHandle"
      FROM jobs
      LIMIT 1
    `);
    const oldJob = jobs.rows[0];
    const resp = await request(app)
      .patch(`/jobs/${oldJob.id}`)
      .send({
        job: {
          id: 28
        }
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const jobs = await db.query(`
      SELECT id, title, salary, equity, company_handle AS "companyHandle"
      FROM jobs
      LIMIT 1
    `);
    const oldJob = jobs.rows[0];
    const resp = await request(app)
      .patch(`/jobs/${oldJob.id}`)
      .send({
        job: {
          salary: "lots"
        }
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:handle */

describe("DELETE /jobs/:handle", function () {
  test.only("works for admins", async function () {
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
