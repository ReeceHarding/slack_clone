# Logging Guide

## Overview
This guide outlines our logging standards and best practices for effective debugging and monitoring. Good logging is about telling a story - each log entry should provide context about what happened, when it happened, and why it happened.

## Table of Contents
1. [Critical Information to Collect](#critical-information-to-collect)
2. [Logging Patterns](#logging-patterns)
3. [Best Practices](#best-practices)
4. [Examples](#examples)
5. [Performance Considerations](#performance-considerations)

## Critical Information to Collect

### 1. Error Context
- Full error message and stack trace
- Component hierarchy where error occurred
- State of the application when error happened
- User actions that led to the error
- Browser console errors
- Network request failures

### 2. Component State
```javascript
// Good: Comprehensive component state logging
logger.debug('Component state:', {
  props: {
    hasMessage: !!message,
    hasUser: !!user,
    isLoading,
    timestamp: new Date().toISOString()
  },
  state: {
    dataLoaded: !!data,
    errorState: !!error,
    retryCount
  },
  context: {
    hasWorkspace: !!workspace,
    hasAuth: !!auth,
    environment: process.env.NODE_ENV
  }
})
```

### 3. Data Flow
```javascript
// Good: Track data through the system
logger.debug('Data flow:', {
  input: {
    raw: inputData,
    validated: isValid,
    transformed: transformedData
  },
  processing: {
    stage: 'validation',
    result: validationResult,
    errors: validationErrors
  },
  output: {
    formatted: formattedData,
    ready: isReady,
    timestamp: new Date().toISOString()
  }
})
```

### 4. Real-time Events
```javascript
// Good: Real-time event logging
logger.debug('Real-time event:', {
  type: 'subscription_update',
  channel: channelName,
  payload: {
    new: newData,
    old: oldData,
    type: eventType
  },
  metadata: {
    timestamp: new Date().toISOString(),
    sessionId,
    userId
  }
})
```

### 5. User Interactions
```javascript
// Good: User interaction logging
logger.debug('User interaction:', {
  action: 'button_click',
  target: {
    id: buttonId,
    type: 'submit',
    context: 'form_submission'
  },
  state: {
    isValid: formIsValid,
    isDirty: formIsDirty,
    attempts: submitAttempts
  },
  timestamp: new Date().toISOString()
})
```

## Logging Patterns

### 1. Component Lifecycle
```javascript
// Component mounting
logger.info('\n=== COMPONENT INITIALIZATION ===')
logger.info('Component mounted:', {
  props,
  initialState,
  context,
  timestamp: new Date().toISOString()
})

// Component updates
logger.debug('Component updated:', {
  prevProps,
  nextProps,
  changes: detectChanges(prevProps, nextProps),
  timestamp: new Date().toISOString()
})

// Component cleanup
logger.info('\n=== COMPONENT CLEANUP ===')
logger.info('Component unmounting:', {
  finalState,
  cleanupTasks,
  timestamp: new Date().toISOString()
})
```

### 2. Data Operations
```javascript
// Database operations
logger.debug('Database operation:', {
  operation: 'query',
  table: 'users',
  params: queryParams,
  result: {
    success: !!data,
    count: data?.length,
    error: error?.message
  },
  timestamp: new Date().toISOString()
})

// API calls
logger.debug('API request:', {
  endpoint: '/api/users',
  method: 'POST',
  headers: sanitizeHeaders(headers),
  body: sanitizeBody(body),
  response: {
    status: response.status,
    success: response.ok,
    error: error?.message
  },
  timing: {
    start: startTime,
    end: endTime,
    duration: endTime - startTime
  }
})
```

### 3. State Management
```javascript
// State updates
logger.debug('State update:', {
  action: 'SET_USER',
  prev: prevState,
  next: nextState,
  changes: detectChanges(prevState, nextState),
  source: 'user_login',
  timestamp: new Date().toISOString()
})

// Context changes
logger.debug('Context change:', {
  context: 'WorkspaceContext',
  prev: prevContext,
  next: nextContext,
  consumers: activeConsumers,
  timestamp: new Date().toISOString()
})
```

### 4. Error Handling
```javascript
// Error boundaries
logger.error('Error boundary caught error:', {
  error: {
    message: error.message,
    stack: error.stack,
    type: error.name
  },
  component: {
    name: componentStack,
    props: componentProps
  },
  context: {
    route: currentRoute,
    user: userId,
    environment: process.env.NODE_ENV
  },
  timestamp: new Date().toISOString()
})

// Try-catch blocks
logger.error('Operation failed:', {
  operation: 'data_fetch',
  error: {
    message: error.message,
    code: error.code,
    details: error.details
  },
  context: {
    attempt: retryCount,
    lastSuccess: lastSuccessfulOperation,
    state: currentState
  },
  timestamp: new Date().toISOString()
})
```

## Best Practices

### 1. Log Levels
- **ERROR**: Application errors that need immediate attention
  - Database connection failures
  - API errors
  - Runtime exceptions
  - Security violations

- **WARN**: Potentially harmful situations
  - Deprecated feature usage
  - Resource constraints
  - Missing optional data
  - Fallback behavior activated

- **INFO**: General operational events
  - Application startup/shutdown
  - Configuration changes
  - User actions
  - State changes

- **DEBUG**: Detailed information for debugging
  - Function entry/exit
  - Variable values
  - State transitions
  - Performance metrics

### 2. Structure
- Always include timestamp
- Group related information logically
- Use consistent naming conventions
- Include relevant context
- Use prefixes for different modules
- Format complex objects for readability

### 3. Essential Context
- User ID/Session ID
- Environment information
- Component/Module name
- Operation being performed
- Relevant state
- Performance metrics when applicable

## Performance Considerations

### 1. Volume Management
- Use appropriate log levels
- Implement log rotation
- Consider log aggregation
- Use sampling for high-frequency events

### 2. Cost Control
- Avoid logging sensitive data
- Implement log retention policies
- Monitor logging impact on performance
- Use async logging when appropriate

### 3. Storage Optimization
- Compress logs when possible
- Implement log cleanup policies
- Use structured logging formats
- Consider log indexing for search

## Testing Checklist

Before deploying new logging:
- [ ] Verify log levels are appropriate
- [ ] Check for sensitive data exposure
- [ ] Test log rotation
- [ ] Verify error capture
- [ ] Check performance impact
- [ ] Test in all environments
- [ ] Verify log parsing works

## Common Pitfalls to Avoid

1. **Over-logging**
   - Logging everything without purpose
   - Duplicate information
   - Unnecessary details

2. **Under-logging**
   - Missing critical errors
   - Insufficient context
   - Unclear error messages

3. **Poor Structure**
   - Inconsistent formats
   - Missing timestamps
   - Unorganized information

4. **Security Issues**
   - Logging sensitive data
   - Exposing internal details
   - Missing access controls

Remember: The goal of logging is to provide enough information to understand and debug issues without overwhelming the system or compromising security.
