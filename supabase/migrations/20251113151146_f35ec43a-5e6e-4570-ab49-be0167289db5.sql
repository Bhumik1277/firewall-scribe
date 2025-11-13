-- Create enum types for better data integrity
CREATE TYPE attack_severity AS ENUM ('critical', 'high', 'medium', 'low', 'info');
CREATE TYPE attack_category AS ENUM ('malware', 'phishing', 'dos', 'intrusion', 'data_breach', 'ransomware', 'social_engineering', 'other');
CREATE TYPE rule_action AS ENUM ('block', 'allow', 'alert', 'drop');
CREATE TYPE log_status AS ENUM ('clean', 'suspicious', 'threat', 'blocked');

-- Threat Signatures Table
CREATE TABLE public.threat_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  signature_name TEXT NOT NULL,
  signature_pattern TEXT NOT NULL,
  description TEXT,
  severity attack_severity NOT NULL DEFAULT 'medium',
  category attack_category NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Firewall Rules Table (enhanced)
CREATE TABLE public.firewall_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  source_ip TEXT NOT NULL,
  destination_ip TEXT NOT NULL,
  port INTEGER NOT NULL,
  protocol TEXT NOT NULL,
  action rule_action NOT NULL DEFAULT 'block',
  priority INTEGER NOT NULL DEFAULT 100,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Security Logs Table
CREATE TABLE public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source_ip TEXT NOT NULL,
  destination_ip TEXT,
  port INTEGER,
  protocol TEXT,
  action TEXT NOT NULL,
  status log_status NOT NULL DEFAULT 'clean',
  message TEXT NOT NULL,
  threat_signature_id UUID REFERENCES public.threat_signatures(id),
  severity attack_severity NOT NULL DEFAULT 'info',
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Attack Patterns / IOCs Table
CREATE TABLE public.attack_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_name TEXT NOT NULL,
  ioc_type TEXT NOT NULL, -- ip, domain, url, hash, email
  ioc_value TEXT NOT NULL,
  description TEXT,
  severity attack_severity NOT NULL DEFAULT 'medium',
  category attack_category NOT NULL,
  first_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  occurrence_count INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Incidents Table
CREATE TABLE public.security_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity attack_severity NOT NULL DEFAULT 'medium',
  category attack_category NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- open, investigating, resolved, closed
  affected_systems TEXT[],
  source_ip TEXT,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Vulnerability Database
CREATE TABLE public.vulnerabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cve_id TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity attack_severity NOT NULL DEFAULT 'medium',
  cvss_score DECIMAL(3,1),
  affected_systems TEXT[],
  published_date TIMESTAMP WITH TIME ZONE,
  patched BOOLEAN NOT NULL DEFAULT false,
  patch_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.threat_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firewall_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attack_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vulnerabilities ENABLE ROW LEVEL SECURITY;

-- Create policies (public read for now, can be restricted later)
CREATE POLICY "Allow all operations on threat_signatures" ON public.threat_signatures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on firewall_rules" ON public.firewall_rules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on security_logs" ON public.security_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on attack_patterns" ON public.attack_patterns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on security_incidents" ON public.security_incidents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on vulnerabilities" ON public.vulnerabilities FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_threat_signatures_active ON public.threat_signatures(is_active);
CREATE INDEX idx_threat_signatures_category ON public.threat_signatures(category);
CREATE INDEX idx_firewall_rules_active ON public.firewall_rules(is_active);
CREATE INDEX idx_security_logs_timestamp ON public.security_logs(timestamp DESC);
CREATE INDEX idx_security_logs_status ON public.security_logs(status);
CREATE INDEX idx_attack_patterns_ioc_value ON public.attack_patterns(ioc_value);
CREATE INDEX idx_security_incidents_status ON public.security_incidents(status);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_threat_signatures_updated_at BEFORE UPDATE ON public.threat_signatures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_firewall_rules_updated_at BEFORE UPDATE ON public.firewall_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_security_incidents_updated_at BEFORE UPDATE ON public.security_incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vulnerabilities_updated_at BEFORE UPDATE ON public.vulnerabilities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.threat_signatures (signature_name, signature_pattern, description, severity, category) VALUES
('SQL Injection Pattern', '(\bOR\b|\bAND\b).*(=|LIKE).*[\x27\x22]', 'Detects SQL injection attempts', 'critical', 'intrusion'),
('XSS Attack Pattern', '<script[^>]*>.*?</script>', 'Detects cross-site scripting attempts', 'high', 'intrusion'),
('Malware Hash Signature', 'a1b2c3d4e5f6', 'Known malware file hash', 'critical', 'malware'),
('Port Scan Detection', 'Multiple connection attempts to sequential ports', 'Detects port scanning activity', 'medium', 'intrusion'),
('Brute Force Login', 'Multiple failed authentication attempts', 'Detects brute force attacks', 'high', 'intrusion');

INSERT INTO public.attack_patterns (pattern_name, ioc_type, ioc_value, description, severity, category, occurrence_count) VALUES
('Malicious IP', 'ip', '192.168.100.50', 'Known malicious IP address', 'high', 'intrusion', 15),
('Phishing Domain', 'domain', 'evil-phishing-site.com', 'Phishing domain detected', 'critical', 'phishing', 8),
('Malware Hash', 'hash', 'a1b2c3d4e5f6g7h8', 'Known malware file hash', 'critical', 'malware', 3),
('C2 Server', 'ip', '10.0.0.100', 'Command and Control server', 'critical', 'malware', 22),
('Suspicious Email', 'email', 'attacker@evil.com', 'Email associated with attacks', 'high', 'phishing', 5);

INSERT INTO public.security_logs (source_ip, destination_ip, port, protocol, action, status, message, severity) VALUES
('192.168.1.50', '10.0.0.1', 80, 'HTTP', 'GET /admin', 'suspicious', 'Unauthorized access attempt to admin panel', 'high'),
('192.168.100.50', '10.0.0.1', 22, 'SSH', 'AUTH_FAILED', 'threat', 'Multiple failed SSH login attempts', 'critical'),
('192.168.1.100', '8.8.8.8', 443, 'HTTPS', 'GET', 'clean', 'Normal HTTPS traffic', 'info'),
('10.0.0.50', '10.0.0.1', 3306, 'MySQL', 'SELECT', 'threat', 'SQL injection attempt detected', 'critical'),
('192.168.1.75', '10.0.0.1', 80, 'HTTP', 'POST', 'suspicious', 'Suspicious POST request with encoded payload', 'medium');

INSERT INTO public.security_incidents (title, description, severity, category, status, affected_systems, source_ip) VALUES
('Ransomware Attack Detected', 'Ransomware activity detected on multiple systems', 'critical', 'ransomware', 'investigating', ARRAY['WEB-SERVER-01', 'DB-SERVER-01'], '192.168.100.50'),
('DDoS Attack', 'Distributed denial of service attack targeting web servers', 'high', 'dos', 'open', ARRAY['WEB-SERVER-01'], '10.0.0.100'),
('Data Breach Attempt', 'Unauthorized access to customer database', 'critical', 'data_breach', 'resolved', ARRAY['DB-SERVER-02'], '192.168.1.50'),
('Phishing Campaign', 'Phishing emails sent to employees', 'high', 'phishing', 'investigating', ARRAY['MAIL-SERVER-01'], NULL);

INSERT INTO public.vulnerabilities (cve_id, title, description, severity, cvss_score, affected_systems, published_date, patched) VALUES
('CVE-2024-1234', 'Critical Apache Vulnerability', 'Remote code execution vulnerability in Apache 2.4', 'critical', 9.8, ARRAY['WEB-SERVER-01', 'WEB-SERVER-02'], '2024-01-15', false),
('CVE-2024-5678', 'SQL Server Authentication Bypass', 'Authentication bypass in SQL Server', 'high', 8.2, ARRAY['DB-SERVER-01'], '2024-02-20', true),
('CVE-2024-9012', 'XSS Vulnerability in Node.js', 'Cross-site scripting vulnerability', 'medium', 6.1, ARRAY['APP-SERVER-01'], '2024-03-10', false);