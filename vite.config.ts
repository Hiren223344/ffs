import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'recaptcha-backend-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/verify-captcha')) {
            let body = '';
            req.on('data', chunk => {
              body += chunk;
            });
            req.on('end', async () => {
              try {
                const { token, email } = JSON.parse(body);
                
                // If it is the mock token, handle offline sandbox gracefully
                if (!token || token === 'mock-recaptcha-v3-token') {
                  const fallbackScore = (email.toLowerCase().includes('bot') || email.toLowerCase().includes('block') || email.toLowerCase().includes('suspicious'))
                    ? 0.1
                    : 0.9;
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({
                    success: fallbackScore >= 0.6,
                    score: fallbackScore,
                    message: fallbackScore < 0.6
                      ? `Security Block: Connection refused. Session classified as Bot activity (Score: ${fallbackScore}).`
                      : 'Session verified successfully (Mock Mode).'
                  }));
                  return;
                }

                // Core cryptographic request to Google's real siteverify API
                const SECRET_KEY = '6Ldq2QItAAAAADcKZHlzc3zw5N2_1uwkhTamlxjG';
                const verifyResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                  body: `secret=${SECRET_KEY}&response=${token}`
                });

                const data = await verifyResponse.json();

                // Standard reCAPTCHA v3 verification logic:
                if (!data.success) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({
                    success: false,
                    score: 0.0,
                    message: 'Google Verification Failed: Invalid or expired token.'
                  }));
                  return;
                }

                const score = data.score;
                const isHuman = score >= 0.6;

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: isHuman,
                  score: score,
                  message: isHuman
                    ? 'Verification passed: safe connection let through instantly.'
                    : `Verification failed: score is below the strict 0.6 safety threshold (Score: ${score}).`
                }));
              } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: false,
                  score: 0.0,
                  message: 'Internal server verification error.'
                }));
              }
            });
            return;
          }
          next();
        });
      }
    }
  ],
})
