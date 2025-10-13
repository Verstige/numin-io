# Nexus AI Business Suite

A fully autonomous, MindStudio-level AI business suite powered by Gemini that allows users to create, customize, and automate AI agents for business operations.

## 🚀 Features

### Core Components

- **Agent Manager**: Create, manage, and deploy AI agents with custom roles and permissions
- **Workflow Engine**: Visual, drag-and-drop workflow builder using React Flow
- **RAG Engine**: Retrieval-Augmented Generation for knowledge retrieval and context
- **Memory System**: Persistent short-term and long-term memory for agents
- **API Connectors**: Unified integration system for external business tools
- **Event Router**: Automated event handling and workflow triggers

### Five Core Business Agents

1. **Aurora** - Executive Assistant
   - Schedule management and productivity optimization
   - Meeting coordination and email management
   - Executive insights and reporting

2. **Vega** - Sales Representative
   - Lead qualification and CRM management
   - Automated outreach and follow-up
   - Sales pipeline analysis and optimization

3. **Luma** - Customer Support Specialist
   - Multi-channel customer service
   - Knowledge base integration
   - Issue escalation and sentiment analysis

4. **Orion** - Marketing Strategist
   - Campaign planning and execution
   - Social media and advertising automation
   - Competitor analysis and trend research

5. **Titan** - Operations Manager
   - KPI monitoring and reporting
   - Process optimization and efficiency analysis
   - Business continuity and forecasting

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Flow** for workflow visualization
- **React Router** for navigation

### Backend & Database
- **Supabase** for database and authentication
- **PostgreSQL** with vector extensions for RAG
- **Row Level Security (RLS)** for multi-tenant support

### AI & Machine Learning
- **Google Gemini 1.5 Pro** as primary AI model
- **Vector embeddings** for semantic search
- **Context-aware responses** with RAG integration
- **Multi-model support** (Gemini, Claude, GPT-4, Mistral)

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Google Gemini API key

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-rena
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Configure the following environment variables:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   - Create a new Supabase project
   - Run the SQL schema from `supabase-schema.sql`
   - Configure RLS policies for your use case

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🎯 Usage

### Accessing Nexus AI

1. Navigate to `/nexus` in your browser
2. Or click "Nexus AI" in the sidebar from the main workspace

### Creating Your First Agent

1. Go to the "Active Agents" tab
2. Click "Create Core Agents" to set up the five business agents
3. Or click "Create Agent" to build a custom agent
4. Configure the agent's role, model, and permissions

### Building Workflows

1. Navigate to the "Workflows" tab
2. Use the drag-and-drop interface to create automation workflows
3. Connect nodes for agents, API calls, conditions, and functions
4. Save and execute workflows

### Connecting Integrations

1. Go to the "Integrations" tab
2. Connect external services like:
   - Google Workspace (Calendar, Drive, Docs)
   - Slack, Discord, Microsoft Teams
   - HubSpot, Salesforce CRM
   - Gmail, Outlook
   - Facebook Ads, Google Ads

## 🔧 Configuration

### Agent Configuration

Each agent can be configured with:
- **Model Selection**: Choose from Gemini, Claude, GPT-4, or Mistral
- **Temperature**: Control creativity (0.0 - 2.0)
- **Max Tokens**: Limit response length
- **Permissions**: Control API access and capabilities
- **Memory Settings**: Short-term and long-term memory configuration

### Workflow Configuration

Workflows support various node types:
- **Agent Action**: Execute agent tasks
- **API Call**: Connect to external services
- **Condition**: Add logic and branching
- **Function**: Custom JavaScript code
- **Trigger**: Webhook and event handling
- **Delay**: Time-based waits
- **Merge/Split**: Data flow control

### Memory System

- **Short-term Memory**: Recent conversations (configurable limit)
- **Long-term Memory**: Vector-based knowledge storage
- **Context Window**: Configurable conversation history
- **Importance Scoring**: Automatic memory prioritization

## 🔌 API Integrations

### Supported Connectors

#### Communication
- **Slack**: Team messaging and notifications
- **Discord**: Community and team chat
- **Microsoft Teams**: Enterprise communication
- **Gmail**: Email automation and management
- **Outlook**: Microsoft email integration

#### CRM & Sales
- **HubSpot**: Lead management and sales automation
- **Salesforce**: Enterprise CRM integration
- **Notion**: Project and knowledge management
- **ClickUp**: Task and project management

#### Marketing & Ads
- **Facebook Ads**: Campaign management
- **Google Ads**: Search and display advertising
- **TikTok Ads**: Social media advertising

#### Business Tools
- **Google Workspace**: Calendar, Drive, Docs, Sheets
- **Stripe**: Payment processing
- **QuickBooks**: Accounting integration
- **Shopify**: E-commerce platform

### Custom Webhooks

- **Incoming Webhooks**: Trigger workflows from external systems
- **Outgoing Webhooks**: Send data to external services
- **Event Routing**: Automatic event processing and routing

## 📊 Analytics & Reporting

### Agent Metrics
- Total interactions and success rates
- Average response times
- User satisfaction scores
- Performance trends

### Business Intelligence
- Automated insights generation
- Risk and opportunity identification
- Performance benchmarking
- Predictive analytics

### Dashboard Views
- Real-time agent status
- Workflow execution logs
- Integration health monitoring
- Usage analytics

## 🔐 Security & Compliance

### Multi-tenant Architecture
- **Row Level Security (RLS)**: Data isolation per team
- **Role-based Access Control**: Granular permissions
- **Audit Logging**: Complete activity tracking

### Data Protection
- **Encryption**: Data encrypted in transit and at rest
- **API Security**: OAuth 2.0 and secure token management
- **Privacy Controls**: Configurable data retention policies

### Compliance
- **GDPR Ready**: Data protection and privacy controls
- **SOC 2**: Security and availability standards
- **Enterprise SSO**: Single sign-on integration

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**
   - Netlify (recommended)
   - Vercel
   - AWS Amplify
   - Google Cloud Platform

3. **Configure production environment**
   - Set up production Supabase instance
   - Configure production API keys
   - Set up monitoring and logging

### Environment Variables

```env
# Required
VITE_GEMINI_API_KEY=your_production_gemini_key
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key

# Optional
VITE_GEMINI_MODEL=gemini-1.5-pro
VITE_APP_ENV=production
```

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Component Structure**: Follow established patterns

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- Check the `/docs` folder for detailed API documentation
- Review component stories in Storybook
- See examples in the `/examples` folder

### Community
- GitHub Issues for bug reports and feature requests
- Discord community for discussions
- Stack Overflow for technical questions

### Enterprise Support
- Dedicated support channels
- Custom integrations and training
- On-premise deployment options

## 🔮 Roadmap

### Upcoming Features
- **Advanced Analytics**: ML-powered business insights
- **Voice Integration**: Voice-activated agent interactions
- **Mobile App**: Native iOS and Android applications
- **Enterprise Features**: Advanced security and compliance
- **Marketplace**: Third-party agent and workflow templates

### Integration Expansion
- **Zapier**: 5000+ app integrations
- **Microsoft Power Automate**: Enterprise workflow automation
- **IFTTT**: Consumer automation platform
- **Custom APIs**: REST and GraphQL support

---

Built with ❤️ by the Nexus AI team. Transform your business with intelligent automation.
