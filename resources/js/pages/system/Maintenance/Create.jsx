import { Head } from '@inertiajs/react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import MaintenanceForm from './MaintenanceForm';

export default function CreateMaintenance({ vehicles, types, prefillVehicleId }) {
    return (
        <DashboardLayout title="Add Service Record">
            <Head title="Add Service Record" />
            <MaintenanceForm
                vehicles={vehicles}
                types={types}
                prefillVehicleId={prefillVehicleId}
                submitUrl="/system/maintenance"
                method="post"
                submitLabel="Add Service Record"
            />
        </DashboardLayout>
    );
}
