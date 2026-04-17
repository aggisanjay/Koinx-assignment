'use strict';

const cron = require('node-cron');
const { publishTrigger } = require('../config/nats');

/**
 * Schedules a background job that runs every 15 minutes.
 * On each tick, it publishes a { trigger: "update" } message to the NATS
 * "crypto.update" subject, which the api-server subscribes to and uses to
 * trigger storeCryptoStats().
 *
 * Cron expression: "* /15 * * * *" (every 15 minutes, at :00, :15, :30, :45)
 */
function startTriggerJob() {
  const schedule = '*/15 * * * *';

  const task = cron.schedule(schedule, () => {
    console.log(`[Job] Cron tick — publishing update trigger.`);
    publishTrigger();
  });

  console.log(`[Job] Trigger job scheduled (${schedule}). Next run will be at the next :00, :15, :30, or :45 mark.`);

  return task;
}

module.exports = { startTriggerJob };
