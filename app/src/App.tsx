import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.scss";
import { withRouter, RouteComponentProps, BrowserRouter } from "react-router-dom";
// import useUrlQueryBoundInputs, { QueryTransformation } from "./hooks/useUrlQueryBoundInputs";
import useFetchData from "./hooks/useFetchData";

// default props for AppBody component
interface AppBodyProps {
}

// enhanced AppBodyProps with router props
type EnhancedAppBodyProps = AppBodyProps & RouteComponentProps;

const fetcher = async (returnStr: string) => new Promise<string>(
  (resolve) =>  {
    setTimeout(() => {  
      resolve(returnStr);
    }, 3000);
  }
);

// main component for editing
const AppBody: React.FC<EnhancedAppBodyProps> = props => {
  const { history } = props;
  // const { search } = location;
  const [ inputValue, setInputValue ] = useState('');

  const dataFetcher = useFetchData(fetcher);

  const setSomeUrlQuery = () => {
    const text = 'check if field updates';
    history.push({ search: `?search=${text}` });
  };

  const onButtonClick = () => {
    dataFetcher.doFetch(['keso']);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        {dataFetcher.isLoading ?
          <div>Loading...</div> :
          (dataFetcher.error ?
            <div>Error occured: {dataFetcher.error}</div> :
            <div>{!!dataFetcher.data ? `Data: ${dataFetcher.data}` : 'No data yet'}</div>
          )
        }

        <div>
          <button onClick={() => setSomeUrlQuery()}>Set some query</button>
        </div>

        <div>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.currentTarget.value)}
            />
            <button onClick={onButtonClick}>Set query param</button>
        </div>

        <button onClick={dataFetcher.cancelFetch}>cancel</button>
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
