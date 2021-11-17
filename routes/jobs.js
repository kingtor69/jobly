"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError, NotFoundError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNew = require("../schemas/jobNew.json");
const jobSearch = require("../schemas/jobSearch.json");
const jobUpdate = require("../schemas/jobUpdate.json");

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const newJob = req.body.job;
    const validation = jsonschema.validate(newJob, jobNew);
    if (!validation.valid) {
      const errs = validation.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    };

    // newJob.company_handle = newJob.companyHandle;
    // delete(newJob.companyHandle);
    
    const job = await Job.create(newJob);
    
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  };
});

/** GET /  =>
 *   { jobs: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const query = req.query;
  try {
    if (query) {
      if (query.salaryMin !== undefined) query.salaryMin = +query.salaryMin;
      if (query.salaryMax !== undefined) query.salaryMax = +query.salaryMax;
      if (query.equityMin !== undefined) query.equityMin = +query.equityMin;
      if (query.equityMax !== undefined) query.equityMax = +query.equityMax;

      if (query.salaryMin >= query.salaryMax) {
          throw new ExpressError('Minimum salary can not be greater than maximum.', 400);
      };
      if (query.equityMin >= query.equityMax) {
        throw new ExpressError('Minimum equity can not be greater than maximum.', 400);
      };
      const validation = jsonschema.validate(query, jobSearch);
      if (!validation.valid) {
        const errs = validation.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      };
      if ('companyHandle' in query) {
        query.company_handle = query.companyHandle;
        delete(query.companyHandle);
      };
    };

    const jobs = await Job.findAll(query);
    for (let job of jobs) {
      job.companyHandle = job.company_handle;
      delete(job.company_handle);
    };
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

/** GET /[handle]  =>  { job }
 *
 *  Job is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    let id = +req.params.id;
    if (!id) throw new BadRequestError;
    const job = await Job.getAJob(req.params.id);
    if (!job.job) throw new NotFoundError;
    return res.json(job);
  } catch (err) {
    return next(err);
  };
});

/** PATCH /[handle] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    if ("id" in req.body.job) {
      throw new BadRequestError;
    };
    const jobResp = await Job.getAJob(req.params.id);
    if (!jobResp.job) {
      throw new NotFoundError;
    };
    const updateJob = jobResp.job
    updateJob.equity = +updateJob.equity;
    updateJob.salary = +updateJob.salary;
    for (let key in req.body.job) {
      updateJob[key] = req.body.job[key];
    };
    const validation = jsonschema.validate(updateJob, jobUpdate);
    if (!validation.valid) {
      const errs = validation.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    };
    updateJob.equity = updateJob.equity.toFixed(3);

    const job = await Job.update(req.params.id, updateJob)
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    let id = +req.params.id;
    if (!id) throw new BadRequestError;
    await Job.remove(req.params.id);
    return res.json({ deleted: id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;