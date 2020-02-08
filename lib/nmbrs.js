const soap = require('soap');

const COMPANY_WSDL_URL = 'https://api.nmbrs.nl/soap/v2.1/CompanyService.asmx?WSDL';
const EMPLOYEE_WSDL_URL = 'https://api.nmbrs.nl/soap/v2.1/EmployeeService.asmx?WSDL';

class Nmbrs {
  constructor (username, password) {
    this.companyService = this.createClient(COMPANY_WSDL_URL, username, password);
    this.employeeService = this.createClient(EMPLOYEE_WSDL_URL, username, password);
  }

  createClient (WSDL, username, password) {
    return soap.createClientAsync(WSDL)
      .then((client) => {
        client.addSoapHeader(`
            <AuthHeader xmlns="${WSDL.replace('.asmx?WSDL', '')}">
                <Username>${username}</Username>
                <Token>${password}</Token>
            </AuthHeader>
        `);

        return client;
      });
  }

  getAllCompanies () {
    return this.companyService
      .then((companyService) => {
        return companyService.List_GetAllAsync()
          .then((result) => result[0].List_GetAllResult ? result[0].List_GetAllResult.Company : []);
      });
  }

  getEmployees (CompanyId) {
    return this.employeeService
      .then((employeeService) => {
        return employeeService.List_GetByCompanyAsync({
          CompanyId,
          active: 'active'
        })
          .then((result) => result[0].List_GetByCompanyResult ? result[0].List_GetByCompanyResult.Employee : []);
      });
  }

  getAbsence (EmployeeId) {
    return this.employeeService
      .then((employeeService) => {
        return employeeService.Absence_GetListAsync({
          EmployeeId
        })
          .then((result) => result[0].Absence_GetListResult ? result[0].Absence_GetListResult.Absence : []);
      });
  }
}

module.exports = Nmbrs;
