import {
    createTheme,
    ThemeProvider
} from '@mui/material';
import React, {
    createContext,
    Suspense,
    useEffect,
    useState
} from 'react';
import {
    BrowserRouter,
    Redirect
} from 'react-router-dom';

import { StyledEngineProvider } from '@mui/styled-engine-sc';
import { ErrorBoundary } from 'react-error-boundary';
import AppPath from './AppPath.constants';
import Header from './components/shared/header/header.component';
import DOMLoader from './components/shared/loader/dom-loader.component';
import SnackbarComponent, { SnackProps } from './components/shared/snackbar.component';
import Routes, { RenderRoutes } from './routing';
import './styles/animations.css';

export const SnackbarContext = createContext<any>({});

const theme = createTheme({
    typography: {
        fontFamily: 'var(--font-family)'
    }
});

const App = () => {
    const [snackState, setSnackState] = useState<SnackProps>({
        message: '',
        onClose: () => setSnackState({ ...snackState, open: false }),
        severity: 'info',
        open: false
    });

    const [isLoggedIn, setLoggedIn] = useState<boolean>(false);
    const [currentPath, setCurrentPath] = useState(location.pathname);


    useEffect(() => {
        unsecuredPaths();
    }, []);

    const unsecuredPaths = () => {
        if (location.pathname.includes('live')
            || location.pathname.includes('expired')
        ) {
            console.log('here');
            setLoggedIn(true);
            setCurrentPath(location.pathname);
            return;
        } else {
            if (localStorage.getItem('auth')) {
                setLoggedIn(Boolean(localStorage.getItem('auth')));
                if (['', '/'].includes(location.pathname)) {
                    setCurrentPath(AppPath.DASHBOARD);
                } else {
                    setCurrentPath(location.pathname);
                }
                return;
            } else {
                setCurrentPath(AppPath.LOGIN);
                return;
            }
        }
    }

    // const Mode = process.env.NODE_ENV != 'production' ? React.StrictMode : ({children}: any) => (children);
    const Mode = React.StrictMode;

    return (
        <Mode>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    <ErrorBoundary fallback={<DOMLoader />}>
                        <Suspense fallback={<DOMLoader />}>
                            <SnackbarContext.Provider value={{ snackState, setSnackState }}>
                                <BrowserRouter>
                                    {isLoggedIn ? <Header /> : <Redirect to={currentPath} />}
                                    <RenderRoutes routes={Routes} />
                                    <Redirect to={currentPath} />
                                    <SnackbarComponent
                                        open={snackState.open}
                                        message={snackState.message}
                                        severity={snackState.severity}
                                        onClose={snackState.onClose}
                                        actionButton={snackState?.actionButton || undefined}
                                    />
                                </BrowserRouter>
                            </SnackbarContext.Provider>
                        </Suspense>
                    </ErrorBoundary>
                </ThemeProvider>
            </StyledEngineProvider>
        </Mode>
    );
}


export default App;
