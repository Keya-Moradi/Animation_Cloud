const request = require('supertest');
const expect = require('chai').expect;
const nock = require('nock');
const app = require('../server');
const { user, GeneratedVideos } = require('../models');

describe('API Routes', function() {
  let agent;
  let testUser;

  before(async function() {
    // Create test user
    testUser = await user.create({
      name: 'Test User',
      email: 'test@test.com',
      password: 'password123'
    });
  });

  beforeEach(function() {
    agent = request.agent(app);
  });

  after(async function() {
    // Clean up
    await GeneratedVideos.destroy({ where: { userId: testUser.id } });
    await user.destroy({ where: { id: testUser.id } });
  });

  describe('GET /health', function() {
    it('should return healthy status', function(done) {
      request(app)
        .get('/health')
        .expect(200)
        .end((err, res) => {
          expect(res.body.status).to.equal('healthy');
          expect(res.body).to.have.property('timestamp');
          expect(res.body).to.have.property('uptime');
          done();
        });
    });
  });

  describe('POST /api - Video Generation', function() {
    it('should require authentication', function(done) {
      request(app)
        .post('/api')
        .send({ userPrompt: 'Test prompt' })
        .expect(302)
        .end(done);
    });

    it('should reject empty prompt', async function() {
      // Login first
      await agent
        .post('/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        });

      const res = await agent
        .post('/api')
        .send({ userPrompt: '' })
        .expect(400);

      expect(res.body.success).to.equal(false);
      expect(res.body.error).to.include('empty');
    });

    it('should reject prompts over 500 characters', async function() {
      await agent
        .post('/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        });

      const longPrompt = 'a'.repeat(501);
      const res = await agent
        .post('/api')
        .send({ userPrompt: longPrompt })
        .expect(400);

      expect(res.body.success).to.equal(false);
      expect(res.body.error).to.include('500 characters');
    });

    it('should generate video with valid prompt', async function() {
      this.timeout(10000); // Increase timeout for API call

      await agent
        .post('/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        });

      // Mock Gooey API response
      nock('https://api.gooey.ai')
        .post('/v2/DeforumSD/')
        .query(true)
        .reply(200, {
          id: 'test123',
          created_at: new Date().toISOString(),
          output: {
            output_video: 'https://storage.googleapis.com/test/video.mp4'
          }
        });

      const res = await agent
        .post('/api')
        .send({ userPrompt: 'White tiger in New York' })
        .expect(200);

      expect(res.body.success).to.equal(true);
      expect(res.body.message).to.include('successfully');
      expect(res.body.video).to.have.property('id');
      expect(res.body.video).to.have.property('url');
      expect(res.body.video.prompt).to.equal('White tiger in New York');
    });

    it('should handle external API errors gracefully', async function() {
      await agent
        .post('/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        });

      // Mock API failure
      nock('https://api.gooey.ai')
        .post('/v2/DeforumSD/')
        .query(true)
        .reply(500, { error: 'Internal server error' });

      const res = await agent
        .post('/api')
        .send({ userPrompt: 'Test prompt' })
        .expect(502);

      expect(res.body.success).to.equal(false);
      expect(res.body.error).to.include('External API error');
    });
  });

  describe('DELETE /api/videos/:id', function() {
    let testVideo;

    beforeEach(async function() {
      testVideo = await GeneratedVideos.create({
        userId: testUser.id,
        videoUrl: 'https://test.com/video.mp4',
        videoName: 'Test Video',
        status: 'completed'
      });
    });

    it('should require authentication', function(done) {
      request(app)
        .delete(`/api/videos/${testVideo.id}`)
        .expect(302)
        .end(done);
    });

    it('should delete user\'s own video', async function() {
      await agent
        .post('/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        });

      const res = await agent
        .delete(`/api/videos/${testVideo.id}`)
        .expect(200);

      expect(res.body.success).to.equal(true);
      expect(res.body.message).to.include('deleted successfully');

      // Verify video is deleted
      const deletedVideo = await GeneratedVideos.findByPk(testVideo.id);
      expect(deletedVideo).to.be.null;
    });

    it('should return 404 for non-existent video', async function() {
      await agent
        .post('/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        });

      const res = await agent
        .delete('/api/videos/99999')
        .expect(404);

      expect(res.body.success).to.equal(false);
      expect(res.body.error).to.include('not found');
    });
  });

  describe('Rate Limiting', function() {
    it('should enforce rate limits on /api endpoint', async function() {
      this.timeout(60000);

      await agent
        .post('/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        });

      // Mock successful API responses
      nock('https://api.gooey.ai')
        .post('/v2/DeforumSD/')
        .query(true)
        .times(11) // Allow 11 calls to test the limit
        .reply(200, {
          id: 'test123',
          created_at: new Date().toISOString(),
          output: {
            output_video: 'https://storage.googleapis.com/test/video.mp4'
          }
        });

      // Make 10 requests (should succeed)
      for (let i = 0; i < 10; i++) {
        await agent
          .post('/api')
          .send({ userPrompt: `Test prompt ${i}` })
          .expect(200);
      }

      // 11th request should be rate limited
      const res = await agent
        .post('/api')
        .send({ userPrompt: 'Should be blocked' })
        .expect(429);

      expect(res.text).to.include('Too many');
    });
  });
});
