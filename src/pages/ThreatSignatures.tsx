import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Shield, Plus, Trash2, Edit } from 'lucide-react';

type ThreatSignature = {
  id: string;
  signature_name: string;
  signature_pattern: string;
  description: string | null;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  is_active: boolean;
  created_at: string;
};

const ThreatSignatures = () => {
  const [signatures, setSignatures] = useState<ThreatSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    signature_name: '',
    signature_pattern: '',
    description: '',
    severity: 'medium' as const,
    category: 'intrusion',
  });

  useEffect(() => {
    fetchSignatures();
  }, []);

  const fetchSignatures = async () => {
    try {
      const { data, error } = await supabase
        .from('threat_signatures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSignatures(data || []);
    } catch (error) {
      console.error('Error fetching signatures:', error);
      toast.error('Failed to load threat signatures');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('threat_signatures').insert([formData]);
      if (error) throw error;

      toast.success('Threat signature added successfully');
      setIsDialogOpen(false);
      setFormData({
        signature_name: '',
        signature_pattern: '',
        description: '',
        severity: 'medium',
        category: 'intrusion',
      });
      fetchSignatures();
    } catch (error) {
      console.error('Error adding signature:', error);
      toast.error('Failed to add threat signature');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('threat_signatures').delete().eq('id', id);
      if (error) throw error;

      toast.success('Threat signature deleted');
      fetchSignatures();
    } catch (error) {
      console.error('Error deleting signature:', error);
      toast.error('Failed to delete threat signature');
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <Shield className="w-10 h-10 text-primary" />
              Threat Signatures
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage signature-based threat detection patterns
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Signature
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Threat Signature</DialogTitle>
                <DialogDescription>Create a new threat detection signature</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label>Signature Name</Label>
                    <Input
                      value={formData.signature_name}
                      onChange={(e) => setFormData({ ...formData, signature_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Signature Pattern</Label>
                    <Textarea
                      value={formData.signature_pattern}
                      onChange={(e) => setFormData({ ...formData, signature_pattern: e.target.value })}
                      required
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Severity</Label>
                      <Select
                        value={formData.severity}
                        onValueChange={(value: any) => setFormData({ ...formData, severity: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="malware">Malware</SelectItem>
                          <SelectItem value="phishing">Phishing</SelectItem>
                          <SelectItem value="dos">DoS</SelectItem>
                          <SelectItem value="intrusion">Intrusion</SelectItem>
                          <SelectItem value="data_breach">Data Breach</SelectItem>
                          <SelectItem value="ransomware">Ransomware</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="submit">Add Signature</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Signatures</CardTitle>
            <CardDescription>
              {signatures.length} threat signatures configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Pattern</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signatures.map((sig) => (
                    <TableRow key={sig.id}>
                      <TableCell className="font-medium">{sig.signature_name}</TableCell>
                      <TableCell className="font-mono text-sm max-w-xs truncate">
                        {sig.signature_pattern}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{sig.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityVariant(sig.severity)}>
                          {sig.severity.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {sig.is_active ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(sig.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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

export default ThreatSignatures;