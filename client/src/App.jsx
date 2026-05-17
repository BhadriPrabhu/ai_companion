import './App.css'
import AIEmotionAnalyzer from './components/ui/avatar'
// import InteractiveAvatarDashboard from './screens/dashboard'
import Dashboard from './screens/dashboard'

function App() {


  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
      return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
      console.error("Error caught in boundary:", error, errorInfo);
    }
    render() {
      if (this.state.hasError) {
        return <h2>Something went wrong while loading the avatar.</h2>;
      }
      return this.props.children;
    }
  }



  return (
    <div>
      {/* <Dashboard/> */}
      {/* <Avatar/> */}
      <ErrorBoundary>
        <AIEmotionAnalyzer />
      </ErrorBoundary>
      {/* <Dashboard /> */}
    </div>
  )
}

export default App
