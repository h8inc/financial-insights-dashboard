# Financial Dashboard Development Guide
*Complete architecture, setup, and implementation roadmap*


### About ME
- **Product Designer** with some coding experience and product management background
- **NOT a senior developer** - need detailed explanations and context
- **Learning-focused approach** - want to understand the "why" behind every decision
- **Incremental changes preferred** - small steps rather than large modifications

### Development Approach Guidelines
- 📚 **Educational Context**: Always explain concepts with reasoning and background
- 🔍 **Break Down Complexity**: Split complex topics into digestible parts
- 🛠️ **Step-by-Step Process**: Explain each code change individually with comments
- ⚠️ **Risk Alerts**: Use clear warnings for larger or risky changes
- ✋ **Confirmation Required**: Always pause and wait for approval before significant modifications

### Visual Alert System
- 👍 **Safe Changes**: Small, low-risk modifications
- ⚠️ **MODERATE RISK**: Medium complexity changes requiring review
- 🔴 **HIGH RISK MODIFICATION**: Large changes that could break functionality
- 🚨 **LARGE CHANGE ALERT**: Major architectural or structural modifications


## Project Overview
Building a reusable, highly customizable financial dashboard in Next.js/React focused on cash flow visualization with cross-device responsive design and drill-down functionality.

## Core Requirements

### Primary Features
- **Cash Flow Chart**: Main visualization with Activity/Balance filter modes
  - Activity view: Historical + projected money in/out flows
  - Balance view: Historical + projected balance tracking
- **Three Additional Charts**: Profit, Expenses, Revenue with identical drill-down patterns
- **Drill-Down Navigation**: Click any chart → full-page expanded view
- **Full-Page Features**:
  - Enhanced chart interactions and detailed visualization
  - Advanced filters specific to that metric
  - Transaction breakdown widget showing underlying data for selected period
- **Delta Comparisons**: Show vs previous period across all metrics (MASSIVE IMPACT FEATURE)

### Cross-Platform Requirements
- **Responsive Design**: Different interaction patterns for mobile vs desktop
- **Mobile**: Tap bar → data appears at top of chart (no tooltips)
- **Desktop**: Hover bar → tooltip appears directly on chart
- **Subscription States**: Full view for subscribers, obscured view for non-subscribers

## Technical Architecture

### State Management
- **Jotai** with atomic state management for optimal performance
- **Cross-Platform Ready**: Works seamlessly with Next.js SSR and future React Native expansion
- **Granular Updates**: Each filter, chart, and delta calculation as independent atoms
- **Automatic Dependencies**: Time filters → chart data → delta comparisons chain automatically
- **Surgical Re-renders**: Only components using specific atoms update, perfect for smooth animations
- **Complex Data Flows**: Ideal for financial dashboards with interconnected but independent metrics

### Component Architecture
- **Compound Component Pattern** for scalability
- **Dashboard Overview**: Main component with four chart thumbnails (cash flow, profit, expenses, revenue)
- **Reusable Chart Components**: Single chart component that adapts to different data types
- **Full-Page Chart View**: Expanded chart component with:
  - Enhanced interactions and detailed D3.js visualization
  - Chart-specific filter panel
  - Transaction breakdown widget with search/sort
- **Navigation System**: Seamless drill-down and back navigation with smooth transitions
- **Atomic Design Structure**: Atoms → Molecules → Organisms → Templates

### Technology Stack
- **Next.js 14+** with App Router and TypeScript
- **Jotai** for atomic state management
- **D3.js** integration with React for maximum chart customization
- **Tailwind CSS** for consistent styling across platforms
- **shadcn/ui** for base UI components
- **Lucide React** for icons
- **Framer Motion** for micro-interactions and animations

## Design Principles & Development Rules

### Core SOLID Principles for React
- **Single Responsibility**: Each component has ONE job (Chart, Filter, Widget)
- **Open/Closed**: Extend via props/composition, not modification
- **Liskov Substitution**: Custom components replace shadcn/ui without breaking
- **Interface Segregation**: Narrow, specific prop interfaces
- **Dependency Inversion**: Use abstractions (custom hooks) not concrete implementations

### Component Design Standards
- **Under 100 lines per component** - split larger ones
- **Descriptive naming**: `CashFlowChart` not `Chart`
- **Separate concerns**: UI rendering vs business logic vs data fetching
- **TypeScript interfaces** for all props and state
- **Atomic design methodology**: Atoms → Molecules → Organisms

### Performance & Architecture Rules
- **React.memo** for expensive renders
- **Custom hooks** for reusable logic (useChartData, useFilters)
- **Feature-based folder structure** not file type
- **Server Components** for static content, Client Components for interactivity
- **Error boundaries** for all data components

### Scalability Standards
- **Modular architecture** - add chart types without changing existing code
- **Consistent APIs** - all charts follow same prop structure
- **State isolation** - chart-specific state separate from shared state
- **Cross-platform ready** - Next.js + potential React Native expansion

## Project Setup Guide

### Prerequisites Installation
```bash
# Install Claude Code CLI
npm install -g @anthropic-ai/claude-code
# OR
pip install claude-code
```

### Step 1: Initialize Project
```bash
# Create Next.js project with all required features
npx create-next-app@latest financial-dashboard \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir

# Navigate to project
cd financial-dashboard

# Initialize Claude Code
claude-code init
```

### Step 2: Install Dependencies
```bash
# Core dependencies
npm install jotai d3 @types/d3 lucide-react recharts framer-motion

# shadcn/ui setup
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog input select badge alert tabs
```

### Step 3: Project Configuration
Create `.claude-code.json` in project root:
```json
{
  "framework": "next.js",
  "typescript": true,
  "tailwind": true,
  "ui_library": "shadcn/ui",
  "state_management": "jotai",
  "project_type": "financial-dashboard",
  "styling_approach": "tailwind-utilities",
  "animation_library": "framer-motion"
}
```

### Step 4: Folder Structure Setup
```
src/
├── app/                          # Next.js App Router
│   ├── dashboard/               # Main dashboard page
│   ├── charts/                  # Individual chart pages
│   │   ├── cash-flow/          # Cash flow drill-down
│   │   ├── profit/             # Profit drill-down  
│   │   ├── expenses/           # Expenses drill-down
│   │   └── revenue/            # Revenue drill-down
│   └── globals.css             # Global styles
├── components/                  # Reusable components
│   ├── ui/                     # shadcn/ui components
│   ├── charts/                 # Chart-specific components
│   ├── filters/                # Filter components
│   └── widgets/                # Transaction widgets
├── lib/                        # Utilities and configuration
│   ├── atoms.ts               # Jotai atoms
│   ├── types.ts               # TypeScript interfaces
│   └── utils.ts               # Helper functions
└── hooks/                      # Custom hooks
    ├── useChartData.ts
    ├── useFilters.ts
    └── useDeltaComparison.ts
```

## Figma Design System Setup

### Essential Design Tokens to Create
**Colors:**
- Primary: `blue-600` (charts), `green-500` (positive), `red-500` (negative)
- Neutral: `gray-50` to `gray-900` scale
- Success/Warning/Error: Standard semantic colors
- Chart palette: 6-8 distinct colors for different data series

**Typography:**
- Headings: `text-2xl`, `text-xl`, `text-lg` (chart titles)
- Body: `text-base`, `text-sm` (labels, data)
- Numbers: `font-mono` for financial values

**Spacing:**
- Grid: `4px` base unit (matching Tailwind)
- Chart margins: `16px`, `24px`, `32px`
- Component padding: `12px`, `16px`, `20px`

**Shadows & Effects:**
- Card shadows: `shadow-sm`, `shadow-md`, `shadow-lg`
- Hover states: `hover:shadow-lg`, subtle transforms

### Figma Components to Build
1. **Chart Containers** (4 variants: cash flow, profit, expenses, revenue)
2. **Filter Components** (time range, activity/balance toggles)
3. **Data Visualization Elements** (bars, lines, axes, legends)
4. **Transaction Widgets** (list items, summaries)
5. **Navigation Elements** (breadcrumbs, back buttons)
6. **Mobile vs Desktop States** for each component

### Figma to Code Workflow
**Preparation:**
- Export design tokens as CSS custom properties
- Take clean screenshots of each component state
- Document interaction specifications
- Create mobile and desktop versions

**Feeding to Claude Code:**
- Upload screenshots with each prompt
- Include specific Tailwind class mappings
- Reference component specifications
- Attach interaction behavior descriptions

## Development Strategy (Part-Time Friendly)

### Phase 1: Foundation (Week 1-2, 10-15 hours)
**Weekend Session 1 (4-5 hours):**
- Complete project setup and Figma design system
- Claude Code prompt: "Set up Next.js project structure with routing for dashboard and 4 chart drill-down pages"

**Evening Sessions (2-3 hours each):**
- Day 1: "Create responsive grid layout with 4 chart placeholder cards using Tailwind"
- Day 2: "Implement navigation between dashboard and individual chart pages"
- Day 3: "Add basic routing and page structure for all chart types"

**Deliverable**: Fully navigable wireframe with smooth transitions

### Phase 2: Filters & Delta System (Week 3-4, 12-16 hours)
**Weekend Session 2 (5-6 hours):**
- Claude Code prompt: "Implement Jotai atoms for filters and delta comparison system"

**Evening Sessions:**
- Day 1: "Create time range filter component with presets (7D, 30D, 3M, YTD)"
- Day 2: "Build delta comparison logic showing vs previous period"
- Day 3: "Connect filters to update all charts simultaneously"
- Day 4: "Add visual delta indicators (arrows, colors, percentages)"

**Deliverable**: Working filter system with period comparisons across all charts

### Phase 3: Chart Implementation (Week 5-6, 12-16 hours)
**Weekend Session 3 (5-6 hours):**
- Claude Code prompt: "Integrate D3.js with React for basic bar/line charts"

**Evening Sessions:**
- Day 1: "Implement cash flow chart with Activity/Balance modes"
- Day 2: "Create profit, expenses, revenue charts using same pattern"
- Day 3: "Add mobile tap vs desktop hover interactions"
- Day 4: "Build transaction breakdown widgets"

**Deliverable**: Functional charts with drill-down and transaction details

### Phase 4: Polish & Advanced Features (Week 7, 8-12 hours)
**Weekend Session 4 (4-5 hours):**
- Claude Code prompt: "Add animations, subscription states, and final polish"

**Evening Sessions:**
- Day 1: "Implement subscription-based chart obscuring"
- Day 2: "Add micro-interactions and smooth transitions"
- Day 3: "Performance optimization and testing"

**Deliverable**: Production-ready dashboard

## Claude Code Prompt Templates

### Foundation Phase Prompts
```
Prompt 1: "Set up Next.js 14 project with TypeScript, Tailwind, and Jotai. Create routing structure for dashboard and 4 chart drill-down pages (cash-flow, profit, expenses, revenue). Follow the attached architecture document."

Prompt 2: "Create responsive dashboard grid layout with 4 chart placeholder cards. Each card should show chart type, current value, and delta comparison. Use Tailwind for styling and make clickable for navigation."

Prompt 3: "Implement drill-down navigation with smooth transitions. Add breadcrumbs and back buttons. Each chart page should have expanded layout ready for chart integration."
```

### Core Development Prompts
```
Prompt 4: "Set up Jotai atoms for time range filters, chart data, and delta comparisons. Create custom hooks useFilters and useDeltaComparison. Follow atomic state management patterns."

Prompt 5: "Build time range filter component with preset options (7D, 30D, 3M, YTD) and custom date picker. Connect to Jotai atoms to update all charts simultaneously."

Prompt 6: "Implement delta comparison system showing percentage change vs previous period. Add visual indicators (green/red colors, up/down arrows). Apply across all chart types."
```

### Chart Implementation Prompts
```
Prompt 7: "Integrate D3.js with React for cash flow chart. Implement Activity mode (money in/out) and Balance mode (balance tracking). Add responsive interactions: mobile tap shows data at top, desktop hover shows tooltips."

Prompt 8: "Create reusable chart component that works for profit, expenses, and revenue. Use same D3.js pattern as cash flow but adapt for different data structures."

Prompt 9: "Build transaction breakdown widget that appears in drill-down views. Show underlying transactions for selected time period with search and sort functionality."
```

## Part-Time Success Tips

### Efficient Claude Code Sessions
- **Prepare screenshots and specs before coding sessions**
- **Work on related features together** (all filters in one session)
- **Use weekends for complex integrations** (D3.js setup)
- **Use weeknights for smaller components** (buttons, widgets)

### Time Management
- **Document your progress** after each session
- **Prepare next session's prompts** in advance
- **Use mock data** to avoid backend complexity
- **Focus on one chart type fully** before moving to others

### Realistic Expectations
**Total Time Investment: 40-60 hours over 6-7 weeks**
- **Setup & Foundation**: 15 hours
- **Core Functionality**: 20 hours  
- **Charts & Interactions**: 20 hours
- **Polish & Testing**: 10 hours

**Key Success Factor**: Your architecture planning upfront means Claude Code can work efficiently without major refactoring. Each session builds logically on the previous one.

This timeline assumes 2-3 productive hours per day, which is realistic for someone with a full-time job. The phased approach ensures you have a working product at each milestone!