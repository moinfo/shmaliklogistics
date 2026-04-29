import { motion } from 'framer-motion';

// ── Glassmorphism style presets ──────────────────────────────
export const glass = {
    light: {
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.75)',
        boxShadow: '0 8px 32px rgba(10,22,40,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
    },
    dark: {
        background: 'rgba(10,22,40,0.45)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
    },
    brand: {
        background: 'rgba(21,101,192,0.18)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(33,150,243,0.28)',
        boxShadow: '0 8px 32px rgba(21,101,192,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
    },
    white: {
        background: 'rgba(255,255,255,0.18)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.3)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.25)',
    },
};

// Mesh blob background — drop inside a relative container
export function MeshBackground({ colors = ['#1565C0', '#2196F3', '#0A1628'] }) {
    return (
        <>
            {colors.map((c, i) => (
                <motion.div key={i} style={{
                    position: 'absolute', borderRadius: '50%', filter: 'blur(80px)',
                    width: 350 + i * 80, height: 350 + i * 80,
                    background: c, opacity: 0.18,
                    top: `${10 + i * 25}%`, left: `${5 + i * 30}%`,
                    pointerEvents: 'none', zIndex: 0,
                }}
                    animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                    transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
                />
            ))}
        </>
    );
}

export const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.7 } },
};

export const fadeLeft = {
    hidden: { opacity: 0, x: -50 },
    show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeRight = {
    hidden: { opacity: 0, x: 50 },
    show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export const stagger = (delay = 0.1) => ({
    hidden: {},
    show: { transition: { staggerChildren: delay } },
});

// Scroll-triggered wrapper
export function ScrollReveal({ children, variants = fadeUp, delay = 0, style, className }) {
    return (
        <motion.div
            variants={variants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay }}
            style={style}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Stagger container
export function StaggerContainer({ children, delay = 0.1, style }) {
    return (
        <motion.div
            variants={stagger(delay)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            style={style}
        >
            {children}
        </motion.div>
    );
}

// Hover card
export function HoverCard({ children, style, onClick }) {
    return (
        <motion.div
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ cursor: 'default', ...style }}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
}

// Count up number
export function CountUp({ value, suffix = '' }) {
    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
        >
            {value}{suffix}
        </motion.span>
    );
}
