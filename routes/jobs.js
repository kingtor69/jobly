"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

// const jobNewSchema = require("../schemas/jobNew.json");
// const jobUpdateSchema = require("../schemas/jobUpdate.json");
// const jobSearchSchema = require("../schemas/jobSearch.json");

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
    const validation = jsonschema.validate(newJob, jobNewSchema);
    if (!validation.valid) {
      const errs = validation.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    };
    debugger;
    // validation is throwing error 500
    
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
  if (query) {
    if (query.minEmployees !== undefined) query.minEmployees = +query.minEmployees;
    if (query.maxEmployees !== undefined) query.maxEmployees = +query.maxEmployees;
    if (query.minEmployees > query.maxEmployees) {
      return next(new ExpressError("Minimum can not be greater than maximum.", 400))
    };
    const validation = jsonschema.validate(query, jobSearchSchema);
    if (!validation.valid) {
      const errors = result.errors.map(e => e.stack);
      return next(new ExpressError(errors, 400));
    };
  };

  try {
    const jobs = await Job.findAll(query);
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

router.get("/:handle", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.handle);
    const jobs = await Job.findAll({jobHandle: req.params.handle});
    return res.json({ job, jobs });
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

router.patch("/:handle", ensureAdmin, async function (req, res, next) {
  try {
    const comp = await Job.get(req.params.handle);
    delete comp.handle;
    for (let key in req.body.job) {
      comp[key] = req.body.job[key];
    };
    const validation = jsonschema.validate(comp, jobUpdateSchema);
    if (!validation.valid) {
      const errs = validation.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.handle, comp);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

router.delete("/:handle", ensureAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.handle);
    return res.json({ deleted: req.params.handle });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;