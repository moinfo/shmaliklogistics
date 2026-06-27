import { Head } from '@inertiajs/react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import MaintenanceBulkForm from './MaintenanceBulkForm';

export default function CreateMaintenance({ vehicles, types, prefillVehicleId }) {
    return (
        <DashboardLayout title="Add Service Records">
            <Head title="Add Service Records" />
            <MaintenanceBulkForm
                vehicles={vehicles}
                types={types}
                prefillVehicleId={prefillVehicleId}
            />
        </DashboardLayout>
    );
}
