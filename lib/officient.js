const moment = require('moment');
const fs = require('fs');

function storeUserData (employee, absences, group) {
  const data = {
    group_id: group,
    source_app_internal_id: employee.Id,
    historical_days_off: absences.map(absence => ({
      date: moment(absence.Start).format('YYYY-MM-DD'),
      data: {
        duration_minutes: moment(absence.End).diff(absence.Start, 'minutes'),
        day_off_name: absence.Dossier,
        internal_code: absence.AbsenceId,
        // Could not figure where to pull these out from :(
        type_work: 0,
        type_company_holiday: 0,
        type_holiday: 1
      }
    }))
  };

  fs.writeFileSync(`employees/${employee.Id}.json`, JSON.stringify(data, null, 2));
}

module.exports = {
  storeUserData
};
