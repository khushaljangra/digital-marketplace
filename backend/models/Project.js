import mongoose from 'mongoose';

const versionSchema = new mongoose.Schema({
  version: {
    type: String,
    required: true, // e.g. "v1.0.0", "v1.1.0"
  },
  fileKey: {
    type: String,
    default: '',
  },
  fileName: {
    type: String,
    default: 'external-link',
  },
  releaseNotes: {
    type: String,
    default: 'Initial release',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a project title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      enum: ['source-code', 'templates', 'pdfs', 'graphics', 'datasets', 'others'],
      default: 'source-code',
    },
    techStack: [
      {
        type: String,
        trim: true,
      },
    ],
    previewUrls: [
      {
        type: String, // URLs of screenshots/videos
      },
    ],
    fileKey: {
      type: String,
      default: '',
    },
    fileName: {
      type: String,
      default: 'external-link',
    },
    fileSize: {
      type: String, // formatted string, e.g. "2.4 MB"
      default: 'Unknown',
    },
    externalDownloadUrl: {
      type: String,
      default: '',
    },
    upiId: {
      type: String,
      default: '',
    },
    versions: [versionSchema],
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5'],
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for search
projectSchema.index({ title: 'text', description: 'text', category: 'text' });

const Project = mongoose.model('Project', projectSchema);
export default Project;
