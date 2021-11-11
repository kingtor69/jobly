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
        let query = `
            SELECT id, title, salary, equity, company_handle
            FROM jobs`

        // do something with search
        const filters = [];
        const values = [];
        const { title, salaryMin, salaryMax, equityMin, equityMax, companyHandle } = search;
        if (salaryMin >= salaryMax) {
            throw new ExpressError('Minimum salary can not be greater than maximum.', 400);
        };
        if (salaryMin) {
          values.push(salaryMin);
          filters.push(`salary >= $${values.length}`);
        };
        if (salaryMax) {
          values.push(salaryMax);
          filters.push(`salary <= $${values.length}`);
        };

        if (equityMin >= equityMax) {
            throw new ExpressError('Minimum equity can not be greater than maximum.', 400);
        };
        if (equityMin) {
          values.push(equityMin);
          filters.push(`equity >= $${values.length}`);
        };
        if (equityMax) {
          values.push(equityMax);
          filters.push(`equity <= $${values.length}`);
        };
        
        if (title) {
          values.push(`%${title}%`);
          filters.push(`title ILIKE $${values.length}`)
        };

        if (companyHandle) {
            values.push(companyHandle);
            filters.push(`company_handle = $${values.length}`);
        };
        
        if (filters.length > 0) {
          query += " WHERE " + filters.join(" AND ");
        };
      
        const allJobs = await db.query(query, values);
        return allJobs.rows;
    };
};

module.exports = Job;