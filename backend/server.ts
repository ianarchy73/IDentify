import 'dotenv/config';
import express from 'express';
import {
  POST_emailLogin,
  POST_emailSignup,
  POST_facebookLogin,
  POST_linkFacebook,
  POST_logout,
  POST_refreshToken,
  POST_verifyEmail,
} from './routes';

const app = express();
const port = Number(process.env.API_PORT || 3001);

app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ ok: true });
});

app.post('/api/auth/signup', async (request, response) => {
  response.json(await POST_emailSignup(request.body));
});

app.post('/api/auth/login', async (request, response) => {
  response.json(await POST_emailLogin(request.body));
});

app.post('/api/auth/facebook', async (request, response) => {
  const { accessToken, facebookId, email, name } = request.body;
  response.json(await POST_facebookLogin(accessToken, facebookId, email, name));
});

app.post('/api/auth/verify-email', async (request, response) => {
  const { email, verificationCode } = request.body;
  response.json(await POST_verifyEmail(email, verificationCode));
});

app.post('/api/auth/refresh', async (request, response) => {
  response.json(await POST_refreshToken(request.body.refreshToken));
});

app.post('/api/auth/logout', async (_request, response) => {
  response.json(await POST_logout());
});

app.listen(port, () => {
  console.log(`IDentify API running at http://localhost:${port}`);
});

app.post('/api/auth/facebook/link', async (request, response) => {
  response.json(await POST_linkFacebook(request.body));
});