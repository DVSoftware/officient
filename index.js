require('dotenv').config();

const SQS = require('./lib/sqs');
const Nmbrs = require('./lib/nmbrs');
const { storeUserData } = require('./lib/officient');

[
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_SQS_REGION',
  'AWS_SQS_QUEUE_URL'
].forEach((variable) => {
  if (!process.env[variable]) {
    throw new Error(`Required environment variable '${variable}' is not exported.`);
  }
});

new SQS({
  handleMessage: async (message) => {
    const nmbrs = new Nmbrs(message.user, message.pass);

    const companies = await nmbrs.getAllCompanies();
    return Promise.all(
      companies.map(async (company) => {
        const employees = await nmbrs.getEmployees(company.ID);
        return Promise.all(
          employees.map(async (employee) => {
            const absences = await nmbrs.getAbsence(employee.Id);

            storeUserData(employee, absences, message.group);
          })
        );
      })
    );
  }
});
