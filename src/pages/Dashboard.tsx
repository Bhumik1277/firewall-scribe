import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Server, Shield, AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';
import Navigation from '@/components/Navigation';

const Dashboard = () => {
  // Mock data
  const serverStatus = [
    { id: 1, name: 'Web Server 01', ip: '192.168.1.10', status: 'UP', uptime: '15 days' },
    { id: 2, name: 'Database Server', ip: '192.168.1.11', status: 'UP', uptime: '22 days' },
    { id: 3, name: 'Mail Server', ip: '192.168.1.12', status: 'DOWN', uptime: '0 days' },
    { id: 4, name: 'File Server', ip: '192.168.1.13', status: 'UP', uptime: '8 days' },
  ];

  const firewallRules = [
    { id: 1, source: '0.0.0.0/0', destination: '192.168.1.10', port: '80', action: 'ALLOW', protocol: 'TCP' },
    { id: 2, source: '0.0.0.0/0', destination: '192.168.1.10', port: '443', action: 'ALLOW', protocol: 'TCP' },
    { id: 3, source: '192.168.1.0/24', destination: '192.168.1.11', port: '3306', action: 'ALLOW', protocol: 'TCP' },
    { id: 4, source: '0.0.0.0/0', destination: '0.0.0.0/0', port: '22', action: 'DENY', protocol: 'TCP' },
  ];

  const alerts = [
    { id: 1, type: 'CRITICAL', message: 'Multiple failed login attempts detected', time: '2 min ago', source: '203.0.113.45' },
    { id: 2, type: 'WARNING', message: 'Unusual traffic pattern from suspicious IP', time: '15 min ago', source: '198.51.100.10' },
    { id: 3, type: 'INFO', message: 'Firewall rule updated successfully', time: '1 hour ago', source: 'Admin Console' },
    { id: 4, type: 'CRITICAL', message: 'Port scan detected', time: '2 hours ago', source: '192.0.2.15' },
  ];

  const getStatusIcon = (status: string) => {
    return status === 'UP' ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'CRITICAL': return 'destructive';
      case 'WARNING': return 'default';
      case 'INFO': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold">Security Dashboard</h2>
          <p className="text-muted-foreground">Monitor your infrastructure and security status</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Servers</p>
                  <p className="text-2xl font-bold">3/4</p>
                </div>
                <Server className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Firewall Rules</p>
                  <p className="text-2xl font-bold">{firewallRules.length}</p>
                </div>
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold text-red-600">2</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">System Health</p>
                  <p className="text-2xl font-bold text-green-600">Good</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Server Status */}
          <Card>
            <CardHeader>
              <CardTitle>Server Status</CardTitle>
              <CardDescription>Current status of all monitored servers</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Server</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uptime</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serverStatus.map((server) => (
                    <TableRow key={server.id}>
                      <TableCell className="font-medium">{server.name}</TableCell>
                      <TableCell>{server.ip}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(server.status)}
                          <span>{server.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>{server.uptime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>Recent security events and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                    <Badge variant={getAlertVariant(alert.type) as any} className="mt-1">
                      {alert.type}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">Source: {alert.source}</p>
                        <p className="text-xs text-muted-foreground">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;