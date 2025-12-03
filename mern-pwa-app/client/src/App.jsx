import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './pages';
import NotFoundPage from './pages/NotFoundPage'; // Assuming you will create a NotFoundPage component

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route component={NotFoundPage} />
      </Switch>
    </Router>
  );
};

export default App;