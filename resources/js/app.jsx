import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { MantineProvider, createTheme, ColorSchemeScript } from '@mantine/core';
import '@mantine/core/styles.css';
import '../css/app.css';
import { LanguageProvider } from './contexts/LanguageContext';

const theme = createTheme({
    primaryColor: 'brand',
    colors: {
        brand: [
            '#FCE9E9',
            '#F6BFBF',
            '#ED8E8E',
            '#DC5E5E',
            '#C73A3A',
            '#A82828',
            '#861E1E',
            '#631414',
            '#3F0808',
            '#1F0404',
        ],
    },
    fontFamily: 'Inter, system-ui, sans-serif',
    headings: { fontFamily: 'Inter, system-ui, sans-serif' },
});

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.jsx', { eager: true });
        return pages[`./pages/${name}.jsx`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <MantineProvider theme={theme} defaultColorScheme="light">
                <LanguageProvider>
                    <App {...props} />
                </LanguageProvider>
            </MantineProvider>
        );
    },
});
