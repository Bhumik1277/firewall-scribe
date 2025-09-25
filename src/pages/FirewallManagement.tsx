import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Shield, AlertTriangle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';

interface FirewallRule {
  id: number;
  source: string;
  destination: string;
  port: string;
  protocol: string;
  action: string;
  description?: string;
}

const FirewallManagement = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<FirewallRule[]>([
    { id: 1, source: '0.0.0.0/0', destination: '192.168.1.10', port: '80', action: 'ALLOW', protocol: 'TCP', description: 'HTTP Traffic' },
    { id: 2, source: '0.0.0.0/0', destination: '192.168.1.10', port: '443', action: 'ALLOW', protocol: 'TCP', description: 'HTTPS Traffic' },
    { id: 3, source: '192.168.1.0/24', destination: '192.168.1.11', port: '3306', action: 'ALLOW', protocol: 'TCP', description: 'Database Access' },
    { id: 4, source: '0.0.0.0/0', destination: '0.0.0.0/0', port: '22', action: 'DENY', protocol: 'TCP', description: 'Block SSH from Internet' },
    { id: 5, source: '10.0.0.0/8', destination: '192.168.1.10', port: '8080', action: 'ALLOW', protocol: 'TCP', description: 'Internal Web Traffic' },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<FirewallRule | null>(null);
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    port: '',
    protocol: 'TCP',
    action: 'ALLOW',
    description: ''
  });

  const resetForm = () => {
    setFormData({
      source: '',
      destination: '',
      port: '',
      protocol: 'TCP',
      action: 'ALLOW',
      description: ''
    });
    setEditingRule(null);
  };

  const handleAddRule = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditRule = (rule: FirewallRule) => {
    setFormData({
      source: rule.source,
      destination: rule.destination,
      port: rule.port,
      protocol: rule.protocol,
      action: rule.action,
      description: rule.description || ''
    });
    setEditingRule(rule);
    setIsDialogOpen(true);
  };

  const handleDeleteRule = (id: number) => {
    setRules(rules.filter(rule => rule.id !== id));
    toast({
      title: "Rule Deleted",
      description: "Firewall rule has been removed successfully.",
    });
  };

  const handleSaveRule = () => {
    if (!formData.source || !formData.destination || !formData.port) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check for conflicts
    const existingRule = rules.find(rule => 
      rule.id !== editingRule?.id &&
      rule.source === formData.source &&
      rule.destination === formData.destination &&
      rule.port === formData.port &&
      rule.protocol === formData.protocol
    );

    if (existingRule) {
      toast({
        title: "Conflict Detected",
        description: "A similar rule already exists. Please review your configuration.",
        variant: "destructive",
      });
      return;
    }

    if (editingRule) {
      // Update existing rule
      setRules(rules.map(rule => 
        rule.id === editingRule.id 
          ? { ...rule, ...formData }
          : rule
      ));
      toast({
        title: "Rule Updated",
        description: "Firewall rule has been updated successfully.",
      });
    } else {
      // Add new rule
      const newRule: FirewallRule = {
        id: Math.max(...rules.map(r => r.id)) + 1,
        ...formData
      };
      setRules([...rules, newRule]);
      toast({
        title: "Rule Added",
        description: "New firewall rule has been created successfully.",
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const getActionBadge = (action: string) => {
    return action === 'ALLOW' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">ALLOW</Badge>
    ) : (
      <Badge variant="destructive">DENY</Badge>
    );
  };

  const conflictingRules = rules.filter((rule, index) => 
    rules.some((otherRule, otherIndex) => 
      index !== otherIndex &&
      rule.source === otherRule.source &&
      rule.destination === otherRule.destination &&
      rule.port === otherRule.port &&
      rule.protocol === otherRule.protocol &&
      rule.action !== otherRule.action
    )
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Firewall Management</h2>
              <p className="text-muted-foreground">Configure and manage firewall rules</p>
            </div>
            <Button onClick={handleAddRule}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </div>

        {/* Conflict Warning */}
        {conflictingRules.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <h4 className="font-medium text-orange-800">Conflicting Rules Detected</h4>
                  <p className="text-sm text-orange-700">
                    {conflictingRules.length} rule(s) have conflicts. Please review and resolve them.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Rules</p>
                  <p className="text-2xl font-bold">{rules.length}</p>
                </div>
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Allow Rules</p>
                  <p className="text-2xl font-bold text-green-600">
                    {rules.filter(r => r.action === 'ALLOW').length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Deny Rules</p>
                  <p className="text-2xl font-bold text-red-600">
                    {rules.filter(r => r.action === 'DENY').length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rules Table */}
        <Card>
          <CardHeader>
            <CardTitle>Firewall Rules</CardTitle>
            <CardDescription>Manage your firewall rules and policies</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Port</TableHead>
                  <TableHead>Protocol</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id} className={conflictingRules.includes(rule) ? 'bg-orange-50' : ''}>
                    <TableCell className="font-mono text-sm">{rule.source}</TableCell>
                    <TableCell className="font-mono text-sm">{rule.destination}</TableCell>
                    <TableCell>{rule.port}</TableCell>
                    <TableCell>{rule.protocol}</TableCell>
                    <TableCell>{getActionBadge(rule.action)}</TableCell>
                    <TableCell>{rule.description}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRule(rule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add/Edit Rule Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? 'Edit Firewall Rule' : 'Add New Firewall Rule'}
              </DialogTitle>
              <DialogDescription>
                Configure the firewall rule parameters. Make sure to avoid conflicts with existing rules.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Source IP/Network</Label>
                  <Input
                    id="source"
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                    placeholder="0.0.0.0/0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination IP/Network</Label>
                  <Input
                    id="destination"
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    placeholder="192.168.1.10"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    value={formData.port}
                    onChange={(e) => setFormData({...formData, port: e.target.value})}
                    placeholder="80"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protocol">Protocol</Label>
                  <Select value={formData.protocol} onValueChange={(value) => setFormData({...formData, protocol: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TCP">TCP</SelectItem>
                      <SelectItem value="UDP">UDP</SelectItem>
                      <SelectItem value="ICMP">ICMP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action">Action</Label>
                  <Select value={formData.action} onValueChange={(value) => setFormData({...formData, action: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALLOW">ALLOW</SelectItem>
                      <SelectItem value="DENY">DENY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of this rule"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRule}>
                {editingRule ? 'Update Rule' : 'Add Rule'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default FirewallManagement;