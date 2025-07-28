import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Shield, Database, Zap } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">Configure your scraping preferences and platform settings</p>
      </div>

      {/* Legal Disclaimer */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">Legal Disclaimer</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Use responsibly. Only collect publicly visible data. Never store passwords, session cookies, 
                or private login credentials. Don't send automated DMs — only manual message options are provided.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Platform Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2 h-5 w-5" />
              Platform Rate Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span>📷</span>
                  <span className="text-sm font-medium">Instagram</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked />
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
              
              <div className="ml-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <Label>Request Delay (ms)</Label>
                  <Input type="number" defaultValue="2000" className="w-20 h-8" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <Label>Max Profiles/Session</Label>
                  <Input type="number" defaultValue="50" className="w-20 h-8" />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span>💼</span>
                  <span className="text-sm font-medium">LinkedIn</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked />
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
              
              <div className="ml-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <Label>Request Delay (ms)</Label>
                  <Input type="number" defaultValue="3000" className="w-20 h-8" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <Label>Max Profiles/Session</Label>
                  <Input type="number" defaultValue="30" className="w-20 h-8" />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span>🔴</span>
                  <span className="text-sm font-medium">Reddit</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch />
                  <Badge variant="secondary">Rate Limited</Badge>
                </div>
              </div>
              
              <div className="ml-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <Label>Request Delay (ms)</Label>
                  <Input type="number" defaultValue="5000" className="w-20 h-8" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <Label>Max Profiles/Session</Label>
                  <Input type="number" defaultValue="20" className="w-20 h-8" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              AI & Parsing Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Enable AI Email Parsing</Label>
                <Switch defaultChecked />
              </div>
              <p className="text-xs text-gray-500">
                Use OpenAI to detect obfuscated or hidden email addresses
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>AI Confidence Threshold</Label>
              <Input type="number" min="0" max="1" step="0.1" defaultValue="0.7" />
              <p className="text-xs text-gray-500">
                Minimum confidence level (0-1) to accept AI-parsed emails
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>OpenAI API Key</Label>
              <Input type="password" placeholder="sk-..." />
              <p className="text-xs text-gray-500">
                Your OpenAI API key for email parsing (stored securely)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Auto-export Results</Label>
                <Switch />
              </div>
              <p className="text-xs text-gray-500">
                Automatically export results after each scraping session
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Data Retention (days)</Label>
              <Input type="number" defaultValue="90" />
              <p className="text-xs text-gray-500">
                How long to keep scraping results and logs
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <Button variant="outline" className="w-full">
                Export All Data
              </Button>
              <Button variant="destructive" className="w-full">
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Scraping Complete</Label>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Errors & Failures</Label>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Daily Summary</Label>
                <Switch />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Email Address</Label>
              <Input type="email" placeholder="your@email.com" />
              <p className="text-xs text-gray-500">
                Where to send notifications
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Settings</Button>
      </div>
    </div>
  );
}
