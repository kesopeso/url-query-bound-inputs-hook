import React, { useState, useRef } from "react";
import logo from "./logo.svg";
import "./App.scss";
import { withRouter, RouteComponentProps, BrowserRouter } from "react-router-dom";
import useUrlQueryBoundInputs, { QueryTransformation } from "./hooks/useUrlQueryBoundInputs";

// default props for AppBody component
interface AppBodyProps {
}

// enhanced AppBodyProps with router props
type EnhancedAppBodyProps = AppBodyProps & RouteComponentProps;

// main component for editing
const AppBody: React.FC<EnhancedAppBodyProps> = props => {
  const { location, history } = props;
  const { search } = location;
  const [ inputValue, setInputValue ] = useState('');

  const queryTransformations = useRef<QueryTransformation[]>([
    { queryParamName: "search", setElementValue: (value) => setInputValue(value) },
  ]);
  const urlQueryBoundInputs = useUrlQueryBoundInputs(search, history, queryTransformations.current);

  const setSomeUrlQuery = () => {
    const text = 'check if field updates';
    history.push({ search: `?search=${text}` });
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <div>
          <button onClick={() => setSomeUrlQuery()}>Set some query</button>
        </div>

        <div>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.currentTarget.value)}
            />
            <button onClick={() => urlQueryBoundInputs.setQueryParam("search", inputValue)}>Set query param</button>
        </div>
      </header>
    </div>
  );
};

const AppBodyWithRouter = withRouter(AppBody);

const App: React.FC = () => (
  <BrowserRouter>
    <AppBodyWithRouter />
  </BrowserRouter>
);

export default App;
