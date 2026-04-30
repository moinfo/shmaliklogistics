import { Head } from '@inertiajs/react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import MaintenanceForm from './MaintenanceForm';

export default function EditMaintenance({ record, vehicles, types }) {
    return (
        <DashboardLayout title="Edit Service Record">
            <Head title="Edit Service Record" />
            <MaintenanceForm
                record={record}
                vehicles={vehicles}
                types={types}
                submitUrl={`/system/maintenance/${record.id}`}
                method="put"
                submitLabel="Save Changes"
            />
        </DashboardLayout>
    );
}
