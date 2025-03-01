// dynamicController.js
const express = require("express");
module.exports = function (app) {
  return function (endpoint, handler) {
    app.get(endpoint, handler); // Simplified handler
  };
};
