const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');

const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const productRoutes = require('./routes/product.routes');
const uploadRoutes = require('./routes/upload.routes');
const serviceRoutes = require('./routes/service.routes');
const inquiryRoutes = require('./routes/inquiry.routes');
const authRoutes = require('./routes/auth.routes');
const miscRoutes = require('./routes/misc.routes');
const aboutRoutes = require('./routes/about.routes');
const contactRoutes = require('./routes/contact.routes');
const AppError = require('./utils/AppError');

const app = express();

// Behind Render's load balancer / Vercel edge — needed for correct
// req.ip (rate limiting) and secure cookies over HTTPS.
app.set('trust proxy', 1);

// ---- Security middleware ----
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", process.env.CLIENT_URL || '*'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL, // exact frontend origin only (no wildcard) so cookies work
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  })
);

app.use(express.json({ limit: '10kb' })); // small limit mitigates JSON-bomb DoS
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(mongoSanitize()); // strips $ / . operators from user input -> NoSQL injection protection
app.use(xssClean()); // sanitizes req.body/query/params against script injection
app.use(hpp()); // prevents HTTP parameter pollution
app.use(compression()); // gzip responses -> faster under load
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api/v1', apiLimiter);

// ---- Routes ----
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/about', aboutRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1', miscRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

module.exports = app;
