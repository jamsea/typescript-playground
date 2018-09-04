import * as React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import RxPlayground from "./RxPlayground";
import RxPlaygroundButtonClick from "./RxPlaygroundButtonClick";

const App = () => {
  return (
    <Router>
      <React.Fragment>
        <Route path="/rxjs" component={RxPlayground} />
        <Route path="/rxjsButton" component={RxPlaygroundButtonClick} />
      </React.Fragment>
    </Router>
  );
};

export default App;
