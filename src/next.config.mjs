/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
              protocol: 'https',
              hostname: 'm.media-amazon.com',
            },
            {
              protocol: 'https',
              hostname: 'mdbproductsbucket.s3.us-east-2.amazonaws.com',
            },
            {
              protocol: 'https',
              hostname: 'product-description-generator.s3.us-east-1.amazonaws.com',
            },
          ],
        domains: [
            "m.media-amazon.com", 
            "mdbproductsbucket.s3.us-east-2.amazonaws.com", 
            "product-description-generator.s3.us-east-1.amazonaws.com"
        ]
    },
    experimental: {
        serverActions: true,
      },
};

export default nextConfig;
