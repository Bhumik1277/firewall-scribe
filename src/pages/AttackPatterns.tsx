import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Target, TrendingUp } from 'lucide-react';

type AttackPattern = {
  id: string;
  pattern_name: string;
  ioc_type: string;
  ioc_value: string;
  description: string | null;
  severity: string;
  category: string;
  occurrence_count: number;
  is_active: boolean;
};

const AttackPatterns = () => {
  const [patterns, setPatterns] = useState<AttackPattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    try {
      const { data, error } = await supabase
        .from('attack_patterns')
        .select('*')
        .order('occurrence_count', { ascending: false });

      if (error) throw error;
      setPatterns(data || []);
    } catch (error) {
      console.error('Error fetching patterns:', error);
      toast.error('Failed to load attack patterns');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityVariant = (severity: string) => {
    const variants: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'default',
      low: 'secondary',
      info: 'outline',
    };
    return variants[severity] || 'default';
  };

  const getIocTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      ip: 'bg-blue-500/20 text-blue-300',
      domain: 'bg-purple-500/20 text-purple-300',
      url: 'bg-green-500/20 text-green-300',
      hash: 'bg-orange-500/20 text-orange-300',
      email: 'bg-red-500/20 text-red-300',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-300';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
            <Target className="w-10 h-10 text-primary" />
            Attack Patterns & IOCs
          </h1>
          <p className="text-muted-foreground mt-2">
            Indicators of Compromise (IOCs) and attack pattern database
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total IOCs</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patterns.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active indicators</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Threats</CardTitle>
              <TrendingUp className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patterns.filter((p) => p.severity === 'critical').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Require immediate action</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Occurrences</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patterns.reduce((sum, p) => sum + p.occurrence_count, 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Detected events</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Threat Intelligence Database</CardTitle>
            <CardDescription>
              Known malicious indicators and attack patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pattern Name</TableHead>
                    <TableHead>IOC Type</TableHead>
                    <TableHead>IOC Value</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Occurrences</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patterns.map((pattern) => (
                    <TableRow key={pattern.id}>
                      <TableCell className="font-medium">{pattern.pattern_name}</TableCell>
                      <TableCell>
                        <Badge className={getIocTypeColor(pattern.ioc_type)}>
                          {pattern.ioc_type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{pattern.ioc_value}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{pattern.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityVariant(pattern.severity)}>
                          {pattern.severity.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {pattern.occurrence_count}
                      </TableCell>
                      <TableCell>
                        {pattern.is_active ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AttackPatterns;