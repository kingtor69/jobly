"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
    static async create( { title, salary, equity, companyHandle } ) {
        const duplicateCheck = await db.query(
            `SELECT title, salary, equity, company_handle 
            FROM jobs 
            WHERE title = $1
            AND salary = $2
            AND equity = $3
            AND company_handle = $4`,
            [ title, salary, equity, companyHandle ]);
        
        if (duplicateCheck.rows.length !== 0) {
            throw new BadRequestError(`Duplicate job: ${duplicateCheck.rows[0]}`);
        }
  
        const newJob = await db.query(
            `INSERT INTO jobs
            ( title, salary, equity, company_handle )
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity,
            company_handle`,
            [ title, salary, equity, companyHandle ]
        );

        const job = newJob.rows[0];
        job.companyHandle = job.company_handle;
        delete(job.company_handle);
        return job;
    };

    static async findAll(search={}) {
        // do something with search object

        const allJobs = await db.query(
            `SELECT id, title, salary, equity, company_handle
            FROM jobs`
        );
        
        return allJobs.rows;
    };
};

module.exports = Job;