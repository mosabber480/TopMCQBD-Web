import HomeClient from './HomeClient';
import homeConfigData from '@/data/home-config.json';

export default function HomePage() {
  return <HomeClient initialHomeData={homeConfigData} />;
}


