import { Metadata } from 'next';
import { LeafletPreview } from '@/components/leaflet/LeafletPreview';

export const metadata: Metadata = {
    title: 'Class Hub Leaflet',
    description: 'Digital leaflet for Class Hub',
};

export default function LeafletPage() {
    return <LeafletPreview />;
}
