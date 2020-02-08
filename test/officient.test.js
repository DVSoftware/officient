const fs = require('fs');
const moment = require('moment');

const { storeUserData } = require('../lib/officient');

jest.mock('fs');

test('should create a file with user data and empty calendar', () => {
  storeUserData(
    { Id: 123 }, [], 123
  );

  const testData = {
    group_id: 123,
    source_app_internal_id: 123,
    historical_days_off: []
  };

  expect(fs.writeFileSync).toHaveBeenCalledWith('employees/123.json', JSON.stringify(testData, null, 2));
});

test('should create a file with user data and calendar with events', () => {
  const start = moment();
  const end = moment().add(10, 'minutes');
  storeUserData(
    { Id: 123 },
    [{
      Start: start,
      End: end,
      Dossier: 'test',
      AbsenceId: 123
    }],
    123
  );

  const testData = {
    group_id: 123,
    source_app_internal_id: 123,
    historical_days_off: [{
      date: start.format('YYYY-MM-DD'),
      data: {
        duration_minutes: 10,
        day_off_name: 'test',
        internal_code: 123,
        type_work: 0,
        type_company_holiday: 0,
        type_holiday: 1
      }
    }]
  };

  expect(fs.writeFileSync).toHaveBeenCalledWith('employees/123.json', JSON.stringify(testData, null, 2));
});
