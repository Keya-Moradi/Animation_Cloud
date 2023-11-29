'use strict';
const bcrypt = require('bcryptjs');
const {
    Model
} = require('sequelize');
// const { Sequelize } = require('.');
module.exports = (sequelize, DataTypes) => {
    class Record extends Model {

        static associate(models) {
        }
    }
    Record.init({
        userId: {
            type: DataTypes.INTEGER,
        },
        resultsArray: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        }
    }, {
        sequelize,
        modelName: 'Record',
        tableName: 'records',
        timestamps: false
    });
    return Record;
};