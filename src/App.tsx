import * as React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import RxPlayground from "./RxPlayground";

const App = () => {
  return (
    <Router>
      <React.Fragment>
        <Route path="/rxjs" component={RxPlayground} />
      </React.Fragment>
    </Router>
  );
};

export default App;
