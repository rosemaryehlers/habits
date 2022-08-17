import CurrentItems from './CurrentItems';
import Navigation from './Navigation';
import './App.css';
import GlobalProps from './GlobalProps';

function App() {
  let globalProps = {
    baseUrl: "http://localhost",
    port: 49172
  }

  let navProps = {
    dueDate: "tomorrow",
    selectedView: "Bar",
    views: ["Foo", "Bar"]
  };

  let currentItemProps = {
    selectedView: navProps.selectedView,
    global: globalProps
  }

  return (
    <div>
      <Navigation {...navProps} />
      <CurrentItems {...currentItemProps} />
    </div>
  );
}

export default App;
