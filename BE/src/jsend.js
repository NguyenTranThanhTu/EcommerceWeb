const { Messages } = require("./const");

/**
 * @param {object | null} data
 * @returns {{status: 'success', data: object | null}}
 */
function success(data = null, message = Messages.SUCCESS) {
  return {
    status: "success",
    message: message,
    data: data,
  };
}

/**
 * @param {string} message
 * @param {object | null} [data]
 * @returns {{status: 'fail', message: string, data: object | undefined}}
 */
function fail(message = Messages.FAILED, data = null) {
  if (data) {
    return {
      status: "fail",
      message,
      data,
    };
  }
  return {
    status: "fail",
    message,
  };
}

/**
 * @param {string} message
 * @param {object | null} [data]
 * @returns {{status: 'error', message: string, data: object | undefined}}
 */
function error(message = Messages.SERVER_ERROR, data = null) {
  if (data) {
    return {
      status: "error",
      message,
      data,
    };
  }
  return {
    status: "error",
    message,
  };
}

module.exports = {
  success,
  fail,
  error,
};
