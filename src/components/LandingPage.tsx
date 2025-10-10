import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NovaShowcase from "./NovaShowcase";
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Target, 
  Users, 
  TrendingUp,
  Brain,
  Network,
  Play,
  CheckCircle,
  Star,
  Globe,
  Shield,
  Clock,
  ArrowDown,
  ChevronRight,
  Rocket,
  Lightbulb,
  BarChart3,
  Layers,
  MapPin,
  GitBranch,
  Timer,
  FileText,
  CheckSquare,
  MessageSquare,
  Activity,
  ArrowUpRight
} from "lucide-react";

const LandingPage = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Network,
      title: "ProjectMaps",
      description: "Visualize your entire project ecosystem with dynamic, zoomable ProjectMaps",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: CheckSquare,
      title: "Tasks",
      description: "Built-in task tracking with status updates, priorities, and progress monitoring",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: FileText,
      title: "Notes",
      description: "Project-specific notes, documentation, and knowledge management",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Timer,
      title: "Timer",
      description: "Clockify-style time tracking with detailed analytics and reporting",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "Team",
      description: "Team management, activity feeds, and real-time collaboration tools",
      color: "from-blue-500 to-blue-600"
    },
            {
              icon: MessageSquare,
              title: "Nova AI",
              description: "Your intelligent project companion with voice input and smart suggestions",
              color: "from-blue-500 to-blue-600"
            }
  ];

  const stats = [
    { number: "10x", label: "Faster Project Planning" },
    { number: "95%", label: "Better Organization" },
    { number: "360°", label: "Project Visibility" },
    { number: "∞", label: "Scalability" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Project Manager",
      company: "TechCorp",
      content: "Rena AI transformed how we manage complex projects. The ProjectMap visualization is incredible!",
      avatar: "👩‍💼"
    },
    {
      name: "Marcus Johnson",
      role: "CEO",
      company: "StartupXYZ",
      content: "Finally, a platform that scales with our growth. The 3-level hierarchy is perfect for our needs.",
      avatar: "👨‍💻"
    },
    {
      name: "Elena Rodriguez",
      role: "Marketing Director",
      company: "BrandStudio",
      content: "The ProjectMap visualization is game-changing. Our team collaboration has never been better.",
      avatar: "👩‍🎨"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Mapping Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating connection nodes */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-32 left-40 w-5 h-5 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-20 w-4 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-60 left-1/2 w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          <path
            d="M80 80 Q400 200 600 160"
            stroke="url(#gradient1)"
            strokeWidth="1"
            fill="none"
            opacity="0.3"
            className="animate-pulse"
          />
          <path
            d="M200 400 Q500 300 800 360"
            stroke="url(#gradient2)"
            strokeWidth="1"
            fill="none"
            opacity="0.2"
            className="animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          <path
            d="M100 600 Q300 500 700 580"
            stroke="url(#gradient3)"
            strokeWidth="1"
            fill="none"
            opacity="0.25"
            className="animate-pulse"
            style={{ animationDelay: '2s' }}
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#1e40af" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Floating elements */}
        <div className="absolute top-32 right-20 text-blue-400 opacity-20">
          <GitBranch className="w-8 h-8 animate-bounce" style={{ animationDelay: '0.5s' }} />
        </div>
        <div className="absolute bottom-40 left-20 text-blue-500 opacity-20">
          <MapPin className="w-6 h-6 animate-bounce" style={{ animationDelay: '1.5s' }} />
        </div>
        <div className="absolute top-1/2 right-10 text-blue-600 opacity-20">
          <Target className="w-7 h-7 animate-bounce" style={{ animationDelay: '2.5s' }} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Network className="w-8 h-8 text-blue-400" />
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                      Nexus AI
                    </span>
                  </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-blue-400 transition-colors">Testimonials</a>
            <a href="#stats" className="hover:text-blue-400 transition-colors">Stats</a>
          </div>
          <Button 
            onClick={() => window.location.href = '/workspace'}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
          >
            Launch Workspace
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30">
              <MapPin className="w-4 h-4 mr-2" />
              Mapping Things Together
            </Badge>
            
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                      Where Everything
                      <span className="block bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                        Connects
                      </span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                      Connect projects, tasks, and systems in one unified ProjectMap. 
                      See how everything works together with Nexus AI's intelligent mapping platform.
                    </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/workspace'}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 px-8 py-4 text-lg"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Mapping
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-blue-400 text-blue-300 hover:bg-blue-400/10 px-8 py-4 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Feature Icons - Tab Style */}
          <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-1 bg-gray-900/30 p-1.5 rounded-xl border border-gray-700/50 shadow-sm backdrop-blur-sm">
                  {features.slice(0, 6).map((feature, index) => {
                    const FeatureIcon = feature.icon;
                    const isActive = index === currentFeature;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentFeature(index)}
                        className={`relative flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[120px] justify-center group ${
                          isActive 
                            ? "bg-gray-800/50 shadow-md border border-gray-600/50 text-white scale-105" 
                            : "text-gray-400 hover:text-white hover:scale-102"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FeatureIcon className={`w-4 h-4 transition-colors ${
                            isActive ? "text-blue-400" : "group-hover:text-blue-400"
                          }`} />
                          <span className="font-medium text-sm">{feature.title}</span>
                        </div>
                        {isActive && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Feature Description */}
              <div className="text-center mt-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <p className="text-sm font-medium text-blue-300">
                    {features[currentFeature].description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nova AI Showcase */}
      <NovaShowcase />

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
                      <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Everything Connected in
                        <span className="block bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                          Nexus AI
                        </span>
                      </h2>
                      <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        From ProjectMaps to time tracking, task management to Nova AI - all your tools work together seamlessly.
                      </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="bg-gray-900/50 backdrop-blur-md border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300 hover:scale-105 hover:border-blue-500/30"
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Loved by Teams
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Worldwide
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-4xl mr-4">{testimonial.avatar}</div>
                    <div>
                      <h4 className="font-bold">{testimonial.name}</h4>
                      <p className="text-gray-400 text-sm">{testimonial.role}, {testimonial.company}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 italic">"{testimonial.content}"</p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-md border-blue-500/30">
            <CardContent className="p-12">
                      <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Connect
                        <span className="block bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                          Everything?
                        </span>
                      </h2>
                      <p className="text-xl text-gray-300 mb-8">
                        Join teams already using Nexus AI to connect, visualize, and scale their project ecosystems.
                      </p>
              <Button 
                size="lg"
                onClick={() => window.location.href = '/workspace'}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 px-12 py-4 text-xl"
              >
                <MapPin className="w-6 h-6 mr-3" />
                Start Mapping Now
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Network className="w-6 h-6 text-blue-400" />
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                      Nexus AI
                    </span>
                  </div>
                  <p className="text-gray-400 mb-4">
                    Where Everything Connects
                  </p>
          <div className="flex justify-center space-x-6 text-gray-400">
            <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
