import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import path from 'path';


// Import Routes
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import featureRequestRoutes from './routes/featureRequestRoutes.js';

// Load env vars (load local .env first, and merge parent .env as fallback for Render secret file mounts)
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

// Connect to Database
connectDB();

// Seeding Helper
import User from './models/User.js';
import Project from './models/Project.js';
import Coupon from './models/Coupon.js';

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial marketplace data...');

      // 1. Create Admin User
      const adminUser = await User.create({
        name: 'Marketplace Admin',
        email: 'admin@marketplace.com',
        password: 'admin123', // encrypted automatically by pre-save hook
        role: 'admin',
      });
      console.log('Admin User Created: admin@marketplace.com / admin123');

      // 2. Create Regular User
      const regularUser = await User.create({
        name: 'John Doe',
        email: 'user@marketplace.com',
        password: 'user123',
        role: 'user',
      });
      console.log('Test User Created: user@marketplace.com / user123');

      // 3. Create Sample Projects
      const sampleProjects = [
        {
          title: 'AWS Serverless Image Processor',
          description: 'A serverless pipeline to upload, crop, resize, and optimize images automatically in the cloud. Features AWS Lambda triggers, API Gateway, and secure S3 bucket events.',
          price: 299,
          category: 'source-code',
          techStack: ['AWS Lambda', 'Amazon S3', 'API Gateway', 'Node.js', 'Sharp'],
          previewUrls: [
            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
          ],
          fileKey: 'aws-image-processor.zip',
          fileName: 'aws-image-processor-v1.zip',
          fileSize: '1.8 MB',
          createdBy: adminUser._id,
        },
        {
          title: 'GCP Kubernetes Dev Pipeline (IaC)',
          description: 'A complete Terraform setup to provision a secured Google Kubernetes Engine (GKE) cluster, configured with automated GCP Cloud Build CI/CD triggers.',
          price: 299,
          category: 'source-code',
          techStack: ['Terraform', 'GCP GKE', 'Cloud Build', 'Docker', 'Kubernetes'],
          previewUrls: [
            'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
          ],
          fileKey: 'gcp-gke-pipeline.zip',
          fileName: 'gcp-gke-pipeline-v1.zip',
          fileSize: '2.5 MB',
          createdBy: adminUser._id,
        },
        {
          title: 'Azure Cognitive AI Chat Assistant',
          description: 'Integrate custom Azure OpenAI models into your MERN stack. Includes real-time streaming replies, chat logs preservation in Cosmos DB, and audio transcriptions.',
          price: 299,
          category: 'source-code',
          techStack: ['Azure OpenAI', 'Cosmos DB', 'Node.js', 'React', 'WebSockets'],
          previewUrls: [
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
          ],
          fileKey: 'azure-ai-assistant.zip',
          fileName: 'azure-ai-assistant-v1.zip',
          fileSize: '3.1 MB',
          createdBy: adminUser._id,
        },
        {
          title: 'Firebase Real-Time Collaboration Canvas',
          description: 'A multi-user shared whiteboarding canvas where updates synchronize instantly via Firestore. Perfect for virtual brainstorming workshops.',
          price: 299,
          category: 'templates',
          techStack: ['React', 'Firebase', 'Cloud Firestore', 'HTML5 Canvas'],
          previewUrls: [
            'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
          ],
          fileKey: 'firebase-canvas.zip',
          fileName: 'firebase-canvas-v1.zip',
          fileSize: '1.4 MB',
          createdBy: adminUser._id,
        },
        {
          title: 'AWS CloudFormation VPC & ECS Infrastructure',
          description: 'Production-ready CloudFormation scripts. Provision a highly-available VPC, Public/Private subnets, Application Load Balancers, and an ECS Fargate cluster.',
          price: 299,
          category: 'source-code',
          techStack: ['AWS CloudFormation', 'Amazon VPC', 'ECS Fargate', 'Load Balancer'],
          previewUrls: [
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
          ],
          fileKey: 'aws-ecs-infra.zip',
          fileName: 'aws-ecs-infra-v1.zip',
          fileSize: '1.1 MB',
          createdBy: adminUser._id,
        },
        {
          title: 'GCP Cloud Run Microservices Boilerplate',
          description: 'Containerized Express starter kit configured for Google Cloud Run serverless hosting. Integrates pub/sub messaging patterns and Cloud SQL connections.',
          price: 299,
          category: 'source-code',
          techStack: ['Google Cloud Run', 'Cloud SQL', 'Node.js', 'Pub/Sub', 'Docker'],
          previewUrls: [
            'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
          ],
          fileKey: 'gcp-cloud-run-starter.zip',
          fileName: 'gcp-cloud-run-starter-v1.zip',
          fileSize: '2.0 MB',
          createdBy: adminUser._id,
        },
        {
          title: 'Azure Synapse Serverless ETL Data Pipeline',
          description: 'A step-by-step PDF handbook and pipeline scripts mapping large dataset transfers from Azure Blob Storage into Azure Synapse Analytics pools.',
          price: 299,
          category: 'pdfs',
          techStack: ['Azure Synapse', 'Azure Data Factory', 'Blob Storage', 'SQL Pool'],
          previewUrls: [
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
          ],
          fileKey: 'azure-synapse-guide.pdf',
          fileName: 'Azure-Synapse-ETL-Pipeline.pdf',
          fileSize: '3.4 MB',
          createdBy: adminUser._id,
        },
        {
          title: 'Cloudflare Workers Edge API Gateway Router',
          description: 'Deploy API routers on Cloudflare Workers edge nodes. Minimizes latency using Workers KV caching, JWT checks, and custom subdomain bindings.',
          price: 299,
          category: 'source-code',
          techStack: ['Cloudflare Workers', 'Wrangler CLI', 'Key-Value Caching', 'ES Modules'],
          previewUrls: [
            'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
          ],
          fileKey: 'cf-edge-router.zip',
          fileName: 'cf-edge-router-v1.zip',
          fileSize: '0.8 MB',
          createdBy: adminUser._id,
        },
        {
          title: 'Dockerized Microservices SaaS Boilerplate',
          description: 'A cloud-native starter kit linking Express gateway routing, Redis state synchronization, MongoDB database, and Nginx proxy in Docker containers.',
          price: 299,
          category: 'templates',
          techStack: ['Docker Compose', 'Nginx Proxy', 'Redis Cache', 'Express', 'MongoDB'],
          previewUrls: [
            'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80',
          ],
          fileKey: 'docker-microservices.zip',
          fileName: 'docker-microservices-v1.zip',
          fileSize: '2.8 MB',
          createdBy: adminUser._id,
        },
        {
          title: 'AWS Lambda Secure Custom Authorizer',
          description: 'Implement a token-based JWT custom authorizer for AWS API Gateway. Secures endpoints and routes requests based on user token roles.',
          price: 299,
          category: 'source-code',
          techStack: ['AWS Lambda', 'API Gateway', 'JSON Web Tokens', 'Node.js', 'IAM Policy'],
          previewUrls: [
            'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
          ],
          fileKey: 'aws-lambda-authorizer.zip',
          fileName: 'aws-lambda-authorizer-v1.zip',
          fileSize: '1.2 MB',
          createdBy: adminUser._id,
        },
      ];


      for (const proj of sampleProjects) {
        // Create mock secure physical files for sample downloads so downloading sample items doesn't fail
        const securePath = path.join(path.resolve(), 'uploads', 'secure', proj.fileKey);
        if (!fs.existsSync(path.dirname(securePath))) {
          fs.mkdirSync(path.dirname(securePath), { recursive: true });
        }
        fs.writeFileSync(securePath, `Mock code contents of project: ${proj.title}`);

        const createdProj = await Project.create({
          ...proj,
          versions: [
            {
              version: 'v1.0.0',
              fileKey: proj.fileKey,
              fileName: proj.fileName,
              releaseNotes: 'Initial release',
            },
          ],
        });
        
        // Add a review for MERN Stack E-Commerce from our admin
        const Review = (await import('./models/Review.js')).default;
        await Review.create({
          user: regularUser._id,
          project: createdProj._id,
          rating: 5,
          comment: 'Outstanding template! Very clean code structure and well documented backend setup. Absolute time saver.',
        });
      }
      console.log('Sample Projects and Reviews Seeded Successfully!');

      // 4. Create Sample Coupon
      await Coupon.create({
        code: 'WELCOME30',
        discountType: 'percentage',
        discountValue: 30,
        minOrderAmount: 200,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
        usageLimit: 100,
      });
      console.log('Sample Coupon WELCOME30 (30% Off, min order 200) Created!');
    }
  } catch (error) {
    console.error('Seeding database failed:', error.message);
  }
};

// Execute Seeding on DB connection
import mongoose from 'mongoose';
mongoose.connection.once('open', seedDatabase);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets / public folder if needed
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

// Routes Middleware Mounting
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/feature-requests', featureRequestRoutes);

// Root path handler
app.get('/', (req, res) => {
  res.send('Digital Project Marketplace API is running...');
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API Route Not Found' });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Internal Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
