import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// try to import cloudinary if available
let cloudinary: any = null;
try {
  // require to avoid ESM issues
  // @ts-ignore
  cloudinary = require('cloudinary');
} catch (e) {
  cloudinary = null;
}

export async function GET(request: NextRequest) {
  const result: Record<string, any> = {
    mongo: null,
    counts: {},
    cloudinary: null,
    render: null,
    timestamp: new Date().toISOString(),
  };

  try {
    await connectDB();

    // DB stats
    try {
      const db = mongoose.connection.db;
      const stats = await db.command({ dbStats: 1, scale: 1 });
      result.mongo = {
        dbName: db.databaseName,
        stats,
      };

      // collection counts for important collections
      const collections = await db.listCollections().toArray();
      const counts: Record<string, number> = {};
      for (const c of collections) {
        try {
          const coll = db.collection(c.name);
          const count = await coll.estimatedDocumentCount();
          counts[c.name] = count;
        } catch (e) {
          counts[c.name] = -1;
        }
      }
      result.counts = counts;
    } catch (e) {
      result.mongo = { error: String(e) };
    }
  } catch (e) {
    result.mongo = { error: 'Failed to connect to MongoDB: ' + String(e) };
  }

  // Cloudinary usage (if configured)
  try {
    if (cloudinary && process.env.CLOUDINARY_URL) {
      // configure cloudinary
      // @ts-ignore
      cloudinary.v2.config({ url: process.env.CLOUDINARY_URL });
      try {
        // @ts-ignore
        const usage = await cloudinary.v2.api.usage();
        result.cloudinary = usage;
      } catch (err: any) {
        // fallback: try to get resource counts
        try {
          // @ts-ignore
          const resources = await cloudinary.v2.api.resources({ max_results: 1 });
          result.cloudinary = { resourcesSample: resources, note: 'partial' };
        } catch (ee: any) {
          result.cloudinary = { error: String(ee) };
        }
      }
    } else {
      result.cloudinary = { available: false };
    }
  } catch (e) {
    result.cloudinary = { error: String(e) };
  }

  // Render info (if RENDER_API_KEY provided)
  try {
    const renderKey = process.env.RENDER_API_KEY;
    if (renderKey) {
      const headers = { Authorization: `Bearer ${renderKey}` };
      // list services
      const servicesRes = await fetch('https://api.render.com/v1/services', { headers });
      if (servicesRes.ok) {
        const services = await servicesRes.json();
        // for each service get latest deployment
        const servicesSummary = await Promise.all(services.map(async (s: any) => {
          try {
            const deps = await fetch(`https://api.render.com/v1/services/${s.id}/deploys`, { headers });
            if (deps.ok) {
              const djson = await deps.json();
              return { id: s.id, name: s.name, serviceDetails: s, recentDeploy: djson[0] || null };
            }
            return { id: s.id, name: s.name, serviceDetails: s };
          } catch (e) {
            return { id: s.id, name: s.name, error: String(e) };
          }
        }));
        result.render = { services: servicesSummary };
      } else {
        result.render = { error: `Render API returned ${servicesRes.status}` };
      }
    } else {
      result.render = { available: false };
    }
  } catch (e) {
    result.render = { error: String(e) };
  }

  return NextResponse.json({ success: true, data: result });
}
