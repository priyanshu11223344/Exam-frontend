import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { store } from './app/store'
import { Provider } from 'react-redux'
import { ClerkProvider } from '@clerk/react'
const clerk_key=import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if(!clerk_key){
  throw new Error("Key was not found")
}
createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ClerkProvider publishableKey={clerk_key}>
    <App />
    </ClerkProvider>
  
  </Provider>,
)
