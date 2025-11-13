import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

type Incident = {
  id: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  status: string;
  affected_systems: string[];
  source_ip: string | null;
  detected_at: string;
  resolved_at: string | null;
};

const SecurityIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('security_incidents')
        .select('*')
        .order('detected_at', { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast.error('Failed to load security incidents');
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

  const getStatusIcon = (status: string) => {
    if (status === 'resolved' || status === 'closed') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (status === 'investigating') {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
      open: 'destructive',
      investigating: 'default',
      resolved: 'secondary',
      closed: 'outline',
    };
    return variants[status] || 'default';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
            <AlertTriangle className="w-10 h-10 text-primary" />
            Security Incidents
          </h1>
          <p className="text-muted-foreground mt-2">
            Active and resolved security incidents requiring attention
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{incidents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {incidents.filter((i) => i.status === 'open').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investigating</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {incidents.filter((i) => i.status === 'investigating').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {incidents.filter((i) => i.status === 'resolved' || i.status === 'closed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {loading ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">Loading...</CardContent>
            </Card>
          ) : (
            incidents.map((incident) => (
              <Card key={incident.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(incident.status)}
                        <CardTitle className="text-xl">{incident.title}</CardTitle>
                      </div>
                      <CardDescription>{incident.description}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant={getSeverityVariant(incident.severity)}>
                        {incident.severity.toUpperCase()}
                      </Badge>
                      <Badge variant={getStatusVariant(incident.status)}>
                        {incident.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <div className="font-medium mt-1">
                        <Badge variant="outline">{incident.category}</Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Affected Systems:</span>
                      <div className="font-medium mt-1">
                        {incident.affected_systems?.join(', ') || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Source IP:</span>
                      <div className="font-mono mt-1">{incident.source_ip || 'Unknown'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Detected:</span>
                      <div className="font-medium mt-1">
                        {new Date(incident.detected_at).toLocaleString()}
                      </div>
                    </div>
                    {incident.resolved_at && (
                      <div>
                        <span className="text-muted-foreground">Resolved:</span>
                        <div className="font-medium mt-1">
                          {new Date(incident.resolved_at).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default SecurityIncidents;