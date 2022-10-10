import {useEffect, useRef} from "react";

const App = () => {
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/canvas');


  }, []);
  return (
    <div className="App">

    </div>
  );
};

export default App;
