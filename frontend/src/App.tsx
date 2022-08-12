import CurrentItems from './CurrentItems';
import Navigation from './Navigation';

function App() {
  let navProps = {
    dueDate: "tomorrow",
    selectedView: "Bar",
    views: ["Foo", "Bar"]
  };

  return (
    <div>
      <Navigation {...navProps} />
      <CurrentItems selectedView={navProps.selectedView} />
    </div>
  );
}

export default App;
