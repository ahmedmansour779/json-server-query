const express = require('express');
const cors = require('cors');
const geoip = require('geoip-lite');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket.remoteAddress;

  const geo = geoip.lookup(ip);

  const userAgent = req.headers['user-agent'];
  const language = req.headers['accept-language'];
  const referer = req.headers.referer || 'Direct';

  const isMobile = /mobile/i.test(userAgent);
  const deviceType = isMobile ? 'Mobile' : 'Desktop';

  res.status(200).json({
    success: true,

    // 🔹 بيانات من .env
    env: {
      appName: process.env.APP_NAME,
      environment: process.env.APP_ENV,
      port: process.env.PORT,
      owner: process.env.OWNER
    },

    // 🔹 بيانات العميل
    client: {
      ip,
      location: geo
        ? {
          country: geo.country,
          city: geo.city,
          timezone: geo.timezone,
          latitude: geo.ll[0],
          longitude: geo.ll[1]
        }
        : 'Unknown',
      deviceType,
      userAgent,
      language,
      referer
    },

    // 🔹 بيانات الريكويست
    request: {
      method: req.method,
      url: req.originalUrl,
      headers: {
        host: req.headers.host,
        connection: req.headers.connection
      }
    },

    serverTime: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
