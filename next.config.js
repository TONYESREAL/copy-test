/** @type {import('next').NextConfig} */

const withTM = require('next-transpile-modules')(['@fullcalendar/common', '@fullcalendar/react', '@fullcalendar/timegrid', '@fullcalendar/daygrid']);
const nextConfig = withTM({
    reactStrictMode: true,
    trailingSlash: true,
    basePath: process.env.NODE_ENV === 'production' ? '' : '',
    publicRuntimeConfig: {
        contextPath: process.env.NODE_ENV === 'production' ? '' : '',
        uploadPath: process.env.NODE_ENV === 'production' ? '/api/upload' : '/api/upload'
    }
});

module.exports = nextConfig;
