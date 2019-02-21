import React, { Component } from 'react';
import { Route, Link, Switch } from 'react-router-dom';

import { __DEBUG__ } from 'src/config/constants';
import Home from 'src/containers/Home';
import NotFound from 'src/containers/NotFound';
import Debug from 'src/components/Debug';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
            </ul>
          </nav>
        </header>

        <main>
          <Switch>
            <Route strict exact path="/" component={Home} />
            <Route component={NotFound} />
          </Switch>
        </main>

        {__DEBUG__ && <Debug />}
      </div>
    );
  }
}

export default App;
