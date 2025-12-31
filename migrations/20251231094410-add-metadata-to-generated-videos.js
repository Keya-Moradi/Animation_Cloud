'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('generatedVideos', 'status', {
      type: Sequelize.STRING,
      defaultValue: 'completed',
      allowNull: true
    });

    await queryInterface.addColumn('generatedVideos', 'createdAt', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('generatedVideos', 'status');
    await queryInterface.removeColumn('generatedVideos', 'createdAt');
  }
};
