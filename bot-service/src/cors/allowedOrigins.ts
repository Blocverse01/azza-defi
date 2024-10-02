const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3000',
    'http://localhost:3000/',
    'https://azza-defi-mini-app.vercel.app',
    'https://azza-defi-mini-app.vercel.app/',
    // Add other non-regex origins here
];

export const allowedOriginPatterns = [
    /^https:\/\/azza-defi-mini-app-[a-zA-Z0-9]+blocverse-[a-zA-Z0-9]\.vercel\.app$/,
    /^https:\/\/azza-defi-mini-app-git-[a-zA-Z0-9-]+blocverse-[a-zA-Z0-9]\.vercel\.app$/,
    /^http:\/\/localhost:(\d)+$/,
    /.+\.local$/,
    // Add other patterns as needed
];

export default allowedOrigins;
