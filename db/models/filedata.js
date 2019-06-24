'use strict';
module.exports = (sequelize, DataTypes) => {
  var filedata = sequelize.define('filedata', {
    documentid: DataTypes.STRING,
    link: DataTypes.STRING
  }, {});
  filedata.associate = function(models) {
    // associations can be defined here
  };
  return filedata;
};