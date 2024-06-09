import React from "react";

function App() {
  return (
    <div className="App">
      <h1>React App</h1>
      <button
        onClick={() => {
          alert("hello world!");
        }}
      >
        Click me
      </button>
    </div>
  );
}

export default App;
