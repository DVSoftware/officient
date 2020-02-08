const soap = require('soap');

const COMPANY_WSDL_URL = 'https://api.nmbrs.nl/soap/v2.1/CompanyService.asmx?WSDL';
const EMPLOYEE_WSDL_URL = 'https://api.nmbrs.nl/soap/v2.1/EmployeeService.asmx?WSDL';

/**
 * Class for fetching data from Nmbrs API
 *
 * @class Nmbrs
 */
class Nmbrs {
  /**
   * Creates an instance of Nmbrs.
   *
   * @param {String} username Nmbrs username
   * @param {String} password Nmbrs token
   * @memberof Nmbrs
   */
  constructor (username, password) {
    this.companyService = this.createClient(COMPANY_WSDL_URL, username, password);
    this.employeeService = this.createClient(EMPLOYEE_WSDL_URL, username, password);
  }

  /**
   * Creates a SOAP client
   *
   * @param {String} WSDL WSDL URL
   * @param {String} username Nmbrs username
   * @param {String} password Nmbrs token
   * @returns {Promise} SOAP Client
   * @memberof Nmbrs
   */
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

  /**
   * Get All Companies
   *
   * @returns {Promise<Array>} Array of companies
   * @memberof Nmbrs
   */
  getAllCompanies () {
    return this.companyService
      .then((companyService) => {
        return companyService.List_GetAllAsync()
          .then((result) => result[0].List_GetAllResult ? result[0].List_GetAllResult.Company : []);
      });
  }

  /**
   * Get Employees of a company
   *
   * @param {String} CompanyId Company Id
   * @returns {Promise<Array>} Array of employees
   * @memberof Nmbrs
   */
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

  /**
   * Get Absence of an employee
   *
   * @param {String} EmployeeId
   * @returns {Promise<Array>} Array of absences
   * @memberof Nmbrs
   */
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
