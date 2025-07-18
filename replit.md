# DevMatch - Developer & Tool Discovery Platform

## Overview

DevMatch is a Tinder-like application for developers to find collaboration partners and discover development tools. It features a swipe-based interface for matching developers with other developers or exploring development tools that fit their tech stack.

## User Preferences

Preferred communication style: Simple, everyday language.
Design preference: Profiles should be more prominent in the design with enhanced visual impact.

## Recent Changes

### January 18, 2025 - Enhanced Profile Prominence & Quick Win Features
- Redesigned profile cards with larger images (h-64 vs h-48), enhanced gradients, and more prominent name/title overlays
- Added colorful skill badges with different colors for visual variety
- Enhanced tool cards with larger logos, better spacing, and more prominent information display
- Improved profile detail modals with larger headers (h-72) and enhanced visual hierarchy
- Updated card stack height to h-[500px] for better profile showcase
- Changed discover page background to gray-50 for better card contrast
- Added sample tool data including VS Code, Docker, Figma, GitHub, Notion, and PostgreSQL

**New Quick Win Features:**
- Advanced filtering system with skills, experience, availability, and tool categories
- Profile completion prompts to encourage users to complete their profiles
- Undo last swipe functionality for better user experience
- Trending tools section to showcase popular development tools
- Match preferences system for personalized matching criteria

### January 18, 2025 - Full Feature Implementation
**Major Features Added:**
- Smart AI-powered compatibility analysis with detailed matching scores
- Enhanced chat system with conversation starters, typing indicators, and match expiration
- Team formation system for multi-developer project collaboration
- Project management board with Kanban-style task tracking
- Freelance job board with posting, filtering, and application system
- GitHub integration for automatic skill detection and portfolio import
- Portfolio showcase with image galleries and project demonstrations
- Availability calendar for scheduling collaboration sessions
- Skill recommendation engine based on current tech stack
- Activity indicators showing user engagement levels and online status
- Quick action buttons for like, super like, bookmark, and messaging
- Voice message support and advanced messaging features

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **WebSocket**: Real-time messaging support
- **Database Provider**: Neon serverless PostgreSQL

### Mobile-First Design
- Responsive design optimized for mobile devices
- Touch-friendly swipe gestures
- Bottom navigation pattern
- Card-based interface similar to dating apps

## Key Components

### Authentication System
- **Provider**: Replit Auth integration
- **Session Storage**: PostgreSQL-backed sessions
- **Security**: HTTP-only cookies, CSRF protection
- **User Management**: Automatic user creation/updates from OIDC claims

### Database Schema
- **Users**: Core user information from Replit Auth
- **Developer Profiles**: Extended profile data (skills, experience, availability)
- **Tool Profiles**: Development tools and integrations
- **Projects**: User-created projects for collaboration
- **Swipes**: User interactions (like/pass/super_like)
- **Matches**: Mutual likes between users
- **Messages**: Real-time chat between matched users

### Discovery Engine
- **Card Stack**: Swipeable interface for browsing profiles/tools
- **Filtering**: Based on skills, experience, location, availability
- **Matching Algorithm**: Mutual interest detection
- **Real-time Updates**: Live match notifications

### Messaging System
- **WebSocket**: Real-time message delivery
- **Chat Interface**: Mobile-optimized conversation view
- **Message History**: Persistent message storage
- **Match Context**: Chat tied to specific matches

## Data Flow

1. **Authentication**: User signs in via Replit Auth → session created → user profile loaded
2. **Profile Setup**: New users complete developer profile → stored in database
3. **Discovery**: User swipes through profiles/tools → swipe actions recorded
4. **Matching**: Mutual likes detected → match created → notification sent
5. **Messaging**: Users can chat → messages sent via WebSocket → stored in database

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database connection and query execution
- **drizzle-orm**: Type-safe database operations and migrations
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React routing
- **passport**: Authentication middleware
- **openid-client**: OIDC authentication flow

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives (dialogs, forms, etc.)
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **react-hook-form**: Form state management and validation

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **drizzle-kit**: Database schema management and migrations

## Deployment Strategy

### Development Environment
- **Server**: Express.js development server with hot reload
- **Client**: Vite development server with HMR
- **Database**: Neon serverless PostgreSQL
- **Session Storage**: PostgreSQL sessions table

### Production Build
- **Frontend**: Static assets built by Vite
- **Backend**: Node.js server bundled with esbuild
- **Database**: Production Neon PostgreSQL instance
- **Environment**: Replit hosting platform

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit environment identifier
- `ISSUER_URL`: OIDC provider URL
- `REPLIT_DOMAINS`: Allowed domains for CORS

The application follows a modern full-stack architecture with emphasis on type safety, real-time features, and mobile-first user experience. The enhanced matching system now includes AI-powered compatibility analysis, comprehensive team formation tools, project management capabilities, and a full freelance marketplace - making it a complete developer collaboration ecosystem.