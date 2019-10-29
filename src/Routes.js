import React from "react";
import { Route, Switch } from "react-router-dom";
/* Imported components */
import AppliedRoute from "./components/AppliedRoute";
/* Imported containers */
import Home from "./containers/Home";
import NotFound from "./containers/NotFound";
import Training from "./containers/Training";

export default ({ childProps }) => (
  <Switch>
    <AppliedRoute path="/" exact component={Home} props={childProps} />
    <AppliedRoute
      path="/training"
      exact
      component={Training}
      props={childProps}
    />
    {/* Finally, catch all unmatched routes */}
    <Route component={NotFound} />
  </Switch>
);
