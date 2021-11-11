"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db");
const Job = require("./job");
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

describe("create", function () {
  const newJob = {
    title: "new job",
    salary: 1000000000,
    equity: "0.100",
    companyHandle: "c3"
  };

  test("create new job works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: newJob.title,
      companyHandle: newJob.companyHandle,
      equity: newJob.equity,
      salary: newJob.salary
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = $1`, 
           [ job.id ]);
    const confirmedJob = result.rows[0];
    confirmedJob.companyHandle = confirmedJob.company_handle;
    delete(confirmedJob.company_handle);
    expect(result.rows[0]).toEqual({
      companyHandle: newJob.companyHandle,
      equity: newJob.equity,
      id: expect.any(Number),
      salary: newJob.salary,
      title: newJob.title
    });
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    const jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "job1",
        salary: 100000,
        equity: "0.010",
        company_handle: "c1"
      },
      {
        id: expect.any(Number),
        title: "job2",
        salary: 200000,
        equity: "0.020",
        company_handle: "c2"
      },
      {
        id: expect.any(Number),
        title: "job3",
        salary: 300000,
        equity: "0.030",
        company_handle: "c3"
      }
    ]);
  });
  test("works with 'job' filter", async () => {
    const filter = {
      title: "job" 
    };
    const jobs = await Job.findAll(filter);
    expect(jobs.length).toEqual(3);
  });
  test("works with salary >= 250000", async() => {
    const filter = {
      salaryMin: 250000
    };
    const jobs = await Job.findAll(filter);
    expect(jobs[0].salary).toEqual(300000);
  });
  test("works with equity >= 0.015 & <= 0.025", async() => {
    const filter = {
      equityMin: 0.015,
      equityMax: 0.025
    };
    const jobs = await Job.findAll(filter);
    expect(jobs[0].equity).toEqual("0.020");
  });
  test("works with companyHandle filter", async() => {
    const filter = {
      companyHandle: "c3"
    };
    const jobs = await Job.findAll(filter);
    expect(jobs.length).toEqual(1);
    expect(jobs[0].salary).toEqual(300000);
  });
});

/************************************** get */

// describe("get", function () {
//   test("works", async function () {
//     let job = await Job.get("c1");
//     expect(job).toEqual({
//       handle: "c1",
//       name: "C1",
//       description: "Desc1",
//       numEmployees: 1,
//       logoUrl: "http://c1.img",
//     });
//   });

//   test("not found if no such job", async function () {
//     try {
//       await Job.get("nope");
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });

/************************************** update */

// describe("update", function () {
//   const updateData = {
//     name: "New",
//     description: "New Description",
//     numEmployees: 10,
//     logoUrl: "http://new.img",
//   };

//   test("works", async function () {
//     let job = await Job.update("c1", updateData);
//     expect(job).toEqual({
//       handle: "c1",
//       ...updateData,
//     });

//     const result = await db.query(
//           `SELECT handle, name, description, num_employees, logo_url
//            FROM jobs
//            WHERE handle = 'c1'`);
//     expect(result.rows).toEqual([{
//       handle: "c1",
//       name: "New",
//       description: "New Description",
//       num_employees: 10,
//       logo_url: "http://new.img",
//     }]);
//   });

//   test("works: null fields", async function () {
//     const updateDataSetNulls = {
//       name: "New",
//       description: "New Description",
//       numEmployees: null,
//       logoUrl: null,
//     };

//     let job = await Job.update("c1", updateDataSetNulls);
//     expect(job).toEqual({
//       handle: "c1",
//       ...updateDataSetNulls,
//     });

//     const result = await db.query(
//           `SELECT handle, name, description, num_employees, logo_url
//            FROM jobs
//            WHERE handle = 'c1'`);
//     expect(result.rows).toEqual([{
//       handle: "c1",
//       name: "New",
//       description: "New Description",
//       num_employees: null,
//       logo_url: null,
//     }]);
//   });

//   test("not found if no such job", async function () {
//     try {
//       await Job.update("nope", updateData);
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });

//   test("bad request with no data", async function () {
//     try {
//       await Job.update("c1", {});
//       fail();
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//     }
//   });
// });

/************************************** remove */

// describe("remove", function () {
//   test("works", async function () {
//     await Job.remove("c1");
//     const res = await db.query(
//         "SELECT handle FROM jobs WHERE handle='c1'");
//     expect(res.rows.length).toEqual(0);
//   });

//   test("not found if no such job", async function () {
//     try {
//       await Job.remove("nope");
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });
