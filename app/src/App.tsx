import React, { useState, useMemo } from "react";
import logo from "./logo.svg";
import "./App.scss";
import { withRouter, RouteComponentProps, BrowserRouter } from "react-router-dom";
import useUrlQueryBoundInputs, { QueryTransformation } from "./hooks/useUrlQueryBoundInputs";
import useFetchData from "./hooks/useFetchData";
import { History } from 'history';

// some async function
const fetcher = async (search: string) => new Promise<string>(
  (resolve) => setTimeout(() => resolve(Date.now().toString() + search), 1000)
);

// sets url query using history API
const setQueryParam = (queryParamName: string, value: string, history: History) => {
  const newQueryValue = !value ? '' : `?${queryParamName}=${value}`;
  history.push({ search: newQueryValue });
};

// main component for editing
const AppBody: React.FC<RouteComponentProps> = props => {
  const { location, history } = props;
  const { search } = location;

  // input control hook
  const [ inputValue, setInputValue ] = useState('');

  // transformation memoized object
  const transformation = useMemo<QueryTransformation[]>(() => [
    {
      queryParamName: 'search',
      setElementValue: setInputValue
    },
  ], []);

  // data fetcher hook
  const dataFetcher = useFetchData(fetcher);
  const { doFetch, cancelFetch } = dataFetcher;

  // url bound inputs hook
  useUrlQueryBoundInputs(Date.now().toString() + 
    search,
    transformation,
    doFetch,
    cancelFetch
  );

  // some method #2
  const setSomeUrlQuery = () => {
    const text = 'date: ' + Date.now();
    setQueryParam('search', text, history);
  };

  // some activation method #2
  const onButtonClick = () => setQueryParam('search', inputValue, history);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        {dataFetcher.isLoading ?
          <div>Loading...</div> :
          (dataFetcher.error ?
            <div>Error: {dataFetcher.error.message}</div> :
            <div>{!!dataFetcher.data ? `Data: ${dataFetcher.data}` : 'No data yet'}</div>
          )
        }

        <div>
          <button onClick={() => setSomeUrlQuery()}>TIME QUERY</button>
        </div>

        <div>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.currentTarget.value)}
            />
            <button onClick={onButtonClick}>INPUT QUERY</button>
        </div>

        <button onClick={dataFetcher.cancelFetch}>CANCEL</button>
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
