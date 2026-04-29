import { Head, Link } from '@inertiajs/react';
import { Box, Container, Title, Text, Button, Group, Stack, Badge, SimpleGrid, Paper } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { useRef } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';
import '@mantine/carousel/styles.css';
import WebsiteLayout from '../../layouts/WebsiteLayout';
import { ScrollReveal, StaggerContainer, HoverCard, fadeUp, fadeLeft, fadeRight, glass, MeshBackground } from '../../components/Animate';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Home() {
    const autoplay = useRef(Autoplay({ delay: 5000 }));
    const { T } = useLanguage();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const { slides, stats, whyUs, services, routes, howItWorks, cta } = T.home;

    return (
        <WebsiteLayout>
            <Head title="Home — SH Malik Logistics" />

            {/* ── Hero Slider ── */}
            <Carousel
                withIndicators loop
                plugins={[autoplay.current]}
                onMouseEnter={autoplay.current.stop}
                onMouseLeave={autoplay.current.reset}
                styles={{
                    indicator: { width: 32, height: 4, background: 'rgba(255,255,255,0.35)', transition: 'all 0.3s' },
                    indicators: { bottom: 28, gap: 6 },
                    control: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', width: 44, height: 44 },
                }}
            >
                {slides.map((slide, i) => (
                    <Carousel.Slide key={i}>
                        <Box style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                            <motion.div
                                style={{ position: 'absolute', inset: 0, backgroundImage: `url(${[
                                    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1920&q=80',
                                    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1920&q=80',
                                    'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1920&q=80',
                                    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80',
                                ][i]})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                initial={{ scale: 1.08 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 8, ease: 'linear' }}
                            />
                            <Box style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(10,22,40,0.94) 0%, rgba(21,101,192,0.80) 55%, rgba(10,22,40,0.5) 100%)' }} />
                            <motion.div
                                style={{ position: 'absolute', top: '20%', right: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(33,150,243,0.15) 0%, transparent 70%)', pointerEvents: 'none' }}
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            <Container size="xl" style={{ position: 'relative', zIndex: 1 }} py={100}>
                                <Group align="flex-start" gap={60} wrap="nowrap">
                                    <Stack gap="xl" style={{ flex: 1, minWidth: 0 }}>
                                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                                            <motion.img src="/logo-icon.png" alt="SH Malik" style={{ height: 85, width: 'auto', objectFit: 'contain' }}
                                                animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
                                        </motion.div>
                                        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                                            <Badge color="brand.4" variant="light" size="lg" radius="xl" style={{ backdropFilter: 'blur(10px)' }}>{slide.badge}</Badge>
                                        </motion.div>
                                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
                                            <Title order={1} c="white" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', lineHeight: 1.1, fontWeight: 900 }}>
                                                {slide.title}{' '}
                                                <Text component="span" style={{ background: 'linear-gradient(135deg, #2196F3, #80B8FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} inherit>
                                                    {slide.highlight}
                                                </Text>
                                            </Title>
                                        </motion.div>
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}>
                                            <Text c="gray.3" size="lg" lh={1.8} maw={580}>{slide.desc}</Text>
                                        </motion.div>
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
                                            <Group gap="sm" wrap="wrap">
                                                {slide.features.map((f, fi) => (
                                                    <motion.div key={f} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 + fi * 0.1 }}>
                                                        <Box style={{ background: 'rgba(33,150,243,0.15)', border: '1px solid rgba(33,150,243,0.35)', borderRadius: 20, padding: '6px 16px', backdropFilter: 'blur(8px)' }}>
                                                            <Text c="brand.2" size="sm" fw={500}>✓ {f}</Text>
                                                        </Box>
                                                    </motion.div>
                                                ))}
                                            </Group>
                                        </motion.div>
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }}>
                                            <Group gap="md">
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                                    <Button component={Link} href="/contact" size="lg" radius="xl" color="brand.4" style={{ paddingInline: 36, boxShadow: '0 0 30px rgba(33,150,243,0.5)' }}>
                                                        {T.common.getQuote}
                                                    </Button>
                                                </motion.div>
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                                    <Button component={Link} href="/services" size="lg" radius="xl" variant="outline" color="white" style={{ paddingInline: 36 }}>
                                                        {T.common.ourServices}
                                                    </Button>
                                                </motion.div>
                                            </Group>
                                        </motion.div>
                                    </Stack>

                                    {/* Side stats card */}
                                    <Box visibleFrom="md" style={{ width: 260, flexShrink: 0 }}>
                                        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.5 }}>
                                            <Paper style={{ ...glass.dark, borderRadius: 20 }} p="xl">
                                                <Stack gap="lg">
                                                    <Text c="brand.3" fw={700} size="xs" tt="uppercase" style={{ letterSpacing: 2 }}>{T.home.quickStats}</Text>
                                                    {stats.map((s, si) => (
                                                        <motion.div key={s.label} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + si * 0.1 }}>
                                                            <Group justify="space-between" style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                                                <Text c="gray.4" size="sm">{s.icon} {s.label}</Text>
                                                                <Text c="white" fw={900} size="lg">{s.value}</Text>
                                                            </Group>
                                                        </motion.div>
                                                    ))}
                                                    <Text c="gray.6" size="xs">Buza, Dar es Salaam, TZ</Text>
                                                </Stack>
                                            </Paper>
                                        </motion.div>
                                    </Box>
                                </Group>
                            </Container>
                        </Box>
                    </Carousel.Slide>
                ))}
            </Carousel>

            {/* ── Stats Bar ── */}
            <Box style={{ background: 'linear-gradient(90deg, #0A1628 0%, #1565C0 50%, #0A1628 100%)', position: 'relative', overflow: 'hidden' }} py="xl">
                <motion.div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(33,150,243,0.1) 0%, transparent 70%)' }}
                    animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />
                <Container size="xl">
                    <StaggerContainer delay={0.15}>
                        <SimpleGrid cols={{ base: 2, sm: 4 }}>
                            {stats.map((s) => (
                                <motion.div key={s.label} variants={fadeUp}>
                                    <Stack align="center" gap={6} py="md">
                                        <Text size="1.8rem">{s.icon}</Text>
                                        <Text fw={900} style={{ fontSize: '2.2rem', lineHeight: 1, background: 'linear-gradient(135deg, #fff, #80B8FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                            {s.value}
                                        </Text>
                                        <Text c="brand.2" size="sm" fw={500}>{s.label}</Text>
                                    </Stack>
                                </motion.div>
                            ))}
                        </SimpleGrid>
                    </StaggerContainer>
                </Container>
            </Box>

            {/* ── Why Choose Us ── */}
            <Box py={100} style={{
                background: isDark
                    ? 'linear-gradient(135deg, #050E1E 0%, #0A1628 100%)'
                    : 'linear-gradient(135deg, #e8f0fe 0%, #dbeafe 50%, #eff6ff 100%)',
                position: 'relative', overflow: 'hidden',
            }}>
                <MeshBackground colors={['#1565C0', '#2196F3', '#0A3A7A']} />
                <Container size="xl">
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing={80} style={{ alignItems: 'center' }}>
                        <ScrollReveal variants={fadeLeft}>
                            <Stack gap="xl">
                                <Stack gap="sm">
                                    <Badge color="brand" variant="light" size="lg" w="fit-content">{whyUs.badge}</Badge>
                                    <Title order={2} style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', lineHeight: 1.2 }}>
                                        {whyUs.title}{' '}
                                        <Text component="span" style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} inherit>
                                            {whyUs.highlight}
                                        </Text>
                                    </Title>
                                    <Text c={isDark ? 'gray.4' : 'dimmed'} size="lg" lh={1.8}>{whyUs.desc}</Text>
                                </Stack>
                                <StaggerContainer delay={0.12}>
                                    <SimpleGrid cols={2} spacing="md">
                                        {whyUs.items.map((w) => (
                                            <motion.div key={w.title} variants={fadeUp}>
                                                <HoverCard>
                                                    <Box style={{ ...(isDark ? glass.white : glass.light), padding: 20, borderRadius: 16, height: '100%' }}>
                                                        <Text size="1.8rem" mb={10}>{w.icon}</Text>
                                                        <Text fw={700} size="sm" c={isDark ? 'brand.2' : 'brand.8'} mb={6}>{w.title}</Text>
                                                        <Text c={isDark ? 'gray.4' : 'dimmed'} size="xs" lh={1.6}>{w.desc}</Text>
                                                    </Box>
                                                </HoverCard>
                                            </motion.div>
                                        ))}
                                    </SimpleGrid>
                                </StaggerContainer>
                            </Stack>
                        </ScrollReveal>

                        <ScrollReveal variants={fadeRight}>
                            <Box style={{ borderRadius: 24, overflow: 'hidden', position: 'relative', minHeight: 460 }}>
                                <img src="https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=900&q=80" alt="Logistics" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                <motion.div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
                                    <Box style={{ ...glass.dark, borderRadius: 16, padding: '18px 22px' }}>
                                        <Group gap="md">
                                            <Box style={{ width: 8, height: 8, borderRadius: '50%', background: '#2196F3' }} />
                                            <Stack gap={2}>
                                                <Text c="white" fw={600} size="sm">{whyUs.imageBadge}</Text>
                                                <Text c="brand.3" size="xs">{whyUs.imageSubBadge}</Text>
                                            </Stack>
                                        </Group>
                                    </Box>
                                </motion.div>
                            </Box>
                        </ScrollReveal>
                    </SimpleGrid>
                </Container>
            </Box>

            {/* ── Services ── */}
            <Box py={100} style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0E4FA0 50%, #1565C0 100%)', position: 'relative', overflow: 'hidden' }}>
                <MeshBackground colors={['#2196F3', '#0A3A7A', '#4D9BFF']} />
                <Container size="xl">
                    <ScrollReveal>
                        <Stack align="center" gap="sm" mb={60}>
                            <Badge variant="light" size="lg" style={{ ...glass.white, color: '#80B8FF' }}>{services.badge}</Badge>
                            <Title order={2} ta="center" c="white" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>
                                {services.title}{' '}
                                <Text component="span" style={{ background: 'linear-gradient(135deg, #80B8FF, #2196F3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} inherit>
                                    {services.highlight}
                                </Text>
                            </Title>
                            <Text c="gray.4" ta="center" maw={500} size="lg">{services.desc}</Text>
                        </Stack>
                    </ScrollReveal>
                    <StaggerContainer delay={0.1}>
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
                            {services.items.map((s) => (
                                <motion.div key={s.title} variants={fadeUp}>
                                    <HoverCard style={{ height: '100%' }}>
                                        <Box style={{ ...glass.white, borderRadius: 20, overflow: 'hidden', height: '100%' }}>
                                            <Box style={{ padding: '28px 28px 22px', position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                                                <Box style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                                                <Text size="2.6rem">{s.icon}</Text>
                                                <Text fw={800} size="xl" c="white" mt="sm">{s.title}</Text>
                                            </Box>
                                            <Box p="xl">
                                                <Text c="gray.3" size="sm" lh={1.7} mb="lg">{s.desc}</Text>
                                                <Stack gap={8}>
                                                    {s.features.map(f => (
                                                        <Group key={f} gap={8}>
                                                            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: '#80B8FF', flexShrink: 0 }} />
                                                            <Text size="sm" c="gray.2" fw={500}>{f}</Text>
                                                        </Group>
                                                    ))}
                                                </Stack>
                                            </Box>
                                        </Box>
                                    </HoverCard>
                                </motion.div>
                            ))}
                        </SimpleGrid>
                    </StaggerContainer>
                </Container>
            </Box>

            {/* ── Routes ── */}
            <Box py={100} style={{ background: 'linear-gradient(160deg, #050E1E 0%, #0A2A5E 55%, #0E4FA0 100%)', position: 'relative', overflow: 'hidden' }}>
                <MeshBackground colors={['#1565C0', '#2196F3', '#0A3A7A']} />
                <Box style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(33,150,243,0.07) 1px, transparent 1px)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />
                <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
                    <ScrollReveal>
                        <Stack align="center" gap="sm" mb={20}>
                            <Badge variant="light" size="lg" style={{ ...glass.white, color: '#80B8FF' }}>{routes.badge}</Badge>
                            <Title order={2} ta="center" c="white" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>
                                {routes.title}{' '}
                                <Text component="span" style={{ background: 'linear-gradient(135deg, #80B8FF, #2196F3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} inherit>
                                    {routes.highlight}
                                </Text>
                            </Title>
                            <Text c="gray.4" ta="center" maw={500} size="lg">{routes.desc}</Text>
                        </Stack>
                    </ScrollReveal>

                    <ScrollReveal>
                        <Box style={{ display: 'flex', justifyContent: 'center', paddingBottom: 52 }}>
                            <motion.div
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(33,150,243,0.15)', border: '1px solid rgba(33,150,243,0.4)', borderRadius: 40, padding: '10px 26px', backdropFilter: 'blur(14px)' }}
                                animate={{ boxShadow: ['0 0 0px rgba(33,150,243,0)', '0 0 32px rgba(33,150,243,0.35)', '0 0 0px rgba(33,150,243,0)'] }}
                                transition={{ duration: 2.8, repeat: Infinity }}
                            >
                                <motion.div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2196F3' }}
                                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                                <Text c="white" fw={700} size="sm">{routes.hub}</Text>
                                <Text c="brand.3" size="sm">{routes.hubSub}</Text>
                            </motion.div>
                        </Box>
                    </ScrollReveal>

                    <StaggerContainer delay={0.12}>
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
                            {routes.items.map((r, i) => (
                                <motion.div key={r.to} variants={fadeUp} style={{ height: '100%' }}>
                                    <HoverCard style={{ height: '100%' }}>
                                        <Box style={{ ...glass.white, borderRadius: 24, overflow: 'hidden', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                                            <Box style={{ height: 3, background: 'linear-gradient(90deg, #1565C0, #2196F3, #80B8FF)', flexShrink: 0 }} />
                                            <Box style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(33,150,243,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
                                            <Box style={{ padding: '26px 24px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }} style={{ display: 'inline-block', marginBottom: 14 }}>
                                                    <Text style={{ fontSize: '3.6rem', lineHeight: 1 }}>{r.flag}</Text>
                                                </motion.div>
                                                <Text fw={900} size="xl" c="white" mb={4}>{r.country}</Text>
                                                <Box style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 14px', margin: '12px 0' }}>
                                                    <Group gap={4} align="center" wrap="nowrap">
                                                        <Stack gap={1} style={{ minWidth: 0 }}>
                                                            <Text size="9px" c="gray.5" fw={600} tt="uppercase" style={{ letterSpacing: 0.8 }}>{routes.from}</Text>
                                                            <Text size="xs" c="gray.2" fw={700} truncate>{r.from}</Text>
                                                        </Stack>
                                                        <Box style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                                                            <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}>
                                                                <Text c="brand.4" fw={900} size="lg">→</Text>
                                                            </motion.div>
                                                        </Box>
                                                        <Stack gap={1} align="flex-end" style={{ minWidth: 0 }}>
                                                            <Text size="9px" c="gray.5" fw={600} tt="uppercase" style={{ letterSpacing: 0.8 }}>{routes.to}</Text>
                                                            <Text size="xs" c="brand.3" fw={700} truncate>{r.to}</Text>
                                                        </Stack>
                                                    </Group>
                                                </Box>
                                                <Group gap="sm" mt="auto" pt={4}>
                                                    <Box style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '8px 10px' }}>
                                                        <Text size="9px" c="gray.5" tt="uppercase" fw={600} style={{ letterSpacing: 0.8 }}>{routes.distance}</Text>
                                                        <Text size="sm" fw={800} c="white">{r.distance}</Text>
                                                    </Box>
                                                    <Box style={{ flex: 1, background: 'rgba(33,150,243,0.18)', border: '1px solid rgba(33,150,243,0.25)', borderRadius: 10, padding: '8px 10px' }}>
                                                        <Text size="9px" c="gray.5" tt="uppercase" fw={600} style={{ letterSpacing: 0.8 }}>{routes.transit}</Text>
                                                        <Text size="sm" fw={800} c="brand.3">{r.time}</Text>
                                                    </Box>
                                                </Group>
                                            </Box>
                                        </Box>
                                    </HoverCard>
                                </motion.div>
                            ))}
                        </SimpleGrid>
                    </StaggerContainer>
                </Container>
            </Box>

            {/* ── How It Works ── */}
            <Box py={100} style={{ background: 'linear-gradient(160deg, #0A1628 0%, #0E4FA0 50%, #0A1628 100%)', position: 'relative', overflow: 'hidden' }}>
                <motion.div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 30% 50%, rgba(33,150,243,0.08) 0%, transparent 60%)' }}
                    animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 5, repeat: Infinity }} />
                <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
                    <ScrollReveal>
                        <Stack align="center" gap="sm" mb={60}>
                            <Badge color="brand.3" variant="light" size="lg">{howItWorks.badge}</Badge>
                            <Title order={2} ta="center" c="white" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>{howItWorks.title}</Title>
                            <Text c="gray.4" ta="center" maw={500} size="lg">{howItWorks.desc}</Text>
                        </Stack>
                    </ScrollReveal>
                    <StaggerContainer delay={0.15}>
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
                            {howItWorks.steps.map((step, i) => (
                                <motion.div key={step.n} variants={fadeUp}>
                                    <Stack gap="md" align="flex-start">
                                        <Group gap="md" align="center">
                                            <motion.div
                                                style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(33,150,243,0.15)', border: '2px solid rgba(33,150,243,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}
                                                whileHover={{ scale: 1.1, background: 'rgba(33,150,243,0.3)' }}
                                            >
                                                {step.icon}
                                            </motion.div>
                                            <Text fw={900} c="rgba(33,150,243,0.4)" style={{ fontSize: '2rem', lineHeight: 1 }}>{step.n}</Text>
                                        </Group>
                                        <Text fw={700} c="white" size="lg">{step.title}</Text>
                                        <Text c="gray.4" size="sm" lh={1.7}>{step.desc}</Text>
                                    </Stack>
                                </motion.div>
                            ))}
                        </SimpleGrid>
                    </StaggerContainer>
                </Container>
            </Box>

            {/* ── CTA ── */}
            <Box py={100} style={{
                background: isDark
                    ? 'linear-gradient(135deg, #050E1E 0%, #0A1628 100%)'
                    : 'linear-gradient(135deg, #f0f6ff 0%, #e8f0fe 100%)',
                position: 'relative', overflow: 'hidden',
            }}>
                {isDark && <MeshBackground colors={['#1565C0', '#0A3A7A', '#2196F3']} />}
                {!isDark && <Box style={{ position: 'absolute', top: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(21,101,192,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />}
                <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing={80} style={{ alignItems: 'center' }}>
                        <ScrollReveal variants={fadeLeft}>
                            <Stack gap="xl">
                                <Badge color="brand" variant="light" size="lg" w="fit-content">{cta.badge}</Badge>
                                <Title order={2} style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', lineHeight: 1.2 }}>
                                    {cta.title}{' '}
                                    <Text component="span" style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} inherit>
                                        {cta.highlight}
                                    </Text>
                                </Title>
                                <Text c={isDark ? 'gray.4' : 'dimmed'} size="lg" lh={1.8}>{cta.desc}</Text>
                                <Group gap="md">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                        <Button component={Link} href="/contact" size="lg" radius="xl" color="brand.5" style={{ paddingInline: 36, boxShadow: '0 8px 30px rgba(21,101,192,0.35)' }}>
                                            {T.common.freeQuote}
                                        </Button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                        <Button component={Link} href="/services" size="lg" radius="xl" variant="outline" color="brand.5" style={{ paddingInline: 36 }}>
                                            {T.common.viewServices}
                                        </Button>
                                    </motion.div>
                                </Group>
                            </Stack>
                        </ScrollReveal>

                        <ScrollReveal variants={fadeRight}>
                            <StaggerContainer delay={0.15}>
                                <Stack gap="md">
                                    {cta.contacts.map(item => (
                                        <motion.div key={item.label} variants={fadeUp}>
                                            <HoverCard>
                                                <Group gap="lg" style={{ ...(isDark ? glass.white : glass.light), borderRadius: 16, padding: '18px 22px' }}>
                                                    <Box style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #1565C0, #2196F3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                                                        {item.icon}
                                                    </Box>
                                                    <Stack gap={2}>
                                                        <Text size="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: 1 }}>{item.label}</Text>
                                                        <Text fw={700} c={isDark ? 'brand.2' : 'brand.8'}>{item.value}</Text>
                                                        <Text size="xs" c="dimmed">{item.sub}</Text>
                                                    </Stack>
                                                </Group>
                                            </HoverCard>
                                        </motion.div>
                                    ))}
                                </Stack>
                            </StaggerContainer>
                        </ScrollReveal>
                    </SimpleGrid>
                </Container>
            </Box>
        </WebsiteLayout>
    );
}
