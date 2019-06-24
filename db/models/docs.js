'use strict';
module.exports = (sequelize, DataTypes) => {
  var Docs = sequelize.define('docs', {
    documentid: DataTypes.STRING,
    link: {
        type:DataTypes.STRING
    }
  }, {});
  Docs.associate = function(models) {
    // associations can be defined here
  };
  return Docs;
};
