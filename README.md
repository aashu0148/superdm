# Web-Based Task Management Tool

## Note
```
I have implemented both Infinite Scroll & Classic Pagination. You can toggle it via the top right button. 
`DataTable` component is handling both types of pagination.

I have used a `fakeDb.json` file created using faker-js as DB. I am simulation api call by returning promises that resolve after a second.
As data is directly coming from the file so i can not update the data directly. Hence there are no PUT/PATCH calls which means this point won't work:
   - "The task should appear in the table of the tab corresponding to the new status when tabs are switched."
That's intentional and i don't think its any difficult to make one api call in a real DB scenario :)

Table header is sticky while you scroll down (not simple CSS)
```

## System Design

### Frontend Architecture
- React/TypeScript-based SPA
- Context API for state management (`TaskManagerContext`)
- Component-based architecture:
  - `TaskManager`: Main container component
  - `DataTable`: Reusable table component with sorting and pagination
  - `TaskDetailsDialog`: Modal view for task details
  - `ColumnSearch`: Advanced search functionality
- custom hook to manage data fetching: `useFetchTasks`

### State Management
- URL-based state persistence for:
  - Selected tab
  - Sorting preferences
  - Search queries
  - Pagination state
- Context API for global state management
- Optimized re-renders using React hooks
- Visible performance improvement via useMemo & useCallback hooks


## Running Locally

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:3002 in your browser

## Tech Stack
- React.js
- TypeScript
- React Router for navigation
- ShadCN as UI library
- Tailwind for styling
- Context API for state management
- @tanstack/react-table for table

## Bonus Features Implemented
- Column-wise search functionality
- Column-wise sorting
- Persistent UI state across page reloads
- Infinite scroll AND pagination (both)
- Keyboard shortcuts for all major actions