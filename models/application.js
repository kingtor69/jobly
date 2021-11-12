"use strict";

const db = require("../db");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ExpressError
} = require("../expressError");

/** Related functions for applications. */

class Application {
  /** Apply for a job.
   * 
   * a user can apply for a job on their own behalf
   * 
   * or an admin can apply on any user's behalf
   **/

  static async apply( { username, jobId } ) {
    // check if this user has already applied for this job
    const result = await db.query(
        `SELECT username,
                job_id AS "jobId"
          FROM applications
          WHERE username = $1
          AND job_id = $2`,
      [ username, jobId ]
    );
    if (result.rows.length > 0) {
      throw new ExpressError(`User ${username} has already applied for job ${jobId}`, 400);
    };

    const newAppResult = await db.query(
      `INSERT INTO applications
      (username, job_id)
      VALUES ($1, $2)
      RETURNING job_id AS "jobId"`,
      [ username, jobId ]
    );
    
    return { applied: newAppResult.rows[0].jobId };
  };
};

module.exports = Application;
