'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('generatedVideos', 'id', {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('generatedVideos', 'id');
  }
};
