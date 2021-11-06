"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
    static async create( { title, salary, equity, company_handle } ) {
        const newJob = await db.query(
            `INSERT INTO jobs
            ( title, salary, equity, company_handle )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, title, salary, equity,
            company_handle AS companyHandle`,
            [ title, salary, equity, company_handle ]
        );

        const job = result.rows[0];
        return job;
    };
};

module.exports = Company;