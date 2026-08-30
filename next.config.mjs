/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: '/DB',
        destination: '/db-connection',
        permanent: false,
      },
      {
        source: '/db',
        destination: '/db-connection',
        permanent: false,
      },
      {
        source: '/db-connection-check',
        destination: '/db-connection',
        permanent: false,
      },
      // Paid Core Shortcuts
      {
        source: '/dbpaid-admin',
        destination: '/db-connection/dbpaid-admin',
        permanent: false,
      },
      {
        source: '/dbpaid-test',
        destination: '/db-connection/dbpaid-test',
        permanent: false,
      },
      // Subjective MCQs Shortcuts
      {
        source: '/dbsubjective-admin',
        destination: '/db-connection/dbsubjective-admin',
        permanent: false,
      },
      {
        source: '/dbsubjective-test',
        destination: '/db-connection/dbsubjective-test',
        permanent: false,
      },
      // Live Exam Shortcuts
      {
        source: '/dbliveexam-admin',
        destination: '/db-connection/dbliveexam-admin',
        permanent: false,
      },
      {
        source: '/dbliveexam-test',
        destination: '/db-connection/dbliveexam-test',
        permanent: false,
      },
      // Written Exam Shortcuts
      {
        source: '/dbwritten-admin',
        destination: '/db-connection/dbwritten-admin',
        permanent: false,
      },
      {
        source: '/dbwritten-test',
        destination: '/db-connection/dbwritten-test',
        permanent: false,
      },
      // Free MCQ Shortcuts
      {
        source: '/dbfree-admin',
        destination: '/db-connection/dbfree-admin',
        permanent: false,
      },
      {
        source: '/dbfree-test',
        destination: '/db-connection/dbfree-test',
        permanent: false,
      },
      // Cloudflare D1 Shortcuts
      {
        source: '/dbd1-admin',
        destination: '/db-connection/dbd1-admin',
        permanent: false,
      },
      {
        source: '/dbd1-test',
        destination: '/db-connection/dbd1-test',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
