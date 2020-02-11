import React, { useState, useMemo, useCallback } from 'react';
import './App.scss';
import { withRouter, RouteComponentProps, BrowserRouter } from 'react-router-dom';
import useUrlQueryBoundInputs, { QueryTransformation } from './hooks/useUrlQueryBoundInputs';
import useFetchData from './hooks/useFetchData';
import { History } from 'history';

// some async function
const fetcher = (search: string) =>
    new Promise<string>((resolve) =>
        setTimeout(() => resolve(!!search ? `URL query at ${Date.now()}: ${search}` : 'No url query set'), 2000)
    );

// sets url query using history API
const setQueryParam = (queryParamName: string, value: string, history: History) => {
    const newQueryValue = !value ? '' : `?${queryParamName}=${value}`;
    history.push({ search: newQueryValue });
};

// main component for editing
const AppBody: React.FC<RouteComponentProps> = (props) => {
    const { location, history } = props;
    const { search } = location;

    // input control hook
    const [inputValue, setInputValue] = useState('');

    // transformation memoized object
    const transformation = useMemo<QueryTransformation[]>(
        () => [{ queryParamName: 'search', setElementValue: setInputValue }],
        [setInputValue]
    );

    // data fetcher hook
    const { loadCount, isLoading, isCanceled, data, error, doFetch, cancelFetch } = useFetchData<string>();
    const urlQueryFetcher = useCallback((query: string) => doFetch(() => fetcher(query)), [doFetch]);

    // url bound inputs hook
    useUrlQueryBoundInputs(search, transformation, urlQueryFetcher, cancelFetch);

    // input activation method
    const updateQueryFromInput = () => setQueryParam('search', inputValue, history);

    return (
        <div className='App'>
            <h3>HOW IT WORKS</h3>

            <p className='u-margin-top--none u-margin-bottom'>
                When the app loads, it first looks up the url query, sets the input value and runs url bound callback
                (this is a promise callback that uses datafetcher for demo purposes).
            </p>

            <p className='u-margin-top--none u-margin-bottom'>
                If you click "update query with url timestamp" the url query for search will be updated, which in turn
                do exactly the same as the above.
            </p>

            <p className='u-margin-top--none u-margin-bottom'>
                If you set the input and click "update query with value from input" the url query for search will be
                updated, which in turn do exactly the same as the above.
            </p>

            <h3>DEMO</h3>

            {isLoading ? (
                <div className='u-margin-bottom'>Loading...</div>
            ) : isCanceled ? (
                <div className='u-margin-bottom'>Canceled!</div>
            ) : error ? (
                <div className='u-margin-bottom'>Error: {error.message}</div>
            ) : loadCount > 0 ? (
                <div className='u-margin-bottom'>{data || 'No data retrieved'}</div>
            ) : null}

            <div className='u-margin-bottom'>
                <button onClick={() => setQueryParam('search', `date ${Date.now()}`, history)}>
                    UPDATE QUERY WITH CURRENT TIMESTAMP
                </button>
            </div>

            <div className='u-margin-bottom'>
                <input type='text' value={inputValue} onChange={(e) => setInputValue(e.currentTarget.value)} />
                <button onClick={updateQueryFromInput}>UPDATE QUERY WITH VALUE FROM INPUT</button>
            </div>

            <div className='u-margin-bottom'>
                <button onClick={cancelFetch}>CANCEL</button>
            </div>
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
