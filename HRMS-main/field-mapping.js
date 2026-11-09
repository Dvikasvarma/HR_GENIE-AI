/**
 * field-mapping.js
 * ----------------
 * Provides bi-directional mapping between SharePoint list column names
 * (employee_users list) and the HTML element IDs used across HRMS pages.
 *
 * SharePoint list: https://adityagroup.sharepoint.com/sites/HRMS/Lists/employee_users
 * Columns: EmpID, Name, Email, Password, Role, Department, Designation, Phone, Status
 *
 * Usage:
 *   const uiData  = FieldMapping.mapSharePointToUI(spData);
 *   const spData  = FieldMapping.mapUIToSharePoint(uiData);
 */
(function () {
  'use strict';

  // ── SharePoint column → array of UI element IDs ──────────────────────
  var SP_TO_UI = {
    EmpID:       ['prof-staff-code', 'profile-code', 'code'],
    Name:        ['name', 'prof-name', 'sidebar-name', 'main-name', 'profile-name', 'sidebar-profile-name'],
    Email:       ['val-email', 'prof-email', 'email'],
    Role:        ['role', 'prof-desig', 'main-role'],
    Department:  ['prof-dept', 'dept', 'profile-dept'],
    Designation: ['role'],          // alias for Role in dashboard context
    Phone:       ['val-mobile', 'prof-mobile'],
    Status:      ['status']
  };

  // ── Reverse map: UI element ID → SharePoint column ───────────────────
  // Built automatically from SP_TO_UI. When several SP columns map to the
  // same UI id, the LAST one wins (e.g. "role" → "Designation").
  var UI_TO_SP = {};
  Object.keys(SP_TO_UI).forEach(function (spCol) {
    SP_TO_UI[spCol].forEach(function (uiId) {
      UI_TO_SP[uiId] = spCol;
    });
  });

  // ── All known UI element IDs (pass-through list) ─────────────────────
  // Fields that appear in the HTML pages but do NOT have a corresponding
  // column in the basic SharePoint employee_users list.  They are passed
  // through as-is so they can be stored as additional SharePoint columns
  // when / if those columns exist.
  var PASSTHROUGH_UI_IDS = [
    // Profile page
    'main-college', 'val-dob', 'val-aadhaar', 'val-pin',
    'val-dno', 'val-street', 'val-city',
    'val-edu-1-deg', 'val-edu-1-inst', 'val-edu-1-cgpa', 'val-10th-year-of-pass',
    'val-edu-2-deg', 'val-edu-2-inst', 'val-edu-2-cgpa', 'val-inter-year-of-pass',
    'val-edu-3-deg', 'val-edu-3-inst', 'val-edu-3-cgpa', 'val-btech-year-of-pass',
    // Data page
    'prof-college', 'prof-doj', 'prof-staff-type', 'prof-alt-mobile', 'prof-alt-email',
    'pers-mother-tongue', 'pers-dob', 'pers-caste', 'pers-religion',
    'pers-orig-dob', 'pers-gender',
    'addr-perm-door', 'addr-perm-street', 'addr-perm-city',
    'addr-perm-state', 'addr-perm-country', 'addr-perm-zip',
    'ssc-year', 'ssc-inst', 'ssc-perc',
    'inter-year', 'inter-inst', 'inter-perc',
    'id-aadhar-no', 'sm-wa', 'sm-in',
    // Self-details page
    'profile-asset'
  ];

  /**
   * mapSharePointToUI
   * Takes a raw SharePoint response object (keyed by SP column names) and
   * returns an object keyed by ALL known HTML element IDs.
   *
   * @param  {Object} spData  – e.g. { EmpID: "E001", Name: "Alice", … }
   * @return {Object}         – e.g. { "prof-staff-code": "E001", "name": "Alice", … }
   */
  function mapSharePointToUI(spData) {
    if (!spData || typeof spData !== 'object') return {};

    var result = {};

    // 1. Map known SharePoint columns → their UI element IDs
    Object.keys(SP_TO_UI).forEach(function (spCol) {
      if (spData[spCol] !== undefined) {
        SP_TO_UI[spCol].forEach(function (uiId) {
          result[uiId] = spData[spCol];
        });
      }
    });

    // 2. Pass-through fields: if the SP response happens to contain a key
    //    that matches a pass-through UI ID, copy it directly.
    PASSTHROUGH_UI_IDS.forEach(function (uiId) {
      if (spData[uiId] !== undefined) {
        result[uiId] = spData[uiId];
      }
    });

    // 3. Any remaining keys in spData that are not already mapped get
    //    passed through as-is (future-proof for new columns).
    Object.keys(spData).forEach(function (key) {
      if (result[key] === undefined && !SP_TO_UI[key]) {
        result[key] = spData[key];
      }
    });

    return result;
  }

  /**
   * mapUIToSharePoint
   * Takes form data keyed by HTML element IDs and returns an object
   * keyed by SharePoint column names.
   *
   * @param  {Object} uiData  – e.g. { "prof-staff-code": "E001", "val-dob": "1990-01-01", … }
   * @return {Object}         – e.g. { EmpID: "E001", "val-dob": "1990-01-01", … }
   */
  function mapUIToSharePoint(uiData) {
    if (!uiData || typeof uiData !== 'object') return {};

    var result = {};

    Object.keys(uiData).forEach(function (uiId) {
      if (UI_TO_SP[uiId]) {
        // Mapped field → use the SharePoint column name
        result[UI_TO_SP[uiId]] = uiData[uiId];
      } else {
        // Unmapped / pass-through field → keep the key as-is
        result[uiId] = uiData[uiId];
      }
    });

    return result;
  }

  // ── Expose on window ─────────────────────────────────────────────────
  window.FieldMapping = {
    mapSharePointToUI: mapSharePointToUI,
    mapUIToSharePoint: mapUIToSharePoint
  };
})();
