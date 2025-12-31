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
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'completed',
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    }, {
        sequelize,
        modelName: 'GeneratedVideos',
        tableName: 'generatedVideos',
        timestamps: true,
        updatedAt: false
    });
    return GeneratedVideos;
};