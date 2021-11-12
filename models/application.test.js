"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const Application = require("./application.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("../routes/_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** apply */

describe("apply", function () {
  test("works for user", async function () {
    // first get the jobId for "job1"
    const job = await db.query(
        `SELECT id
        FROM jobs
        WHERE title = $1`,
        [ "job1" ]
    );
    const jobId = job.rows[0].id
    const jobApp = await Application.apply("u1", jobId);
    expect(jobApp).toEqual({
      applied: jobId
    });
  });
});
