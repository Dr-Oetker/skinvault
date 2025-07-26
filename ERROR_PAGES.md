# Error Pages Documentation

This document describes the error pages implemented in SkinVault and how to use them.

## Overview

The application includes comprehensive error handling with custom error pages that match the app's design. All error pages include:

- **Consistent Design**: Matches the app's dark theme and glass-card styling
- **Navigation Options**: Multiple ways to get back to the main functionality
- **Quick Links**: Direct access to key features
- **Responsive Design**: Works on all device sizes

## Error Pages

### 1. 404 - Page Not Found (`/404`)
- **Path**: `/404`
- **Use Case**: When a user tries to access a non-existent page
- **Features**:
  - "Go to Homepage" button
  - "Go Back" button (browser history)
  - Quick links to main features

### 2. 500 - Server Error (`/500`)
- **Path**: `/500`
- **Use Case**: When server-side errors occur
- **Features**:
  - "Go to Homepage" button
  - "Try Again" button (page reload)
  - Quick links to main features

### 3. 403 - Access Denied (`/403`)
- **Path**: `/403`
- **Use Case**: When users don't have permission to access a resource
- **Features**:
  - "Go to Homepage" button
  - "Log In" button
  - Quick links to main features

### 4. Generic Error Page (`Error.tsx`)
- **Use Case**: Customizable error page for specific scenarios
- **Features**:
  - Customizable error code, title, and message
  - Custom icons
  - Custom primary and secondary actions

## Error Boundary

The application includes an `ErrorBoundary` component that catches JavaScript errors and displays the generic error page. It's wrapped around the entire application in `App.tsx`.

## Error Handling Utilities

### `src/utils/errorHandling.ts`

Provides utility functions for handling errors programmatically:

#### `handleApiError(error, navigate)`
Handles API errors and navigates to appropriate error pages based on error status:

```typescript
import { handleApiError } from '../utils/errorHandling';

try {
  const { data, error } = await supabase.from('table').select('*');
  if (error) {
    handleApiError(error, navigate);
    return;
  }
} catch (error) {
  handleApiError(error, navigate);
}
```

#### `navigateToError(navigate, errorType, message)`
Directly navigate to a specific error page:

```typescript
import { navigateToError, ErrorType } from '../utils/errorHandling';

navigateToError(navigate, ErrorType.NOT_FOUND, 'Resource not found');
```

#### Error Types
- `ErrorType.NOT_FOUND` - 404 errors
- `ErrorType.SERVER_ERROR` - 500 errors
- `ErrorType.ACCESS_DENIED` - 403 errors
- `ErrorType.NETWORK_ERROR` - Network connectivity issues
- `ErrorType.UNKNOWN` - Generic errors

## Implementation Examples

### 1. API Error Handling

```typescript
const fetchData = async () => {
  try {
    const { data, error } = await supabase.from('table').select('*');
    if (error) {
      handleApiError(error, navigate);
      return;
    }
    setData(data);
  } catch (error) {
    handleApiError(error, navigate);
  }
};
```

### 2. Custom Error Page

```typescript
import Error from '../pages/Error';

<Error 
  code="Custom"
  title="Custom Error"
  message="This is a custom error message"
  primaryAction={{
    label: "Custom Action",
    action: () => console.log('Custom action'),
    icon: <CustomIcon />
  }}
/>
```

### 3. Route Protection

```typescript
// In a protected route component
if (!user || !isAdmin(user)) {
  navigateToError(navigate, ErrorType.ACCESS_DENIED, 'Admin access required');
  return null;
}
```

## Routing

Error pages are integrated into the main routing system:

```typescript
// In App.tsx
<Routes>
  {/* Regular routes */}
  <Route path="/" element={<Home />} />
  
  {/* Error pages */}
  <Route path="404" element={<Error404 />} />
  <Route path="500" element={<Error500 />} />
  <Route path="403" element={<Error403 />} />
  
  {/* Catch-all route */}
  <Route path="*" element={<Error404 />} />
</Routes>
```

## Styling

All error pages use the app's design system:

- **Background**: Gradient from dark-bg-primary to dark-bg-tertiary
- **Container**: Glass-card with rounded corners and shadow
- **Typography**: Consistent with app's text hierarchy
- **Buttons**: Primary and secondary button styles
- **Icons**: SVG icons with consistent styling

## Best Practices

1. **Always handle API errors**: Use `handleApiError` for all API calls
2. **Provide meaningful messages**: Give users clear information about what went wrong
3. **Multiple navigation options**: Always provide multiple ways to recover
4. **Log errors**: Use the `logError` utility for monitoring
5. **Test error scenarios**: Ensure error pages work in all scenarios

## Customization

To customize error pages:

1. **Modify existing pages**: Edit the specific error page components
2. **Create new error types**: Add new routes and components
3. **Update error handling**: Modify `handleApiError` for new error types
4. **Custom styling**: Update CSS classes to match your design

## Monitoring

The error handling system includes logging capabilities that can be integrated with:

- **Sentry**: For error tracking
- **LogRocket**: For session replay
- **Custom analytics**: For error reporting

Use the `logError` function to send error data to your monitoring service. 