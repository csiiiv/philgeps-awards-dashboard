# Page Components

This directory contains top-level page components that represent full application views.

## 📁 Components

- **`About.tsx`** - About page with project and technical information
- **`ApiDocumentation.tsx`** - API documentation integration page
- **`Help.tsx`** - Help and user guide page

## 📄 Page Components Overview

### About.tsx
- **Purpose**: Project information, technical details, and data sources
- **Content**: 
  - Project overview and mission
  - Technical architecture details
  - Data coverage statistics
  - Version information and changelog highlights
  - Team and acknowledgments
- **Features**:
  - Responsive layout with sections
  - Statistics displays with formatted numbers
  - External links to documentation
  - Version history summary

### ApiDocumentation.tsx  
- **Purpose**: Interactive API documentation interface
- **Content**:
  - Swagger UI integration for live API testing
  - ReDoc documentation for comprehensive API reference
  - OpenAPI 3.0 schema display
  - Code examples and request/response samples
- **Features**:
  - Embedded Swagger UI iframe
  - Direct links to API endpoints
  - Interactive "Try it out" functionality
  - Real-time API testing capabilities

### Help.tsx
- **Purpose**: User guidance and feature documentation
- **Content**:
  - Getting started guide
  - Feature explanations and tutorials
  - Search tips and best practices
  - Troubleshooting common issues
  - FAQ section
- **Features**:
  - Searchable help content
  - Step-by-step tutorials
  - Interactive examples
  - Contact information and support links

## 🎯 Page Architecture

### Layout Structure
```typescript
const PageLayout = ({ children, title, description }) => (
  <PageContainer>
    <PageHeader>
      <PageTitle>{title}</PageTitle>
      <PageDescription>{description}</PageDescription>
    </PageHeader>
    <PageContent>
      {children}
    </PageContent>
  </PageContainer>
);
```

### Common Features
- **Responsive Design**: Mobile-friendly layouts
- **Theme Integration**: Support for light/dark mode
- **Navigation Integration**: Consistent with main app navigation
- **Loading States**: Graceful loading for dynamic content
- **Error Boundaries**: Proper error handling and fallbacks

## 🔗 Navigation Integration

### Tab Configuration
These pages are integrated with the main tab navigation system:
```typescript
// In constants/tabs.ts
export const TABS = {
  HELP: {
    id: 'help',
    component: Help,
    path: '/help'
  },
  ABOUT: {
    id: 'about', 
    component: About,
    path: '/about'
  },
  API_DOCS: {
    id: 'api-docs',
    component: ApiDocumentation,
    path: '/api-docs'
  }
};
```

### Route Integration
```typescript
// In router configuration
<Routes>
  <Route path="/help" element={<Help />} />
  <Route path="/about" element={<About />} />
  <Route path="/api-docs" element={<ApiDocumentation />} />
</Routes>
```

## 📊 Content Management

### Static Content
- **Markdown Integration**: Support for markdown content
- **Content Sections**: Organized, scannable information architecture
- **Typography Hierarchy**: Clear heading and text organization
- **Visual Elements**: Icons, images, and formatting for readability

### Dynamic Content  
- **API Integration**: Live data from backend for statistics
- **Version Information**: Dynamic version displays
- **Real-time Status**: API health and system status
- **Interactive Elements**: Expandable sections, tabs, accordions

## 🎨 Design Patterns

### Information Architecture
- **Progressive Disclosure**: Show overview first, details on demand
- **Scannable Layout**: Headers, lists, and visual breaks
- **Call-to-Action**: Clear next steps and important actions
- **Cross-References**: Links between related sections

### User Experience
- **Quick Access**: Jump-to-section navigation
- **Search Functionality**: Find specific information quickly
- **Copy-Friendly**: Easy-to-copy code examples and URLs
- **Mobile Optimization**: Touch-friendly interactions

## 🔧 Component Structure

### Common Props Interface
```typescript
interface PageProps {
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}
```

### Shared Utilities
- **Page Metadata**: Dynamic title and description setting
- **Analytics Tracking**: Page view and interaction tracking
- **SEO Optimization**: Meta tags and structured data
- **Performance**: Lazy loading and code splitting

---

Part of the [Frontend Source](../) providing full-page views and static content pages for the dashboard application.