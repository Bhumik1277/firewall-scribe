import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Bug, CheckCircle, XCircle } from 'lucide-react';

type Vulnerability = {
  id: string;
  cve_id: string | null;
  title: string;
  description: string;
  severity: string;
  cvss_score: number | null;
  affected_systems: string[];
  published_date: string | null;
  patched: boolean;
  patch_notes: string | null;
};

const Vulnerabilities = () => {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVulnerabilities();
  }, []);

  const fetchVulnerabilities = async () => {
    try {
      const { data, error } = await supabase
        .from('vulnerabilities')
        .select('*')
        .order('cvss_score', { ascending: false, nullsFirst: false });

      if (error) throw error;
      setVulnerabilities(data || []);
    } catch (error) {
      console.error('Error fetching vulnerabilities:', error);
      toast.error('Failed to load vulnerabilities');
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

  const getCvssColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 9.0) return 'text-red-500';
    if (score >= 7.0) return 'text-orange-500';
    if (score >= 4.0) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
            <Bug className="w-10 h-10 text-primary" />
            Vulnerability Database
          </h1>
          <p className="text-muted-foreground mt-2">
            Known vulnerabilities and patch status
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total CVEs</CardTitle>
              <Bug className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vulnerabilities.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {vulnerabilities.filter((v) => v.severity === 'critical').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patched</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {vulnerabilities.filter((v) => v.patched).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unpatched</CardTitle>
              <XCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {vulnerabilities.filter((v) => !v.patched).length}
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
            vulnerabilities.map((vuln) => (
              <Card key={vuln.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {vuln.patched ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-yellow-500" />
                        )}
                        <CardTitle className="text-xl">{vuln.title}</CardTitle>
                      </div>
                      {vuln.cve_id && (
                        <Badge variant="outline" className="mb-2">
                          {vuln.cve_id}
                        </Badge>
                      )}
                      <CardDescription>{vuln.description}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant={getSeverityVariant(vuln.severity)}>
                        {vuln.severity.toUpperCase()}
                      </Badge>
                      {vuln.cvss_score && (
                        <div className={`text-sm font-bold ${getCvssColor(vuln.cvss_score)}`}>
                          CVSS: {vuln.cvss_score.toFixed(1)}
                        </div>
                      )}
                      {vuln.patched ? (
                        <Badge className="bg-green-500/20 text-green-300">PATCHED</Badge>
                      ) : (
                        <Badge className="bg-yellow-500/20 text-yellow-300">UNPATCHED</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Affected Systems:</span>
                      <div className="font-medium mt-1">
                        {vuln.affected_systems?.join(', ') || 'N/A'}
                      </div>
                    </div>
                    {vuln.published_date && (
                      <div>
                        <span className="text-muted-foreground">Published:</span>
                        <div className="font-medium mt-1">
                          {new Date(vuln.published_date).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    {vuln.patch_notes && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Patch Notes:</span>
                        <div className="font-medium mt-1">{vuln.patch_notes}</div>
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

export default Vulnerabilities;