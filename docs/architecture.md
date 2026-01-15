# Claude Widget Architecture Design

## Overview

This document proposes a TypeScript-based architecture for the Claude Widget project, applying modern design principles to improve maintainability, testability, and scalability.

## Current State Analysis

### Problems with Current Architecture

The current codebase (`claude-sessions.jsx`) is a single 1,500+ line file containing:

1. **Mixed concerns** - UI components, business logic, data fetching, and styling in one file
2. **No type safety** - Plain JavaScript without TypeScript types
3. **Hard to test** - UI and logic are tightly coupled
4. **No clear boundaries** - Data parsing, formatting, and rendering intermingled
5. **Difficult to extend** - Adding new features requires modifying the monolithic file

## Proposed Architecture

### Design Philosophy

We adopt a **Feature-Based Clean Architecture** that combines:

- [Clean Architecture](https://dev.to/dvorlandi/implementing-clean-architecture-with-typescript-3jpc) - Separation of concerns into layers
- [Feature-Based Structure](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md) - Code organized by domain/feature
- [Domain-Driven Design](https://khalilstemmler.com/articles/typescript-domain-driven-design/ddd-frontend/) principles for complex business logic

### Core Principles

1. **Separation of Concerns** - Each module has a single responsibility
2. **Dependency Inversion** - High-level modules don't depend on low-level modules
3. **Testability First** - Business logic is isolated and easily testable
4. **Type Safety** - TypeScript for compile-time error catching
5. **Feature Cohesion** - Related code lives together

## Proposed Directory Structure

```
claude-widget/
├── src/
│   ├── features/                    # Feature modules
│   │   ├── usage-stats/             # Claude usage statistics feature
│   │   │   ├── components/          # UI components
│   │   │   │   ├── UsageChart.tsx
│   │   │   │   ├── UsageLimits.tsx
│   │   │   │   └── CostDisplay.tsx
│   │   │   ├── hooks/               # Feature-specific hooks
│   │   │   │   └── useUsageData.ts
│   │   │   ├── types/               # TypeScript types
│   │   │   │   └── index.ts
│   │   │   ├── utils/               # Feature utilities
│   │   │   │   └── formatters.ts
│   │   │   └── index.ts             # Public API
│   │   │
│   │   ├── sessions/                # Session management feature
│   │   │   ├── components/
│   │   │   │   ├── SessionList.tsx
│   │   │   │   ├── ActiveSession.tsx
│   │   │   │   └── CompletedSession.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useSessions.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   ├── actions/             # Session actions (resume, etc.)
│   │   │   │   └── ghostty.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── github-prs/              # GitHub PR feature
│   │   │   ├── components/
│   │   │   │   ├── PRList.tsx
│   │   │   │   ├── PRItem.tsx
│   │   │   │   └── ReviewRequests.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useGitHubPRs.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   ├── utils/
│   │   │   │   └── statusMappers.ts
│   │   │   └── index.ts
│   │   │
│   │   └── github-activity/         # GitHub activity feature
│   │       ├── components/
│   │       │   ├── ActivityChart.tsx
│   │       │   └── WeeklySummary.tsx
│   │       ├── types/
│   │       │   └── index.ts
│   │       └── index.ts
│   │
│   ├── shared/                      # Shared code across features
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Card.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Button.tsx
│   │   ├── hooks/                   # Shared hooks
│   │   │   ├── useCommand.ts        # Übersicht command execution
│   │   │   └── useBrowser.ts        # Browser open utility
│   │   ├── styles/                  # Shared styles
│   │   │   ├── tokens.ts            # Design tokens (colors, spacing)
│   │   │   └── glassmorphism.ts     # Glass effect styles
│   │   ├── types/                   # Shared types
│   │   │   └── common.ts
│   │   └── utils/                   # Shared utilities
│   │       ├── formatters.ts        # Generic formatters
│   │       └── parsers.ts           # Data parsers
│   │
│   ├── domain/                      # Domain models (optional, for complex logic)
│   │   ├── entities/                # Core business entities
│   │   │   ├── Session.ts
│   │   │   ├── PullRequest.ts
│   │   │   └── UsageData.ts
│   │   └── services/                # Domain services
│   │       └── UsageCalculator.ts
│   │
│   ├── infrastructure/              # External integrations
│   │   ├── cache/                   # Cache file readers
│   │   │   └── CacheReader.ts
│   │   ├── github/                  # GitHub API integration
│   │   │   └── GitHubClient.ts
│   │   └── shell/                   # Shell command execution
│   │       └── CommandExecutor.ts
│   │
│   ├── app/                         # Application composition
│   │   ├── Widget.tsx               # Main widget component
│   │   ├── WidgetMinimized.tsx      # Minimized state
│   │   └── providers/               # Context providers
│   │       └── WidgetProvider.tsx
│   │
│   └── index.tsx                    # Entry point (exports for Übersicht)
│
├── scripts/                         # Shell scripts
│   ├── update-usage-cache.sh
│   ├── update-github-activity.sh
│   └── update-reviewer-prs.sh
│
├── tests/                           # Test utilities and setup
│   └── setup.ts
│
├── docs/                            # Documentation
│   ├── architecture.md              # This file
│   └── api.md                       # API documentation
│
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Layer Responsibilities

### 1. Features Layer (`src/features/`)

Each feature is a self-contained module with its own:

- **Components**: UI components specific to the feature
- **Hooks**: Data fetching and state management
- **Types**: TypeScript interfaces and types
- **Utils**: Feature-specific utilities
- **Actions**: Side effects (e.g., opening terminal)

**Rule**: Features should not import from other features. Cross-feature composition happens at the app level.

### 2. Shared Layer (`src/shared/`)

Reusable code that multiple features depend on:

- **Components**: Generic UI components (Button, Card, Badge)
- **Hooks**: Generic hooks (useCommand, useBrowser)
- **Styles**: Design tokens and shared style objects
- **Utils**: Generic utilities (formatters, parsers)

### 3. Domain Layer (`src/domain/`)

Core business logic that is framework-agnostic:

- **Entities**: Business objects with behavior
- **Services**: Complex business calculations

**Rule**: Domain layer has no dependencies on other layers.

### 4. Infrastructure Layer (`src/infrastructure/`)

External system integrations:

- **Cache**: File system cache readers
- **GitHub**: GitHub API clients
- **Shell**: Command execution wrappers

**Rule**: Infrastructure implements interfaces defined by domain/features.

### 5. App Layer (`src/app/`)

Application composition and orchestration:

- **Widget**: Main component that composes features
- **Providers**: Context providers for shared state

## Type System Design

### Example Type Definitions

```typescript
// src/features/usage-stats/types/index.ts
export interface DailyUsage {
  date: string;
  totalCost: number;
  totalTokens: number;
}

export interface UsageLimits {
  fiveHour: UsageLimit;
  sevenDay: UsageLimit;
  sevenDaySonnet: UsageLimit;
}

export interface UsageLimit {
  utilization: number;
  resetsAt: string | null;
}

// src/features/github-prs/types/index.ts
export interface PullRequest {
  number: number;
  title: string;
  url: string;
  reviewDecision: ReviewDecision | null;
  ciStatus: CIStatus | null;
  commentCount: number;
  repository: Repository;
}

export type ReviewDecision = 'APPROVED' | 'CHANGES_REQUESTED' | 'REVIEW_REQUIRED';
export type CIStatus = 'SUCCESS' | 'FAILURE' | 'PENDING';

// src/features/sessions/types/index.ts
export interface Session {
  sessionId: string;
  name: string;
  cwd: string;
  display?: string;
  needsInput?: boolean;
  status: 'active' | 'completed';
}
```

## Component Design Pattern

### Presentational vs Container Pattern

```typescript
// Container (hooks + logic)
// src/features/usage-stats/hooks/useUsageData.ts
export function useUsageData(rawData: string) {
  const parsed = useMemo(() => parseUsageData(rawData), [rawData]);
  const totals = useMemo(() => calculateTotals(parsed), [parsed]);
  return { daily: parsed, totals };
}

// Presentational (pure UI)
// src/features/usage-stats/components/UsageChart.tsx
interface UsageChartProps {
  data: DailyUsage[];
  maxCost: number;
}

export function UsageChart({ data, maxCost }: UsageChartProps) {
  return (
    <div style={chartStyle}>
      {data.map((day) => (
        <Bar key={day.date} height={day.totalCost / maxCost} />
      ))}
    </div>
  );
}
```

## Testing Strategy

### Test File Co-location

```
src/features/usage-stats/
├── utils/
│   ├── formatters.ts
│   └── formatters.test.ts      # Co-located test
├── hooks/
│   ├── useUsageData.ts
│   └── useUsageData.test.ts    # Co-located test
└── components/
    ├── UsageChart.tsx
    └── UsageChart.test.tsx     # Co-located test
```

### Test Categories

1. **Unit Tests**: Pure functions (formatters, parsers, mappers)
2. **Hook Tests**: Custom hooks with `@testing-library/react-hooks`
3. **Component Tests**: UI components with `@testing-library/react`
4. **Integration Tests**: Feature modules as a whole

## Migration Strategy

### Phase 1: TypeScript Setup

1. Add `tsconfig.json` configuration
2. Rename `.js` files to `.ts`/`.tsx`
3. Add basic types

### Phase 2: Extract Shared Utilities

1. Move formatters to `src/shared/utils/`
2. Move style objects to `src/shared/styles/`
3. Add comprehensive tests

### Phase 3: Feature Extraction

1. Extract `usage-stats` feature
2. Extract `sessions` feature
3. Extract `github-prs` feature
4. Extract `github-activity` feature

### Phase 4: Infrastructure Layer

1. Create cache reader abstraction
2. Create shell command executor
3. Add integration tests

### Phase 5: Final Composition

1. Create main Widget component
2. Wire up all features
3. End-to-end testing

## Build Configuration

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@features/*": ["./src/features/*"],
      "@shared/*": ["./src/shared/*"],
      "@domain/*": ["./src/domain/*"],
      "@infra/*": ["./src/infrastructure/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

## References

- [Clean Architecture with TypeScript](https://dev.to/dvorlandi/implementing-clean-architecture-with-typescript-3jpc)
- [Bulletproof React - Project Structure](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)
- [DDD on the Frontend](https://khalilstemmler.com/articles/typescript-domain-driven-design/ddd-frontend/)
- [React Folder Structure in 5 Steps](https://www.robinwieruch.de/react-folder-structure/)
- [TypeScript Design Patterns](https://refactoring.guru/design-patterns/typescript)
- [Feature-Based Architecture](https://asrulkadir.medium.com/3-folder-structures-in-react-ive-used-and-why-feature-based-is-my-favorite-e1af7c8e91ec)

## Conclusion

This architecture provides:

1. **Clear boundaries** - Each feature is self-contained
2. **Testability** - Business logic separated from UI
3. **Scalability** - Easy to add new features
4. **Type safety** - TypeScript prevents runtime errors
5. **Maintainability** - Code organized by domain, not technical concern

The migration can be done incrementally, starting with TypeScript setup and gradually extracting features while maintaining a working widget throughout the process.
