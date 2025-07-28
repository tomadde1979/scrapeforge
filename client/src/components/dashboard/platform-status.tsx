import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const platforms = [
  {
    name: 'Instagram',
    icon: '📷',
    status: 'active',
    color: 'text-pink-500',
  },
  {
    name: 'LinkedIn',
    icon: '💼',
    status: 'active',
    color: 'text-blue-600',
  },
  {
    name: 'Reddit',
    icon: '🔴',
    status: 'rate_limited',
    color: 'text-orange-500',
  },
  {
    name: 'Twitter',
    icon: '🐦',
    status: 'disabled',
    color: 'text-blue-400',
  },
];

const statusConfig = {
  active: {
    label: 'Active',
    variant: 'default' as const,
    dotColor: 'bg-green-500',
  },
  rate_limited: {
    label: 'Rate Limited',
    variant: 'secondary' as const,
    dotColor: 'bg-yellow-500',
  },
  disabled: {
    label: 'Disabled',
    variant: 'outline' as const,
    dotColor: 'bg-gray-500',
  },
};

export default function PlatformStatus() {
  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">Platform Status</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {platforms.map((platform) => {
            const config = statusConfig[platform.status as keyof typeof statusConfig];
            
            return (
              <div key={platform.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{platform.icon}</span>
                  <span className="text-sm font-medium">{platform.name}</span>
                </div>
                <Badge variant={config.variant} className="text-xs">
                  <div className={`w-1.5 h-1.5 ${config.dotColor} rounded-full mr-1`}></div>
                  {config.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
