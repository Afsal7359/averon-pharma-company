import { getSiteSettings } from '@/lib/data';
import SettingsManager from './SettingsManager';

export default async function SettingsPage() {
  const settings = await getSiteSettings();
  return <SettingsManager initial={settings} />;
}
