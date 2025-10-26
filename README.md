# InView AI - Call Center Performance Intelligence

An AI-powered performance management tool for BPO call centers, specifically designed for UK home insurance operations (Hastings Direct).

## 🎯 Features

- **AI-Powered Insights**: Enhanced LLM prompts with industry expert personas (Sarah Chen for coaching, Marcus Reid for quick prep, Dr. Aisha Patel for analytics)
- **Agent Management**: Add, archive, and manage agents while preserving complete historical data
- **Performance Analytics**: Quality, AHT, SRR, VOC, and Team Health KPIs with predictive alerts
- **Coaching Tools**: Automated coaching prep, action plans, and effectiveness tracking
- **Audit Analysis**: Call transcript analysis with quality scoring and development recommendations
- **Real-Time Updates**: Live dashboard updates when new data is imported (with Supabase)

## 🏗️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- **AI**: Groq API (Llama 3.3 70B) with enhanced industry-specific prompts
- **Database**: SQLite (migrating to Supabase PostgreSQL)
- **UI Components**: shadcn/ui, Recharts for visualizations
- **Deployment**: Vercel with GitHub Actions CI/CD

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Groq API key (for AI features)
- Supabase account (for cloud database)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/inview-ai-bpo.git
cd inview-ai-bpo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create `.env.local` file:

```bash
# AI Provider
GROQ_API_KEY=your_groq_api_key_here

# Supabase (once migrated)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here
```

### 4. Run database migrations

```bash
# For SQLite (current)
npm run db:push

# For Supabase (after migration)
npm run migrate:supabase
```

### 5. Seed sample data (optional)

```bash
npm run db:seed
```

### 6. Start development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
inview-ai/
├── app/                    # Next.js app directory
│   ├── agents/            # Agent profiles and insights
│   ├── api/               # API routes for data operations
│   ├── coaching/          # Coaching tools and calendar
│   ├── audits/            # Call audit analysis
│   └── dashboard/         # Main performance dashboard
├── components/            # React components
│   ├── agents/           # Agent-specific components
│   ├── coaching/         # Coaching widgets
│   ├── dashboard/        # Dashboard cards and charts
│   └── ui/               # Shared UI components (shadcn)
├── lib/                   # Core libraries
│   ├── groq.ts           # AI prompt functions (10 enhanced prompts)
│   ├── generateKPIInsights.ts  # KPI-specific insights
│   ├── generateCoachingPrep.ts # Coaching plan generation
│   ├── db.ts             # Database connection
│   └── parsers/          # File upload parsers
├── db/                    # Database files
│   ├── schema.ts         # Drizzle ORM schema
│   └── seed.ts           # Sample data generator
└── types/                 # TypeScript type definitions
```

## 🔑 Key Features Explained

### Agent Management
- Add new agents when they join your team
- Archive agents when they leave (preserves all historical data)
- Each agent maintains complete performance history
- AI references full agent history for personalized insights

### Data Import from Hastings Direct
- Upload CSV/Excel reports from Hastings Direct
- Automatic agent name matching and data import
- Supports: Quality audits, KPIs, attendance, coaching records
- Import history tracked for audit purposes

### AI-Powered Insights
- **20 Enhanced Prompts** with industry expert personas
- Quality assessment with FCA compliance awareness
- Predictive performance forecasting (7-day outlook)
- Root cause analysis for performance issues
- Coaching effectiveness tracking

### Dashboard
- Team overview with KPI cards
- Agent performance trends
- Predictive alerts for at-risk agents
- Weekend vs weekday performance analysis
- Coaching impact visualization

## 🗄️ Database Schema

### Core Tables
- **agents**: Agent profiles and status
- **kpis**: Daily performance metrics (Quality, AHT, SRR, VOC)
- **audits**: Call quality assessments with transcripts
- **coaching_sessions**: Coaching plans and outcomes
- **leave_records**: Absence tracking
- **upload_history**: Data import audit trail

### Soft Delete Strategy
Agents are never truly deleted. When "deleted", they're archived with:
- `status = 'archived'`
- `deleted_at = timestamp`
- All historical KPIs, audits, and coaching records remain intact
- AI can still reference their data for insights

## 🔄 Migration to Supabase

Follow `/docs/SUPABASE_MIGRATION.md` for step-by-step guide (see repository).

Benefits:
- Cloud backup and disaster recovery
- Multi-user access with real-time sync
- Scalability for large teams
- Row-level security (future: manager-specific access)

## 📊 Typical Workflow

1. **Morning**: Check dashboard for overnight performance alerts
2. **Data Import**: Upload yesterday's Hastings Direct reports
3. **Review Insights**: AI analyzes patterns and flags at-risk agents
4. **Coaching Prep**: Generate coaching plans for scheduled sessions
5. **Conduct Coaching**: Use AI-generated talking points and action plans
6. **Track Progress**: Monitor coaching effectiveness over 30 days
7. **Weekly Report**: Generate executive summary for leadership

## 🎨 UI Components

Built with **shadcn/ui**:
- Clean, modern interface
- Accessible and responsive
- Consistent design system
- Dark mode support (coming soon)

## 🔐 Security Considerations

### Current (Single User)
- Environment variables in `.env.local` (never committed)
- API keys secured locally
- SQLite database local to machine

### Future (Multi-User with Supabase)
- Row-level security policies
- Manager-specific data access
- Audit logging for data changes
- SSO integration options

## 📈 Performance

- **Dashboard Load**: < 2s with 90 days of data
- **AI Insights Generation**: 3-8s depending on prompt complexity
- **File Upload**: < 5s for typical weekly reports
- **Real-time Updates**: < 100ms latency (with Supabase)

## 🛠️ Development

### Running Tests
```bash
npm run test
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Database Operations
```bash
# Push schema changes
npm run db:push

# Generate migrations
npm run db:generate

# View database in Drizzle Studio
npm run db:studio
```

## 🐛 Troubleshooting

### AI Insights Return 500 Error
- Check GROQ_API_KEY is set in `.env.local`
- Verify API key is valid at console.groq.com
- Check rate limits (20 requests/minute on free tier)

### Upload Fails
- Verify CSV/Excel format matches expected columns
- Check agent names match existing agents in database
- Review browser console for specific error messages

### Dashboard Slow
- Limit date range to 90 days or less
- Check database size (SQLite < 1GB recommended)
- Consider migrating to Supabase for better performance

## 📝 License

Proprietary - Internal BPO Tool

## 🤝 Support

For issues or questions:
1. Check `/docs` folder for guides
2. Review error logs in browser console
3. Contact development team

## 🗺️ Roadmap

- [ ] Complete Supabase migration
- [ ] Add multi-user authentication
- [ ] Real-time dashboard updates
- [ ] Mobile responsive design improvements
- [ ] Export reports to PDF
- [ ] Advanced predictive analytics
- [ ] Integration with Hastings Direct API (if available)
- [ ] Team comparison analytics

---

**Built with ❤️ for call center excellence**
