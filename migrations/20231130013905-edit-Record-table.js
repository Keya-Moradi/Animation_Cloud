'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable('records');
    await queryInterface.createTable('generatedVideos', {
      userId: {
        type: Sequelize.INTEGER,
      },
      videoUrl: {
        type: Sequelize.STRING,
      },
      videoName: {
        type: Sequelize.STRING,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};