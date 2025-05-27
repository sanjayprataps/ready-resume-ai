/**
 * Application Entry Point
 * ----------------------
 * This is the main entry point of the application that initializes the React application
 * and renders the root App component into the DOM.
 * 
 * The file:
 * 1. Imports necessary dependencies
 * 2. Creates a root React element
 * 3. Renders the main App component
 */

// Import React DOM client for rendering
import { createRoot } from 'react-dom/client'

// Import main App component and global styles
import App from './App.tsx'
import './index.css'

// Create root element and render the App component
createRoot(document.getElementById("root")!).render(<App />);
