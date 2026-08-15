import HomeClient from './HomeClient';
import { connectDB } from '@/lib/db';
import HomeConfig from '@/models/HomeConfig';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getHomeConfig() {
  try {
    await connectDB();
    const config = await HomeConfig.findOne().lean();
    if (config) {
      return JSON.parse(JSON.stringify(config));
    }
  } catch (err) {
    console.error('Error fetching HomeConfig in HomePage SSR:', err);
  }
  return null;
}

export default async function HomePage() {
  const homeData = await getHomeConfig();
  return <HomeClient initialHomeData={homeData} />;
}
