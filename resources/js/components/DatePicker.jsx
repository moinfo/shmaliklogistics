import { useEffect, useRef } from 'react';
import { Box, Text } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

export default function DatePicker({
    label,
    value,
    onChange,
    error,
    required = false,
    placeholder = 'Select date…',
    minDate,
    maxDate,
    disabled = false,
    styles = {},
}) {
    const ref      = useRef(null);
    const fpRef    = useRef(null);
    const { colorScheme } = useMantineColorScheme();
    const isDark   = colorScheme === 'dark';

    const border   = isDark ? 'rgba(33,150,243,0.12)' : '#E2E8F0';
    const bg       = styles.input?.background ?? (isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC');
    const color    = styles.input?.color      ?? (isDark ? '#E2E8F0' : '#1E293B');
    const labelCol = styles.label?.color      ?? (isDark ? '#94A3B8' : '#64748B');

    useEffect(() => {
        fpRef.current = flatpickr(ref.current, {
            dateFormat:  'Y-m-d',
            altInput:    true,
            altFormat:   'D, d M Y',
            allowInput:  true,
            minDate,
            maxDate,
            disableMobile: true,
            onChange: ([date]) => {
                const formatted = date
                    ? date.toLocaleDateString('en-CA') // YYYY-MM-DD
                    : '';
                onChange(formatted);
            },
            onReady: (_, __, fp) => {
                if (fp.altInput) {
                    fp.altInput.style.cssText = `
                        background: ${bg};
                        border: 1px solid ${error ? '#EF4444' : border};
                        color: ${color};
                        border-radius: 8px;
                        padding: 8px 12px;
                        font-size: 14px;
                        width: 100%;
                        outline: none;
                        box-sizing: border-box;
                        cursor: pointer;
                    `;
                    fp.altInput.placeholder = placeholder;
                }
            },
        });

        return () => { fpRef.current?.destroy(); };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Sync value changes from outside
    useEffect(() => {
        if (fpRef.current) {
            const current = fpRef.current.selectedDates[0];
            const currentStr = current ? current.toLocaleDateString('en-CA') : '';
            if ((value ?? '') !== currentStr) {
                fpRef.current.setDate(value || null, false);
            }
        }
    }, [value]);

    // Sync border color when error changes
    useEffect(() => {
        if (fpRef.current?.altInput) {
            fpRef.current.altInput.style.border = `1px solid ${error ? '#EF4444' : border}`;
        }
    }, [error, border]);

    // Keep theme in sync when color scheme changes
    useEffect(() => {
        if (fpRef.current?.altInput) {
            fpRef.current.altInput.style.background = bg;
            fpRef.current.altInput.style.color      = color;
        }
    }, [isDark]);

    return (
        <Box style={{ position: 'relative' }}>
            {label && (
                <Text
                    component="label"
                    size="xs"
                    style={{ color: labelCol, display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500 }}
                >
                    {label}{required && <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>}
                </Text>
            )}

            {/* Hidden real input that flatpickr attaches to */}
            <input
                ref={ref}
                type="text"
                defaultValue={value ?? ''}
                style={{ display: 'none' }}
                disabled={disabled}
            />

            {error && (
                <Text size="xs" style={{ color: '#EF4444', marginTop: 4 }}>{error}</Text>
            )}
        </Box>
    );
}
