'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class GeneratedVideos extends Model {
        static associate(models) {
        }
    }
    GeneratedVideos.init({
        userId: {
            type: DataTypes.INTEGER,
        },
        videoUrl: {
            type: DataTypes.STRING,
        },
        videoName: {
            type: DataTypes.STRING,
        }
    }, {
        sequelize,
        modelName: 'GeneratedVideos',
        tableName: 'generatedVideos',
        timestamps: false
    });
    return GeneratedVideos;
};