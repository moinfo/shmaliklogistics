import { Head, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../layouts/DashboardLayout';
import TripForm from './TripForm';

const dk = { textPri: '#E2E8F0', textSec: '#94A3B8' };

export default function EditTrip({ trip, statuses, drivers = [], vehicles = [] }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';

    const { data, setData, put, processing, errors } = useForm({
        status:            trip.status,
        route_from:        trip.route_from,
        route_to:          trip.route_to,
        departure_date:    trip.departure_date,
        arrival_date:      trip.arrival_date ?? '',
        driver_name:       trip.driver_name,
        vehicle_plate:     trip.vehicle_plate,
        cargo_description: trip.cargo_description ?? '',
        cargo_weight_tons: trip.cargo_weight_tons ?? '',
        freight_amount:    trip.freight_amount,
        fuel_cost:         trip.fuel_cost,
        driver_allowance:  trip.driver_allowance,
        border_costs:      trip.border_costs,
        other_costs:       trip.other_costs,
        notes:             trip.notes ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/system/trips/${trip.id}`);
    };

    return (
        <DashboardLayout title="Edit Trip">
            <Head title={`Edit ${trip.trip_number}`} />

            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: textPri }}>Edit Trip</Text>
                <Text size="sm" style={{ color: textSec }}>{trip.trip_number} — {trip.route_from} → {trip.route_to}</Text>
            </Stack>

            <TripForm
                data={data}
                setData={setData}
                errors={errors}
                statuses={statuses}
                drivers={drivers}
                vehicles={vehicles}
                processing={processing}
                onSubmit={submit}
                backHref={`/system/trips/${trip.id}`}
                submitLabel="Update Trip"
            />
        </DashboardLayout>
    );
}
