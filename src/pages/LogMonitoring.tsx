import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, AlertTriangle, Search, Download } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';

interface LogEntry {
  id: number;
  timestamp: string;
  source: string;
  message: string;
  level: string;
  suspicious: boolean;
}

const LogMonitoring = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 1, timestamp: '2024-01-15 14:30:25', source: '192.168.1.10', message: 'User login successful', level: 'INFO', suspicious: false },
    { id: 2, timestamp: '2024-01-15 14:31:12', source: '203.0.113.45', message: 'Multiple failed login attempts detected - unauthorized access attempt', level: 'CRITICAL', suspicious: true },
    { id: 3, timestamp: '2024-01-15 14:32:08', source: '192.168.1.11', message: 'Database connection established', level: 'INFO', suspicious: false },
    { id: 4, timestamp: '2024-01-15 14:33:15', source: '198.51.100.10', message: 'Firewall denied connection attempt - potential attack vector', level: 'WARNING', suspicious: true },
    { id: 5, timestamp: '2024-01-15 14:34:22', source: '192.168.1.12', message: 'System backup completed successfully', level: 'INFO', suspicious: false },
    { id: 6, timestamp: '2024-01-15 14:35:45', source: '192.0.2.15', message: 'Port scan detected from external source - unauthorized reconnaissance', level: 'CRITICAL', suspicious: true },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const suspiciousKeywords = ['unauthorized', 'denied', 'attack', 'failed', 'breach', 'malicious', 'intrusion', 'suspicious'];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      // Simulate file parsing
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim());
        
        const newLogs: LogEntry[] = lines.slice(0, 10).map((line, index) => {
          const isSuspicious = suspiciousKeywords.some(keyword => 
            line.toLowerCase().includes(keyword.toLowerCase())
          );
          
          return {
            id: logs.length + index + 1,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            source: `parsed-${index + 1}`,
            message: line.substring(0, 100) + (line.length > 100 ? '...' : ''),
            level: isSuspicious ? 'WARNING' : 'INFO',
            suspicious: isSuspicious
          };
        });
        
        setLogs(prevLogs => [...newLogs, ...prevLogs]);
        
        toast({
          title: "File Uploaded Successfully",
          description: `Parsed ${newLogs.length} log entries from ${file.name}`,
        });
      };
      
      reader.readAsText(file);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const suspiciousLogs = logs.filter(log => log.suspicious);
  const criticalLogs = logs.filter(log => log.level === 'CRITICAL');

  const getLevelBadge = (level: string, suspicious: boolean) => {
    if (suspicious) {
      return <Badge variant="destructive">SUSPICIOUS</Badge>;
    }
    
    switch (level) {
      case 'CRITICAL':
        return <Badge variant="destructive">CRITICAL</Badge>;
      case 'WARNING':
        return <Badge variant="default" className="bg-orange-100 text-orange-800">WARNING</Badge>;
      case 'INFO':
        return <Badge variant="secondary">INFO</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const exportLogs = () => {
    const csvContent = [
      'Timestamp,Source,Level,Message',
      ...filteredLogs.map(log => 
        `"${log.timestamp}","${log.source}","${log.level}","${log.message.replace(/"/g, '""')}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Log data has been exported to CSV file",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold">Log Monitoring</h2>
          <p className="text-muted-foreground">Upload and analyze security logs for threats</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Logs</p>
                  <p className="text-2xl font-bold">{logs.length}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Suspicious Events</p>
                  <p className="text-2xl font-bold text-red-600">{suspiciousLogs.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Critical Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{criticalLogs.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Detection Rate</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round((suspiciousLogs.length / logs.length) * 100)}%
                  </p>
                </div>
                <Search className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Log File</CardTitle>
              <CardDescription>Upload CSV or TXT files for analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="logFile">Choose File</Label>
                  <Input
                    id="logFile"
                    type="file"
                    accept=".csv,.txt,.log"
                    onChange={handleFileUpload}
                    className="mt-2"
                  />
                </div>
                {uploadedFile && (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">Uploaded: {uploadedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Size: {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  <span>Supported formats: CSV, TXT, LOG</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
              <CardDescription>Find specific log entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search">Search Logs</Label>
                  <Input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search messages or sources..."
                    className="mt-2"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Showing {filteredLogs.length} of {logs.length} entries</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>Download filtered results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={exportLogs} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export to CSV
                </Button>
                <div className="text-sm text-muted-foreground">
                  <p>Export includes filtered log entries with timestamps, sources, and threat analysis.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Security Logs</CardTitle>
            <CardDescription>
              Analyzed log entries with threat detection
              {searchTerm && ` (filtered by "${searchTerm}")`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow 
                    key={log.id} 
                    className={log.suspicious ? 'bg-red-50 border-red-200' : ''}
                  >
                    <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                    <TableCell className="font-mono text-sm">{log.source}</TableCell>
                    <TableCell>{getLevelBadge(log.level, log.suspicious)}</TableCell>
                    <TableCell className="max-w-md">
                      <div className={log.suspicious ? 'font-medium' : ''}>
                        {log.message}
                      </div>
                      {log.suspicious && (
                        <div className="text-xs text-red-600 mt-1">
                          ⚠️ Contains suspicious keywords
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No logs found matching your search criteria.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LogMonitoring;