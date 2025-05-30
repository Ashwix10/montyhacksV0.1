import React, { useState } from 'react';
import { Link } from 'wouter';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Code, 
  Zap, 
  FileText, 
  Upload, 
  Play, 
  ChevronRight,
  Github,
  Star,
  Users,
  Sparkles
} from 'lucide-react';

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Security First",
      description: "Advanced vulnerability scanning with real-time threat detection and security scoring.",
      color: "text-red-500"
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Multi-Language Support",
      description: "Write and execute code in Python, JavaScript, TypeScript, C++, C, Java, Go, Rust, PHP, and Ruby.",
      color: "text-blue-500"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "WebAssembly Execution",
      description: "Secure in-browser code execution using WebAssembly and isolated Web Workers.",
      color: "text-yellow-500"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Multiple Files",
      description: "Upload and manage multiple code files with intelligent syntax highlighting.",
      color: "text-green-500"
    }
  ];

  const stats = [
    { label: "Languages Supported", value: "10+" },
    { label: "Security Checks", value: "50+" },
    { label: "Execution Modes", value: "3" },
    { label: "File Formats", value: "15+" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="glass-morphism border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">CodeVault</h1>
                <p className="text-sm text-muted-foreground">Secure Code Sandbox</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <div className="flex items-center space-x-2 glass-morphism rounded-xl p-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="h-8"
                >
                  ☀️
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="h-8"
                >
                  🌙
                </Button>
                <Button
                  variant={theme === 'vibe' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTheme('vibe')}
                  className="h-8"
                >
                  🎨
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Secure • Fast • Browser-Based
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              CodeVault
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              The most secure in-browser code sandbox with advanced vulnerability scanning, 
              multi-language support, and beautiful UI.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sandbox">
              <Button size="lg" className="text-lg px-8 py-6 h-auto">
                <Play className="w-5 h-5 mr-2" />
                Start Coding
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto">
              <Upload className="w-5 h-5 mr-2" />
              Upload Files
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need for secure code development and analysis in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className={`glass-morphism border-0 transition-all duration-300 cursor-pointer ${
                hoveredFeature === index ? 'transform scale-105' : ''
              }`}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className={`${feature.color}`}>
                    {feature.icon}
                  </div>
                  <span>{feature.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Language Support Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Language Support
          </h2>
          <p className="text-xl text-muted-foreground">
            Code in your favorite programming language with full syntax highlighting and execution.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: 'Python', icon: '🐍' },
            { name: 'JavaScript', icon: '📜' },
            { name: 'TypeScript', icon: '🔷' },
            { name: 'C++', icon: '⚡' },
            { name: 'C', icon: '🔧' },
            { name: 'Java', icon: '☕' },
            { name: 'Go', icon: '🚀' },
            { name: 'Rust', icon: '🦀' },
            { name: 'PHP', icon: '🐘' },
            { name: 'Ruby', icon: '💎' }
          ].map((lang, index) => (
            <Card key={index} className="glass-morphism border-0 text-center p-6 hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">{lang.icon}</div>
              <div className="font-medium">{lang.name}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="glass-morphism border-0 text-center p-12">
          <CardContent className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to secure your code?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start coding with confidence knowing your code is secure and optimized.
            </p>
            <Link href="/sandbox">
              <Button size="lg" className="text-lg px-12 py-6 h-auto">
                <Play className="w-5 h-5 mr-2" />
                Launch CodeVault
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">CodeVault</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Built with security and performance in mind
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}