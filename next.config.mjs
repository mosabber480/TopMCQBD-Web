/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: '/db-connection',
        destination: '/db-connection-api',
        permanent: false,
      },
      {
        source: '/db-connection/:path*',
        destination: '/db-connection-api/:path*',
        permanent: false,
      },
      {
        source: '/DB',
        destination: '/db-connection-api',
        permanent: false,
      },
      {
        source: '/db',
        destination: '/db-connection-api',
        permanent: false,
      },
      {
        source: '/db-connection-check',
        destination: '/db-connection-api',
        permanent: false,
      },
      // Paid Core Unified & Old Shortcuts
      {
        source: '/dbpaid',
        destination: '/db-connection-api/dbpaid-api',
        permanent: false,
      },
      {
        source: '/dbpaid-api',
        destination: '/db-connection-api/dbpaid-api',
        permanent: false,
      },
      {
        source: '/dbpaid-admin',
        destination: '/db-connection-api/dbpaid-api',
        permanent: false,
      },
      {
        source: '/dbpaid-test',
        destination: '/db-connection-api/dbpaid-api',
        permanent: false,
      },
      {
        source: '/db-connection-api/dbpaid',
        destination: '/db-connection-api/dbpaid-api',
        permanent: false,
      },
      {
        source: '/db-connection-api/dbpaid-admin',
        destination: '/db-connection-api/dbpaid-api',
        permanent: false,
      },
      {
        source: '/db-connection-api/dbpaid-test',
        destination: '/db-connection-api/dbpaid-api',
        permanent: false,
      },

      // Subjective MCQs Unified & Old Shortcuts
      {
        source: '/dbsubjective',
        destination: '/db-connection-api/dbsubjective-api',
        permanent: false,
      },
      {
        source: '/dbsubjective-api',
        destination: '/db-connection-api/dbsubjective-api',
        permanent: false,
      },
      {
        source: '/dbsubjective-admin',
        destination: '/db-connection-api/dbsubjective-api',
        permanent: false,
      },
      {
        source: '/dbsubjective-test',
        destination: '/db-connection-api/dbsubjective-api',
        permanent: false,
      },
      {
        source: '/db-connection-api/dbsubjective',
        destination: '/db-connection-api/dbsubjective-api',
        permanent: false,
      },
      {
        source: '/db-connection-api/dbsubjective-admin',
        destination: '/db-connection-api/dbsubjective-api',
        permanent: false,
      },
      {
        source: '/db-connection-api/dbsubjective-test',
        destination: '/db-connection-api/dbsubjective-api',
        permanent: false,
      },

      // Live Exam Unified & Old Shortcuts
      {
        source: '/dbliveexam',
        destination: '/db-connection-api/dbliveexam-api',
        permanent: false,
      },
      {
        source: '/dbliveexam-api',
        destination: '/db-connection-api/dbliveexam-api',
        permanent: false,
      },
      {
        source: '/dbliveexam-admin',
        destination: '/db-connection-api/dbliveexam-api',
        permanent: false,
      },
      {
        source: '/dbliveexam-test',
        destination: '/db-connection-api/dbliveexam-api',
        permanent: false,
      },
      {
        source: '/db-connection-api/dbliveexam',
        destination: '/db-connection-api/dbliveexam-api',
        permanent: false,
      },
      {
        source: '/db-connection-api/dbliveexam-admin',
        destination: '/db-connection-api/dbliveexam-api',
        permanent: false,
      },
      {
        source: '/db-connection-api/dbliveexam-test',
        destination: '/db-connection-api/dbliveexam-api',
        permanent: false,
      },

      // Written Exam Unified & Old Shortcuts
      {
        source: '/dbwritten',
        destination: '/db-connection-api/dbwritten-api',
        permanent: false,
      },
      {
        source: '/dbwritten-api',
        destination: '/db-connection-api/dbwritten-api',
        permanent: false,
      },
      {
        source: '/dbwritten-admin',
        destination: '/db-connection-api/dbwritten-api',
        permanent: false,
      },
      {
        source: '/dbwritten-test',
        destination: '/db-connection-api/dbwritten-api',
        permanent: false,
      },
      {
        source: '/db-connection-api/dbwritten',
        destination: '/db-connection-api/dbwritten-api',
        permanent: false,
      },
      {
        source: '/db-connection-api/dbwritten-admin',
        destination: '/db-connection-api/dbwritten-api',
        permanent: false,
      },
      {
        source: '/db-connection-api/dbwritten-test',
        destination: '/db-connection-api/dbwritten-api',
        permanent: false,
      },

      // Question Bank Unified & Old Shortcuts
      {
        source: '/dbquestionbank',
        destination: '/db-connection-api/dbquestionbank-api',
        permanent: false,
      },
      {
        source: '/dbquestionbank-api',
        destination: '/db-connection-api/dbquestionbank-api',
        permanent: false,
      },
      {
        source: '/dbquestionbank-admin',
        destination: '/db-connection-api/dbquestionbank-api',
        permanent: false,
      },
      {
        source: '/dbquestionbank-test',
        destination: '/db-connection-api/dbquestionbank-api',
        permanent: false,
      },
      {
        source: '/db-connection-api/dbquestionbank',
        destination: '/db-connection-api/dbquestionbank-api',
        permanent: false,
      },
      {
        source: '/db-connection-api/dbquestionbank-admin',
        destination: '/db-connection-api/dbquestionbank-api',
        permanent: false,
      },
      {
        source: '/db-connection-api/dbquestionbank-test',
        destination: '/db-connection-api/dbquestionbank-api',
        permanent: false,
      },

      // Free MCQ Unified & Old Shortcuts
      {
        source: '/dbfree',
        destination: '/db-connection-api/dbfree-api',
        permanent: false,
      },
      {
        source: '/dbfree-api',
        destination: '/db-connection-api/dbfree-api',
        permanent: false,
      },
      {
        source: '/dbfree-admin',
        destination: '/db-connection-api/dbfree-api',
        permanent: false,
      },
      {
        source: '/dbfree-test',
        destination: '/db-connection-api/dbfree-api',
        permanent: false,
      },
      {
        source: '/db-connection-api/dbfree',
        destination: '/db-connection-api/dbfree-api',
        permanent: false,
      },
      {
        source: '/db-connection-api/dbfree-admin',
        destination: '/db-connection-api/dbfree-api',
        permanent: false,
      },
      {
        source: '/db-connection-api/dbfree-test',
        destination: '/db-connection-api/dbfree-api',
        permanent: false,
      },

      // Cloudflare D1 Unified & Old Shortcuts
      {
        source: '/dbd1',
        destination: '/db-connection-api/dbd1-api',
        permanent: false,
      },
      {
        source: '/dbd1-api',
        destination: '/db-connection-api/dbd1-api',
        permanent: false,
      },
      {
        source: '/dbd1-admin',
        destination: '/db-connection-api/dbd1-api',
        permanent: false,
      },
      {
        source: '/dbd1-test',
        destination: '/db-connection-api/dbd1-api',
        permanent: false,
      },
      {
        source: '/db-connection-api/dbd1',
        destination: '/db-connection-api/dbd1-api',
        permanent: false,
      },
      {
        source: '/db-connection-api/dbd1-admin',
        destination: '/db-connection-api/dbd1-api',
        permanent: false,
      },
      {
        source: '/db-connection-api/dbd1-test',
        destination: '/db-connection-api/dbd1-api',
        permanent: false,
      },
      // Subjective All MCQs Shortcuts
      {
        source: '/paid-subjective-all-mcqs-Practice-success',
        destination: '/subjective-all-mcqs-Practice-success',
        permanent: false,
      },
      {
        source: '/paid-subjective-all-mcqs-practice-success',
        destination: '/subjective-all-mcqs-Practice-success',
        permanent: false,
      },
      {
        source: '/paid-subjective-all-mcqs-Practice-questions',
        destination: '/subjective-all-mcqs-Practice-questions',
        permanent: false,
      },
      {
        source: '/paid-subjective-all-mcqs-practice-questions',
        destination: '/subjective-all-mcqs-Practice-questions',
        permanent: false,
      },
      // Paid Subjective Model Test Shortcuts
      {
        source: '/paidsubjective-model-test',
        destination: '/subjective-model-test',
        permanent: false,
      },
      {
        source: '/paidsubjective-model-test-questions',
        destination: '/subjective-model-test-questions',
        permanent: false,
      },
      {
        source: '/paid-subjective-model-test',
        destination: '/subjective-model-test',
        permanent: false,
      },
      {
        source: '/paid-subjective-model-test-questions',
        destination: '/subjective-model-test-questions',
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
